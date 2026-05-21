// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./interfaces/IERC20Minimal.sol";

/**
 * LymitraStaking — stake STT (native Somnia testnet token) to earn USDC yield.
 *
 * Yield model: protocol collects a small fee from each payroll cycle and
 * distributes it to stakers proportionally. Simple accumulated-reward-per-token
 * pattern (like Synthetix StakingRewards).
 */
contract LymitraStaking {
    // ─── Constants ───────────────────────────────────────────────────────────
    address public constant USDC     = 0x28BEc7E30E6faee657a03e19Bf1128AaD7632A00;
    uint256 public constant LOCK_PERIOD = 7 days;

    // Precision factor for reward-per-token calculation
    uint256 private constant PRECISION = 1e18;

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
    constructor() {
        owner = msg.sender;
    }

    // ─── Admin ───────────────────────────────────────────────────────────────
    function setVault(address _vault) external onlyOwner {
        vault = _vault;
        emit VaultSet(_vault);
    }

    // ─── Stake (native STT) ───────────────────────────────────────────────────
    function stake() external payable updateReward(msg.sender) {
        require(msg.value > 0, "zero stake");

        stakes[msg.sender].amount   += msg.value;
        stakes[msg.sender].stakedAt  = block.timestamp;
        totalStaked                  += msg.value;

        emit Staked(msg.sender, msg.value);
    }

    // ─── Unstake ──────────────────────────────────────────────────────────────
    function unstake(uint256 amount) external updateReward(msg.sender) {
        StakeInfo storage si = stakes[msg.sender];
        require(si.amount >= amount, "exceeds stake");
        require(block.timestamp >= si.stakedAt + LOCK_PERIOD, "still locked");

        si.amount  -= amount;
        totalStaked -= amount;

        payable(msg.sender).transfer(amount);
        emit Unstaked(msg.sender, amount);
    }

    // ─── Claim USDC yield ─────────────────────────────────────────────────────
    function claimReward() external updateReward(msg.sender) {
        uint256 reward = stakes[msg.sender].pendingReward;
        require(reward > 0, "nothing to claim");

        stakes[msg.sender].pendingReward = 0;
        require(IERC20Minimal(USDC).transfer(msg.sender, reward), "transfer failed");

        emit RewardClaimed(msg.sender, reward);
    }

    // Claim + unstake in one call
    function exit() external updateReward(msg.sender) {
        StakeInfo storage si = stakes[msg.sender];

        uint256 reward = si.pendingReward;
        uint256 amount = si.amount;

        require(block.timestamp >= si.stakedAt + LOCK_PERIOD, "still locked");

        si.pendingReward = 0;
        si.amount        = 0;
        totalStaked     -= amount;

        if (reward > 0) {
            require(IERC20Minimal(USDC).transfer(msg.sender, reward), "usdc failed");
            emit RewardClaimed(msg.sender, reward);
        }
        if (amount > 0) {
            payable(msg.sender).transfer(amount);
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
