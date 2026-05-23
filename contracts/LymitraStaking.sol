// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./interfaces/IERC20Minimal.sol";

/**
 * LymitraStaking — stake STT (native Somnia testnet token) to earn USDC yield.
 *
 * Yield model: protocol collects a small fee from each payroll cycle and
 * distributes it to stakers proportionally. Simple accumulated-reward-per-token
 * pattern (like Synthetix StakingRewards).
 *
 * Security: CEI pattern enforced; nonReentrant mutex on all external-call paths.
 */
contract LymitraStaking {
    // ─── Constants ───────────────────────────────────────────────────────────
    address public immutable USDC;
    uint256 public constant LOCK_PERIOD = 7 days;

    // Precision factor for reward-per-token calculation
    uint256 private constant PRECISION = 1e18;

    // ─── Reentrancy guard ────────────────────────────────────────────────────
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED     = 2;
    uint256 private _status = _NOT_ENTERED;

    modifier nonReentrant() {
        require(_status != _ENTERED, "reentrant call");
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }

    // ─── State ───────────────────────────────────────────────────────────────
    address public owner;
    address public vault; // only vault can add rewards

    uint256 public totalStaked;

    // Accumulated USDC reward per staked STT unit (scaled by PRECISION)
    uint256 public accRewardPerToken;

    struct StakeInfo {
        uint256 amount;        // STT staked (wei)
        uint256 stakedAt;      // block.timestamp when staked
        uint256 rewardDebt;    // accRewardPerToken snapshot at stake/claim time
        uint256 pendingReward; // USDC accumulated, not yet claimed
    }

    mapping(address => StakeInfo) public stakes;

    // ─── Events ──────────────────────────────────────────────────────────────
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 amount);
    event RewardAdded(uint256 amount);
    event VaultSet(address vault);

    // ─── Modifiers ───────────────────────────────────────────────────────────
    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    modifier onlyVault() {
        require(msg.sender == vault, "not vault");
        _;
    }

    modifier updateReward(address user) {
        _updatePendingReward(user);
        _;
    }

    // ─── Constructor ─────────────────────────────────────────────────────────
    constructor(address _usdc) {
        require(_usdc != address(0), "zero addr");
        USDC  = _usdc;
        owner = msg.sender;
    }

    // ─── Admin ───────────────────────────────────────────────────────────────
    function setVault(address _vault) external onlyOwner {
        require(_vault != address(0), "zero addr");
        vault = _vault;
        emit VaultSet(_vault);
    }

    // ─── Stake (native STT) ───────────────────────────────────────────────────
    function stake() external payable nonReentrant updateReward(msg.sender) {
        require(msg.value > 0, "zero stake");

        stakes[msg.sender].amount   += msg.value;
        stakes[msg.sender].stakedAt  = block.timestamp;
        totalStaked                  += msg.value;

        emit Staked(msg.sender, msg.value);
    }

    // ─── Unstake ──────────────────────────────────────────────────────────────
    function unstake(uint256 amount) external nonReentrant updateReward(msg.sender) {
        StakeInfo storage si = stakes[msg.sender];
        require(si.amount >= amount, "exceeds stake");
        require(block.timestamp >= si.stakedAt + LOCK_PERIOD, "still locked");

        // CEI: update state before external call
        si.amount   -= amount;
        totalStaked -= amount;

        // Use .call to avoid 2300-gas limit of .transfer
        (bool ok,) = payable(msg.sender).call{value: amount}("");
        require(ok, "STT transfer failed");

        emit Unstaked(msg.sender, amount);
    }

    // ─── Claim USDC yield ─────────────────────────────────────────────────────
    function claimReward() external nonReentrant updateReward(msg.sender) {
        uint256 reward = stakes[msg.sender].pendingReward;
        require(reward > 0, "nothing to claim");

        // CEI: zero out before transfer
        stakes[msg.sender].pendingReward = 0;
        require(IERC20Minimal(USDC).transfer(msg.sender, reward), "transfer failed");

        emit RewardClaimed(msg.sender, reward);
    }

    // Claim + unstake in one call
    function exit() external nonReentrant updateReward(msg.sender) {
        StakeInfo storage si = stakes[msg.sender];

        require(block.timestamp >= si.stakedAt + LOCK_PERIOD, "still locked");

        uint256 reward = si.pendingReward;
        uint256 amount = si.amount;

        // CEI: clear all state before external calls
        si.pendingReward = 0;
        si.amount        = 0;
        totalStaked     -= amount;

        if (reward > 0) {
            require(IERC20Minimal(USDC).transfer(msg.sender, reward), "usdc failed");
            emit RewardClaimed(msg.sender, reward);
        }
        if (amount > 0) {
            (bool ok,) = payable(msg.sender).call{value: amount}("");
            require(ok, "STT transfer failed");
            emit Unstaked(msg.sender, amount);
        }
    }

    // ─── Reward distribution (called by vault after each payroll) ────────────
    function addReward(uint256 usdcAmount) external onlyVault {
        if (totalStaked == 0 || usdcAmount == 0) return;

        require(
            IERC20Minimal(USDC).transferFrom(msg.sender, address(this), usdcAmount),
            "reward transfer failed"
        );

        accRewardPerToken += (usdcAmount * PRECISION) / totalStaked;
        emit RewardAdded(usdcAmount);
    }

    // ─── View helpers ─────────────────────────────────────────────────────────
    function pendingReward(address user) external view returns (uint256) {
        StakeInfo storage si = stakes[user];
        uint256 earned = si.amount * (accRewardPerToken - si.rewardDebt) / PRECISION;
        return si.pendingReward + earned;
    }

    function unlockTime(address user) external view returns (uint256) {
        return stakes[user].stakedAt + LOCK_PERIOD;
    }

    function stakeOf(address user) external view returns (uint256) {
        return stakes[user].amount;
    }

    // ─── Internal ─────────────────────────────────────────────────────────────
    function _updatePendingReward(address user) internal {
        StakeInfo storage si = stakes[user];
        if (si.amount > 0) {
            uint256 earned = si.amount * (accRewardPerToken - si.rewardDebt) / PRECISION;
            si.pendingReward += earned;
        }
        si.rewardDebt = accRewardPerToken;
    }

    // Accept STT in case owner wants to seed rewards
    receive() external payable {}
}
