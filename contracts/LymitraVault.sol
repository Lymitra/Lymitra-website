// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./interfaces/IAgentPlatform.sol";
import "./interfaces/IReactivity.sol";
import "./interfaces/IERC20Minimal.sol";

/**
 * Lymitra Vault — autonomous payroll in USDC, powered by Somnia agents.
 *
 * Flow:
 *   1. Company registers + deposits USDC
 *   2. Company adds employees with monthly salary (USDC, 6 dec)
 *   3. Company calls schedulePayroll(timestampMs) → Reactivity registers callback
 *   4. At payroll time, Reactivity fires _onScheduledPayroll
 *   5. Contract requests ETH/USDC rate via JSON API agent
 *   6. Rate callback → requests LLM decision (CONVERT | WAIT)
 *   7. If CONVERT → transfers USDC to all active employees
 *      If WAIT    → re-schedules 24 h later
 */
contract LymitraVault {
    // ─── Somnia infrastructure ──────────────────────────────────────────────
    IAgentRequester public constant PLATFORM =
        IAgentRequester(0x037Bb9C718F3f7fe5eCBDB0b600D607b52706776);

    address public constant REACTIVITY = 0x0000000000000000000000000000000000000100;
    address public constant USDC       = 0x28BEc7E30E6faee657a03e19Bf1128AaD7632A00;

    // Agent IDs — from https://agents.testnet.somnia.network
    uint256 public constant JSON_API_AGENT_ID = 13174292974160097713;
    uint256 public constant LLM_AGENT_ID      = 12847293847561029384;

    // Both agents cost 0.12 STT per request
    uint256 public constant REQUEST_DEPOSIT = 12e16;

    // ─── Data types ─────────────────────────────────────────────────────────
    struct Employee {
        address wallet;
        uint256 salaryUsdc; // 6-decimal USDC units
        bool    active;
        string  name;
    }

    struct Company {
        address owner;
        uint256 usdcBalance;
        uint256 nextPayrollMs; // unix milliseconds
        bool    agentsEnabled;
        string  name;
    }

    enum ReqType { RATE_FETCH, LLM_DECISION }

    struct PendingRequest {
        address  company;
        ReqType  reqType;
        uint256  fetchedRate;
    }

    // ─── State ───────────────────────────────────────────────────────────────
    address public owner;

    mapping(address => Company)    public companies;
    mapping(address => Employee[]) public employees;
    mapping(address => uint256)    public monthlyPayroll;

    mapping(uint256 => PendingRequest) public pendingRequests;

    // ─── Events ──────────────────────────────────────────────────────────────
    event CompanyRegistered(address indexed company, string name);
    event Deposited(address indexed company, uint256 amount);
    event Withdrawn(address indexed company, uint256 amount);
    event EmployeeAdded(address indexed company, address indexed wallet, uint256 salary);
    event EmployeeRemoved(address indexed company, uint256 index);
    event PayrollScheduled(address indexed company, uint64 timestampMs);
    event RateRequested(address indexed company, uint256 requestId);
    event LLMDecisionRequested(address indexed company, uint256 requestId, uint256 rate);
    event PayrollExecuted(address indexed company, uint256 totalPaid, string decision);
    event PayrollDeferred(address indexed company, uint64 retryMs);

    // ─── Modifiers ───────────────────────────────────────────────────────────
    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    modifier onlyRegistered() {
        require(companies[msg.sender].owner == msg.sender, "not registered");
        _;
    }

    modifier onlyPlatform() {
        require(msg.sender == address(PLATFORM), "not platform");
        _;
    }

    // ─── Constructor ─────────────────────────────────────────────────────────
    constructor() {
        owner = msg.sender;
    }

    // ─── Company lifecycle ───────────────────────────────────────────────────
    function registerCompany(string calldata companyName) external {
        require(companies[msg.sender].owner == address(0), "already registered");
        companies[msg.sender] = Company({
            owner:         msg.sender,
            usdcBalance:   0,
            nextPayrollMs: 0,
            agentsEnabled: false,
            name:          companyName
        });
        emit CompanyRegistered(msg.sender, companyName);
    }

    function deposit(uint256 amount) external onlyRegistered {
        require(
            IERC20Minimal(USDC).transferFrom(msg.sender, address(this), amount),
            "transfer failed"
        );
        companies[msg.sender].usdcBalance += amount;
        emit Deposited(msg.sender, amount);
    }

    function withdraw(uint256 amount) external onlyRegistered {
        Company storage co = companies[msg.sender];
        require(co.usdcBalance >= amount, "insufficient balance");
        co.usdcBalance -= amount;
        require(IERC20Minimal(USDC).transfer(msg.sender, amount), "transfer failed");
        emit Withdrawn(msg.sender, amount);
    }

    // ─── Employee management ─────────────────────────────────────────────────
    function addEmployee(
        address wallet,
        uint256 salaryUsdc,
        string calldata empName
    ) external onlyRegistered {
        require(wallet != address(0), "zero address");
        require(salaryUsdc > 0, "zero salary");
        employees[msg.sender].push(Employee({
            wallet:     wallet,
            salaryUsdc: salaryUsdc,
            active:     true,
            name:       empName
        }));
        monthlyPayroll[msg.sender] += salaryUsdc;
        emit EmployeeAdded(msg.sender, wallet, salaryUsdc);
    }

    function removeEmployee(uint256 index) external onlyRegistered {
        Employee[] storage emps = employees[msg.sender];
        require(index < emps.length, "out of range");
        require(emps[index].active, "already inactive");
        monthlyPayroll[msg.sender] -= emps[index].salaryUsdc;
        emps[index].active = false;
        emit EmployeeRemoved(msg.sender, index);
    }

    // ─── Payroll scheduling via Reactivity ───────────────────────────────────
    function schedulePayroll(uint64 timestampMs) external onlyRegistered {
        require(timestampMs > block.timestamp * 1000, "must be future");
        require(monthlyPayroll[msg.sender] > 0, "no employees");

        companies[msg.sender].nextPayrollMs = timestampMs;
        companies[msg.sender].agentsEnabled = true;

        IReactivity(REACTIVITY).scheduleSubscriptionAtTimestamp(
            address(this),
            this._onScheduledPayroll.selector,
            timestampMs
        );

        emit PayrollScheduled(msg.sender, timestampMs);
    }

    // ─── Reactivity callback ──────────────────────────────────────────────────
    function _onScheduledPayroll(
        address, /*emitter*/
        bytes32[] calldata, /*topics*/
        bytes calldata data
    ) external {
        require(msg.sender == REACTIVITY, "not reactivity");
        address company = abi.decode(data, (address));
        _startPayrollSequence(company);
    }

    // ─── Internal: agent-driven payroll sequence ─────────────────────────────
    function _startPayrollSequence(address company) internal {
        if (!companies[company].agentsEnabled) return;

        require(address(this).balance >= REQUEST_DEPOSIT, "low STT balance");

        // Fetch ETH/USDC spot price via JSON API agent
        bytes memory payload = abi.encodeWithSelector(
            IJsonApiAgent.fetchUint.selector,
            "https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDC",
            "$.price",
            uint8(2)
        );

        uint256 reqId = PLATFORM.createRequest{value: REQUEST_DEPOSIT}(
            JSON_API_AGENT_ID,
            address(this),
            this.handleRateResponse.selector,
            payload
        );

        pendingRequests[reqId] = PendingRequest({
            company:     company,
            reqType:     ReqType.RATE_FETCH,
            fetchedRate: 0
        });

        emit RateRequested(company, reqId);
    }

    // ─── Agent callback: rate fetch result ────────────────────────────────────
    function handleRateResponse(
        uint256 requestId,
        Response[] memory responses,
        ResponseStatus status,
        Request memory /*details*/
    ) external onlyPlatform {
        PendingRequest storage req = pendingRequests[requestId];
        require(req.company != address(0), "unknown request");

        address company = req.company;
        delete pendingRequests[requestId];

        if (status != ResponseStatus.Success || responses.length == 0) {
            // Fallback: execute directly on agent failure
            _executePayroll(company, "FALLBACK");
            return;
        }

        uint256 rate = abi.decode(responses[0].result, (uint256));

        require(address(this).balance >= REQUEST_DEPOSIT, "low STT balance");

        string memory rateStr = string(
            abi.encodePacked(_uint2str(rate / 100), ".", _uint2str(rate % 100))
        );

        string[] memory allowed = new string[](2);
        allowed[0] = "CONVERT";
        allowed[1] = "WAIT";

        bytes memory payload = abi.encodeWithSelector(
            ILLMAgent.inferString.selector,
            string(abi.encodePacked(
                "ETH/USDC rate is $", rateStr,
                ". Should Lymitra execute payroll now and convert holdings to USDC? ",
                "Consider: stable rate = good time, high volatility = wait."
            )),
            "You are an on-chain DeFi payroll optimizer for Lymitra. Output exactly one of the allowed values.",
            false,
            allowed
        );

        uint256 llmReqId = PLATFORM.createRequest{value: REQUEST_DEPOSIT}(
            LLM_AGENT_ID,
            address(this),
            this.handleLLMResponse.selector,
            payload
        );

        pendingRequests[llmReqId] = PendingRequest({
            company:     company,
            reqType:     ReqType.LLM_DECISION,
            fetchedRate: rate
        });

        emit LLMDecisionRequested(company, llmReqId, rate);
    }

    // ─── Agent callback: LLM decision result ─────────────────────────────────
    function handleLLMResponse(
        uint256 requestId,
        Response[] memory responses,
        ResponseStatus status,
        Request memory /*details*/
    ) external onlyPlatform {
        PendingRequest storage req = pendingRequests[requestId];
        require(req.company != address(0), "unknown request");

        address company = req.company;
        delete pendingRequests[requestId];

        string memory decision = "CONVERT";

        if (status == ResponseStatus.Success && responses.length > 0) {
            decision = abi.decode(responses[0].result, (string));
        }

        if (keccak256(bytes(decision)) == keccak256(bytes("CONVERT"))) {
            _executePayroll(company, decision);
        } else {
            // Defer 24 h — re-schedule via Reactivity
            uint64 retryMs = uint64((block.timestamp + 1 days) * 1000);
            companies[company].nextPayrollMs = retryMs;

            IReactivity(REACTIVITY).scheduleSubscriptionAtTimestamp(
                address(this),
                this._onScheduledPayroll.selector,
                retryMs
            );

            emit PayrollDeferred(company, retryMs);
        }
    }

    // ─── Payroll execution ───────────────────────────────────────────────────
    function _executePayroll(address company, string memory decision) internal {
        Company storage co = companies[company];
        uint256 total      = monthlyPayroll[company];

        require(total > 0, "no payroll");
        require(co.usdcBalance >= total, "insufficient USDC");

        co.usdcBalance -= total;

        Employee[] storage emps = employees[company];
        for (uint256 i = 0; i < emps.length; i++) {
            if (emps[i].active) {
                require(
                    IERC20Minimal(USDC).transfer(emps[i].wallet, emps[i].salaryUsdc),
                    "transfer failed"
                );
            }
        }

        emit PayrollExecuted(company, total, decision);
    }

    // Manual trigger — company owner can force-run payroll
    function executePayrollManual() external onlyRegistered {
        _executePayroll(msg.sender, "MANUAL");
    }

    // ─── View helpers ─────────────────────────────────────────────────────────
    function getEmployees(address company) external view returns (Employee[] memory) {
        return employees[company];
    }

    function getCompany(address company) external view returns (Company memory) {
        return companies[company];
    }

    function vaultBalance() external view returns (uint256) {
        return IERC20Minimal(USDC).balanceOf(address(this));
    }

    // ─── STT management ──────────────────────────────────────────────────────
    receive() external payable {}

    function withdrawSTT(uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "insufficient STT");
        payable(owner).transfer(amount);
    }

    // ─── Internal utils ───────────────────────────────────────────────────────
    function _uint2str(uint256 v) internal pure returns (string memory) {
        if (v == 0) return "0";
        uint256 n = v;
        uint256 digits;
        while (n != 0) { digits++; n /= 10; }
        bytes memory buf = new bytes(digits);
        while (v != 0) {
            digits--;
            buf[digits] = bytes1(uint8(48 + v % 10));
            v /= 10;
        }
        return string(buf);
    }
}
