// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./interfaces/IAgentPlatform.sol";
import "./interfaces/IReactivity.sol";
import "./interfaces/IERC20Minimal.sol";

interface IWSTT {
    function deposit() external payable;
    function approve(address spender, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

interface IDEXRouter {
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);

    function getAmountsOut(uint256 amountIn, address[] calldata path)
        external view returns (uint256[] memory amounts);
}

// Chainlink AggregatorV3Interface — DIA and Protofire adapters implement this
interface IAggregatorV3 {
    function latestRoundData() external view returns (
        uint80 roundId,
        int256 answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    );
    function decimals() external view returns (uint8);
}

/**
 * Lymitra Vault — autonomous payroll powered by Somnia agents + Lymitra DEX.
 *
 * Price data: DIA oracle adapters (on-chain, free, no async round-trip).
 *   SOMI/USD: DIA testnet adapter 0xaEAa92c38939775d3be39fFA832A92611f7D6aDe
 *   WETH/USD: DIA testnet adapter 0x786c7893F8c26b80d42088749562eDb50Ba9601E
 *
 * Flow:
 *   1. Company registers
 *   2. Company deposits SOMI (native) or WETH (ERC-20)
 *   3. Company adds employees with USDC salaries
 *   4. Company schedules payroll → Reactivity registers callback
 *   5. At payroll time: oracle prices are read synchronously, LLM decides CONVERT or WAIT
 *   6. CONVERT → vault swaps all held tokens to USDC via DEX → pays employees
 *      WAIT    → re-schedules 24 h, waits for better rate
 */
contract LymitraVault {
    // ─── Somnia infrastructure ──────────────────────────────────────────────
    IAgentRequester public constant PLATFORM =
        IAgentRequester(0x037Bb9C718F3f7fe5eCBDB0b600D607b52706776);

    address public constant REACTIVITY = 0x0000000000000000000000000000000000000100;

    // ─── DIA oracle adapters (Somnia Shannon Testnet) ───────────────────────
    address public constant SOMI_ORACLE = 0xaEAa92c38939775d3be39fFA832A92611f7D6aDe;
    address public constant WETH_ORACLE = 0x786c7893F8c26b80d42088749562eDb50Ba9601E;

    address public immutable USDC;
    address public immutable WSTT;
    address public immutable WETH;
    address public immutable DEX_ROUTER;

    uint256 public constant LLM_AGENT_ID   = 12847293847561029384;
    uint256 public constant REQUEST_DEPOSIT = 12e16;

    // ─── Data types ─────────────────────────────────────────────────────────
    struct Employee {
        address wallet;
        uint256 salaryUsdc;
        bool    active;
        string  name;
    }

    struct Company {
        address owner;
        uint256 usdcBalance;   // USDC ready for payroll (6 dec)
        uint256 somiBalance;   // Native STT/SOMI wrapped as WSTT (18 dec)
        uint256 wethBalance;   // Bridged WETH deposited (18 dec)
        uint256 nextPayrollMs;
        bool    agentsEnabled;
        string  name;
    }

    struct PendingRequest {
        address company;
    }

    // ─── State ───────────────────────────────────────────────────────────────
    address public owner;

    mapping(address => Company)    public companies;
    mapping(address => Employee[]) public employees;
    mapping(address => uint256)    public monthlyPayroll;
    mapping(uint256 => PendingRequest) public pendingRequests;

    // ─── Events ──────────────────────────────────────────────────────────────
    event CompanyRegistered(address indexed company, string name);
    event SomiDeposited(address indexed company, uint256 amount);
    event WethDeposited(address indexed company, uint256 amount);
    event TokensSwapped(address indexed company, address token, uint256 amountIn, uint256 usdcOut);
    event Deposited(address indexed company, uint256 amount);
    event Withdrawn(address indexed company, uint256 amount);
    event EmployeeAdded(address indexed company, address indexed wallet, uint256 salary);
    event EmployeeRemoved(address indexed company, uint256 index);
    event PayrollScheduled(address indexed company, uint64 timestampMs);
    event LLMDecisionRequested(address indexed company, uint256 requestId, uint256 somiUsd, uint256 wethUsd);
    event PayrollExecuted(address indexed company, uint256 totalPaid, string decision);
    event PayrollDeferred(address indexed company, uint64 retryMs);

    // ─── Modifiers ───────────────────────────────────────────────────────────
    modifier onlyOwner()     { require(msg.sender == owner, "not owner"); _; }
    modifier onlyRegistered(){ require(companies[msg.sender].owner == msg.sender, "not registered"); _; }
    modifier onlyPlatform()  { require(msg.sender == address(PLATFORM), "not platform"); _; }

    // ─── Constructor ─────────────────────────────────────────────────────────
    constructor(address _usdc, address _wstt, address _weth, address _dexRouter) {
        require(_usdc != address(0) && _wstt != address(0) && _weth != address(0) && _dexRouter != address(0), "zero addr");
        USDC       = _usdc;
        WSTT       = _wstt;
        WETH       = _weth;
        DEX_ROUTER = _dexRouter;
        owner      = msg.sender;
    }

    // ─── Company lifecycle ───────────────────────────────────────────────────
    function registerCompany(string calldata companyName) external {
        require(companies[msg.sender].owner == address(0), "already registered");
        companies[msg.sender] = Company({
            owner: msg.sender, usdcBalance: 0, somiBalance: 0, wethBalance: 0,
            nextPayrollMs: 0, agentsEnabled: false, name: companyName
        });
        emit CompanyRegistered(msg.sender, companyName);
    }

    // ─── Deposit: native SOMI/STT ─────────────────────────────────────────────
    function depositSomi() external payable onlyRegistered {
        require(msg.value > 0, "send SOMI");
        IWSTT(WSTT).deposit{value: msg.value}();
        companies[msg.sender].somiBalance += msg.value;
        emit SomiDeposited(msg.sender, msg.value);
    }

    // ─── Deposit: WETH (bridged Ethereum) ────────────────────────────────────
    function depositWeth(uint256 amount) external onlyRegistered {
        require(amount > 0, "zero amount");
        require(IERC20Minimal(WETH).transferFrom(msg.sender, address(this), amount), "transfer failed");
        companies[msg.sender].wethBalance += amount;
        emit WethDeposited(msg.sender, amount);
    }

    // ─── Deposit: direct USDC (legacy/testing) ────────────────────────────────
    function deposit(uint256 amount) external onlyRegistered {
        require(IERC20Minimal(USDC).transferFrom(msg.sender, address(this), amount), "transfer failed");
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
    function addEmployee(address wallet, uint256 salaryUsdc, string calldata empName) external onlyRegistered {
        require(wallet != address(0) && salaryUsdc > 0, "invalid params");
        employees[msg.sender].push(Employee({ wallet: wallet, salaryUsdc: salaryUsdc, active: true, name: empName }));
        monthlyPayroll[msg.sender] += salaryUsdc;
        emit EmployeeAdded(msg.sender, wallet, salaryUsdc);
    }

    function removeEmployee(uint256 index) external onlyRegistered {
        Employee[] storage emps = employees[msg.sender];
        require(index < emps.length && emps[index].active, "invalid");
        monthlyPayroll[msg.sender] -= emps[index].salaryUsdc;
        emps[index].active = false;
        emit EmployeeRemoved(msg.sender, index);
    }

    // ─── Payroll scheduling ───────────────────────────────────────────────────
    function schedulePayroll(uint64 timestampMs) external onlyRegistered {
        require(timestampMs > block.timestamp * 1000, "must be future");
        require(monthlyPayroll[msg.sender] > 0, "no employees");
        companies[msg.sender].nextPayrollMs = timestampMs;
        companies[msg.sender].agentsEnabled = true;
        IReactivity(REACTIVITY).scheduleSubscriptionAtTimestamp(
            address(this), this._onScheduledPayroll.selector, timestampMs
        );
        emit PayrollScheduled(msg.sender, timestampMs);
    }

    // ─── Reactivity callback ──────────────────────────────────────────────────
    function _onScheduledPayroll(address, bytes32[] calldata, bytes calldata data) external {
        require(msg.sender == REACTIVITY, "not reactivity");
        _startPayrollSequence(abi.decode(data, (address)));
    }

    // ─── Oracle read helpers ──────────────────────────────────────────────────
    // Returns price in 6-decimal USD (e.g. $0.031 → 31000, $2500 → 2500000000)
    function _readOracle(address oracle) internal view returns (uint256 usdPrice6) {
        try IAggregatorV3(oracle).latestRoundData() returns (
            uint80, int256 answer, uint256, uint256, uint80
        ) {
            if (answer <= 0) return 0;
            uint8 dec = IAggregatorV3(oracle).decimals();
            // Normalize to 6 decimal places
            if (dec >= 6) {
                usdPrice6 = uint256(answer) / (10 ** uint256(dec - 6));
            } else {
                usdPrice6 = uint256(answer) * (10 ** uint256(6 - dec));
            }
        } catch {
            usdPrice6 = 0;
        }
    }

    // ─── Agent-driven payroll sequence ───────────────────────────────────────
    function _startPayrollSequence(address company) internal {
        if (!companies[company].agentsEnabled) return;
        require(address(this).balance >= REQUEST_DEPOSIT, "low STT");

        // Read both oracle prices synchronously — no async round-trip needed
        uint256 somiUsd = _readOracle(SOMI_ORACLE); // e.g. 31000 = $0.031000
        uint256 wethUsd = _readOracle(WETH_ORACLE); // e.g. 2500000000 = $2500.000000

        string memory somiStr = _fmtPrice6(somiUsd);
        string memory wethStr = _fmtPrice6(wethUsd);

        string[] memory allowed = new string[](2);
        allowed[0] = "CONVERT"; allowed[1] = "WAIT";

        bytes memory payload = abi.encodeWithSelector(
            ILLMAgent.inferString.selector,
            string(abi.encodePacked(
                "SOMI/USD $", somiStr, ", ETH/USD $", wethStr,
                ". Should Lymitra swap all SOMI and ETH holdings to USDC and pay employees now? ",
                "Convert when rates are stable or rising. Wait 24h if dropping fast."
            )),
            "You are an on-chain DeFi payroll optimizer for Lymitra. Output exactly one of the allowed values.",
            false, allowed
        );

        uint256 reqId = PLATFORM.createRequest{value: REQUEST_DEPOSIT}(
            LLM_AGENT_ID, address(this), this.handleLLMResponse.selector, payload
        );
        pendingRequests[reqId] = PendingRequest({ company: company });
        emit LLMDecisionRequested(company, reqId, somiUsd, wethUsd);
    }

    // ─── LLM callback ─────────────────────────────────────────────────────────
    function handleLLMResponse(
        uint256 requestId, Response[] memory responses, ResponseStatus status, Request memory
    ) external onlyPlatform {
        PendingRequest storage req = pendingRequests[requestId];
        require(req.company != address(0), "unknown");
        address company = req.company;
        delete pendingRequests[requestId];

        string memory decision = "CONVERT";
        if (status == ResponseStatus.Success && responses.length > 0) {
            decision = abi.decode(responses[0].result, (string));
        }

        if (keccak256(bytes(decision)) == keccak256(bytes("CONVERT"))) {
            _convertAllToUsdc(company);
            _executePayroll(company, decision);
        } else {
            uint64 retryMs = uint64((block.timestamp + 1 days) * 1000);
            companies[company].nextPayrollMs = retryMs;
            IReactivity(REACTIVITY).scheduleSubscriptionAtTimestamp(
                address(this), this._onScheduledPayroll.selector, retryMs
            );
            emit PayrollDeferred(company, retryMs);
        }
    }

    // ─── Convert all token holdings → USDC via Lymitra DEX ──────────────────
    function _convertAllToUsdc(address company) internal {
        Company storage co = companies[company];

        // Swap WSTT → USDC
        if (co.somiBalance > 0) {
            uint256 wsttAmt = co.somiBalance;
            co.somiBalance = 0;
            IWSTT(WSTT).approve(DEX_ROUTER, wsttAmt);
            address[] memory path = new address[](2);
            path[0] = WSTT; path[1] = USDC;
            uint256[] memory out = IDEXRouter(DEX_ROUTER).swapExactTokensForTokens(
                wsttAmt, 0, path, address(this), block.timestamp + 5 minutes
            );
            co.usdcBalance += out[out.length - 1];
            emit TokensSwapped(company, WSTT, wsttAmt, out[out.length - 1]);
        }

        // Swap WETH → USDC
        if (co.wethBalance > 0) {
            uint256 wethAmt = co.wethBalance;
            co.wethBalance = 0;
            IERC20Minimal(WETH).approve(DEX_ROUTER, wethAmt);
            address[] memory path = new address[](2);
            path[0] = WETH; path[1] = USDC;
            uint256[] memory out = IDEXRouter(DEX_ROUTER).swapExactTokensForTokens(
                wethAmt, 0, path, address(this), block.timestamp + 5 minutes
            );
            co.usdcBalance += out[out.length - 1];
            emit TokensSwapped(company, WETH, wethAmt, out[out.length - 1]);
        }
    }

    // ─── Pay employees ────────────────────────────────────────────────────────
    function _executePayroll(address company, string memory decision) internal {
        Company storage co = companies[company];
        uint256 total = monthlyPayroll[company];
        require(total > 0, "no payroll");
        require(co.usdcBalance >= total, "insufficient USDC");
        co.usdcBalance -= total;
        Employee[] storage emps = employees[company];
        for (uint256 i = 0; i < emps.length; i++) {
            if (emps[i].active) {
                require(IERC20Minimal(USDC).transfer(emps[i].wallet, emps[i].salaryUsdc), "transfer failed");
            }
        }
        emit PayrollExecuted(company, total, decision);
    }

    // Manual trigger: convert + pay immediately (no AI)
    function executePayrollManual() external onlyRegistered {
        _convertAllToUsdc(msg.sender);
        _executePayroll(msg.sender, "MANUAL");
    }

    // ─── Views ────────────────────────────────────────────────────────────────
    function getEmployees(address company) external view returns (Employee[] memory) { return employees[company]; }
    function getCompany(address company) external view returns (Company memory) { return companies[company]; }
    function vaultBalance() external view returns (uint256) { return IERC20Minimal(USDC).balanceOf(address(this)); }

    // Read current oracle prices (useful for UI / testing)
    function getSomiUsdPrice() external view returns (uint256) { return _readOracle(SOMI_ORACLE); }
    function getWethUsdPrice() external view returns (uint256) { return _readOracle(WETH_ORACLE); }

    receive() external payable {}
    function withdrawSTT(uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "insufficient STT");
        payable(owner).transfer(amount);
    }

    // ─── Price formatting helpers ─────────────────────────────────────────────
    // Format a 6-decimal USD price as "X.YYYYYY" string
    function _fmtPrice6(uint256 v) internal pure returns (string memory) {
        uint256 whole = v / 1e6;
        uint256 frac  = v % 1e6;
        return string(abi.encodePacked(_uint2str(whole), ".", _pad6(frac)));
    }

    function _uint2str(uint256 v) internal pure returns (string memory) {
        if (v == 0) return "0";
        uint256 n = v; uint256 d;
        while (n != 0) { d++; n /= 10; }
        bytes memory buf = new bytes(d);
        while (v != 0) { d--; buf[d] = bytes1(uint8(48 + v % 10)); v /= 10; }
        return string(buf);
    }

    function _pad6(uint256 v) internal pure returns (string memory) {
        bytes memory buf = new bytes(6);
        for (uint256 i = 6; i > 0; i--) { buf[i - 1] = bytes1(uint8(48 + v % 10)); v /= 10; }
        return string(buf);
    }
}
