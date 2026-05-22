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
 * Lymitra Vault — multi-token autonomous payroll on Somnia.
 *
 * Volatile deposits (AI converts to USDC at best rate):
 *   SOMI  — native Somnia token (wraps to WSTT → DEX swap)
 *   WETH  — bridged Ethereum ERC-20
 *   WBTC  — bridged Bitcoin ERC-20 (8 dec)
 *   WBNB  — bridged BNB ERC-20
 *
 * Stable deposits (held as payroll reserve, no conversion):
 *   USDC  — primary stablecoin
 *   USDT  — secondary stablecoin (tracked alongside USDC)
 *
 * Oracles (DIA adapters — AggregatorV3Interface, Somnia Shannon Testnet):
 *   SOMI  0xaEAa92c38939775d3be39fFA832A92611f7D6aDe
 *   WETH  0x786c7893F8c26b80d42088749562eDb50Ba9601E
 *   WBTC  0x4803db1ca3A1DA49c3DB991e1c390321c20e1f21
 *   WBNB  (no testnet oracle — oracle read returns 0 safely)
 */
contract LymitraVault {
    // ─── Somnia infrastructure ──────────────────────────────────────────────
    IAgentRequester public constant PLATFORM =
        IAgentRequester(0x037Bb9C718F3f7fe5eCBDB0b600D607b52706776);

    address public constant REACTIVITY = 0x0000000000000000000000000000000000000100;

    // ─── DIA oracle adapters (Somnia Shannon Testnet) ───────────────────────
    address public constant SOMI_ORACLE = 0xaEAa92c38939775d3be39fFA832A92611f7D6aDe;
    address public constant WETH_ORACLE = 0x786c7893F8c26b80d42088749562eDb50Ba9601E;
    address public constant WBTC_ORACLE = 0x4803db1ca3A1DA49c3DB991e1c390321c20e1f21;
    // WBNB: no testnet oracle — _readOracle returns 0 gracefully

    address public immutable USDC;
    address public immutable USDT;
    address public immutable WSTT;
    address public immutable WETH;
    address public immutable WBTC;
    address public immutable WBNB;
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
        // Stable reserves (payroll-ready, 6 dec)
        uint256 usdcBalance;
        uint256 usdtBalance;
        // Volatile holdings (AI converts to USDC, native dec)
        uint256 somiBalance;   // 18 dec
        uint256 wethBalance;   // 18 dec
        uint256 wbtcBalance;   // 8 dec
        uint256 wbnbBalance;   // 18 dec
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
    event WbtcDeposited(address indexed company, uint256 amount);
    event WbnbDeposited(address indexed company, uint256 amount);
    event UsdcDeposited(address indexed company, uint256 amount);
    event UsdtDeposited(address indexed company, uint256 amount);
    event TokensSwapped(address indexed company, address token, uint256 amountIn, uint256 usdcOut);
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
    constructor(
        address _usdc, address _usdt,
        address _wstt, address _weth, address _wbtc, address _wbnb,
        address _dexRouter
    ) {
        require(
            _usdc != address(0) && _usdt != address(0) &&
            _wstt != address(0) && _weth != address(0) &&
            _wbtc != address(0) && _wbnb != address(0) &&
            _dexRouter != address(0),
            "zero addr"
        );
        USDC       = _usdc;
        USDT       = _usdt;
        WSTT       = _wstt;
        WETH       = _weth;
        WBTC       = _wbtc;
        WBNB       = _wbnb;
        DEX_ROUTER = _dexRouter;
        owner      = msg.sender;
    }

    // ─── Company lifecycle ───────────────────────────────────────────────────
    function registerCompany(string calldata companyName) external {
        require(companies[msg.sender].owner == address(0), "already registered");
        companies[msg.sender] = Company({
            owner: msg.sender,
            usdcBalance: 0, usdtBalance: 0,
            somiBalance: 0, wethBalance: 0, wbtcBalance: 0, wbnbBalance: 0,
            nextPayrollMs: 0, agentsEnabled: false, name: companyName
        });
        emit CompanyRegistered(msg.sender, companyName);
    }

    // ─── Volatile deposits ────────────────────────────────────────────────────

    function depositSomi() external payable onlyRegistered {
        require(msg.value > 0, "send SOMI");
        IWSTT(WSTT).deposit{value: msg.value}();
        companies[msg.sender].somiBalance += msg.value;
        emit SomiDeposited(msg.sender, msg.value);
    }

    function depositWeth(uint256 amount) external onlyRegistered {
        require(amount > 0, "zero");
        require(IERC20Minimal(WETH).transferFrom(msg.sender, address(this), amount), "transfer failed");
        companies[msg.sender].wethBalance += amount;
        emit WethDeposited(msg.sender, amount);
    }

    function depositWbtc(uint256 amount) external onlyRegistered {
        require(amount > 0, "zero");
        require(IERC20Minimal(WBTC).transferFrom(msg.sender, address(this), amount), "transfer failed");
        companies[msg.sender].wbtcBalance += amount;
        emit WbtcDeposited(msg.sender, amount);
    }

    function depositWbnb(uint256 amount) external onlyRegistered {
        require(amount > 0, "zero");
        require(IERC20Minimal(WBNB).transferFrom(msg.sender, address(this), amount), "transfer failed");
        companies[msg.sender].wbnbBalance += amount;
        emit WbnbDeposited(msg.sender, amount);
    }

    // ─── Stable deposits (payroll-ready, no conversion needed) ───────────────

    function deposit(uint256 amount) external onlyRegistered {
        require(IERC20Minimal(USDC).transferFrom(msg.sender, address(this), amount), "transfer failed");
        companies[msg.sender].usdcBalance += amount;
        emit UsdcDeposited(msg.sender, amount);
    }

    function depositUsdt(uint256 amount) external onlyRegistered {
        require(IERC20Minimal(USDT).transferFrom(msg.sender, address(this), amount), "transfer failed");
        companies[msg.sender].usdtBalance += amount;
        emit UsdtDeposited(msg.sender, amount);
    }

    function withdraw(uint256 amount) external onlyRegistered {
        Company storage co = companies[msg.sender];
        require(co.usdcBalance >= amount, "insufficient");
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

    // ─── Oracle read helper ────────────────────────────────────────────────────
    // Returns price in 6-decimal USD (e.g. $0.031 → 31000, $95000 → 95000000000)
    function _readOracle(address oracle) internal view returns (uint256 usdPrice6) {
        try IAggregatorV3(oracle).latestRoundData() returns (
            uint80, int256 answer, uint256, uint256, uint80
        ) {
            if (answer <= 0) return 0;
            uint8 dec = IAggregatorV3(oracle).decimals();
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

        uint256 somiUsd = _readOracle(SOMI_ORACLE);
        uint256 wethUsd = _readOracle(WETH_ORACLE);
        uint256 wbtcUsd = _readOracle(WBTC_ORACLE);

        string[] memory allowed = new string[](2);
        allowed[0] = "CONVERT"; allowed[1] = "WAIT";

        bytes memory payload = abi.encodeWithSelector(
            ILLMAgent.inferString.selector,
            string(abi.encodePacked(
                "Live rates: SOMI/USD $", _fmtPrice6(somiUsd),
                ", ETH/USD $", _fmtPrice6(wethUsd),
                ", BTC/USD $", _fmtPrice6(wbtcUsd),
                ". Should Lymitra swap all volatile holdings (SOMI, ETH, BTC, BNB) to USDC and run payroll? ",
                "Convert when rates are stable or rising. Wait 24h if market is dropping fast."
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

    // ─── Convert all volatile holdings → USDC via Lymitra DEX ───────────────
    function _convertAllToUsdc(address company) internal {
        Company storage co = companies[company];

        _swapToUsdc(co.somiBalance, WSTT,    company, true);   co.somiBalance = 0;
        _swapToUsdc(co.wethBalance, WETH,    company, false);  co.wethBalance = 0;
        _swapToUsdc(co.wbtcBalance, WBTC,    company, false);  co.wbtcBalance = 0;
        _swapToUsdc(co.wbnbBalance, WBNB,    company, false);  co.wbnbBalance = 0;

        // Merge USDT reserve into USDC reserve (1:1 on testnet; in prod swap via DEX)
        if (co.usdtBalance > 0) {
            co.usdcBalance += co.usdtBalance;
            co.usdtBalance = 0;
        }
    }

    function _swapToUsdc(uint256 amount, address token, address company, bool isWstt) internal {
        if (amount == 0) return;
        if (isWstt) {
            IWSTT(token).approve(DEX_ROUTER, amount);
        } else {
            IERC20Minimal(token).approve(DEX_ROUTER, amount);
        }
        address[] memory path = new address[](2);
        path[0] = token; path[1] = USDC;
        uint256[] memory out = IDEXRouter(DEX_ROUTER).swapExactTokensForTokens(
            amount, 0, path, address(this), block.timestamp + 5 minutes
        );
        companies[company].usdcBalance += out[out.length - 1];
        emit TokensSwapped(company, token, amount, out[out.length - 1]);
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

    function executePayrollManual() external onlyRegistered {
        _convertAllToUsdc(msg.sender);
        _executePayroll(msg.sender, "MANUAL");
    }

    // ─── Views ────────────────────────────────────────────────────────────────
    function getEmployees(address company) external view returns (Employee[] memory) { return employees[company]; }
    function getCompany(address company)   external view returns (Company memory)    { return companies[company]; }
    function vaultBalance() external view returns (uint256) { return IERC20Minimal(USDC).balanceOf(address(this)); }

    function getSomiUsdPrice() external view returns (uint256) { return _readOracle(SOMI_ORACLE); }
    function getWethUsdPrice() external view returns (uint256) { return _readOracle(WETH_ORACLE); }
    function getWbtcUsdPrice() external view returns (uint256) { return _readOracle(WBTC_ORACLE); }

    receive() external payable {}
    function withdrawSTT(uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "insufficient STT");
        payable(owner).transfer(amount);
    }

    // ─── Price formatting helpers ─────────────────────────────────────────────
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
