// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./interfaces/IAgentPlatform.sol";

/**
 * @title  LymitraPriceOracle
 * @notice Fetches ETH/USD price from CoinGecko via the Somnia JSON API Agent.
 *         Anyone calls requestPrice() with 0.12 STT deposit; the Somnia validator
 *         network reaches consensus and calls back receivePrice().
 *
 *         Agent platform:   0x037Bb9C718F3f7fe5eCBDB0b600D607b52706776
 *         JSON API agent ID: 13174292974160097713
 */
contract LymitraPriceOracle {
    IAgentRequester public constant PLATFORM =
        IAgentRequester(0x037Bb9C718F3f7fe5eCBDB0b600D607b52706776);

    uint256 public constant JSON_API_AGENT_ID = 13174292974160097713;
    uint256 public constant REQUEST_DEPOSIT   = 0.12 ether;

    string private constant PRICE_URL =
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd";
    string private constant PRICE_SELECTOR = "ethereum.usd";
    uint8  private constant DECIMALS = 6; // result = price × 10^6

    // ── State ───────────────────────────────────────────────────────────────
    uint256 public latestPrice;        // ETH/USD × 10^6 (e.g. 3500000000 = $3500)
    uint256 public latestTimestamp;
    uint256 public latestRequestId;
    address public lastRequester;

    // ── Events ───────────────────────────────────────────────────────────────
    event PriceRequested(address indexed requester, uint256 requestId);
    event PriceReceived(uint256 requestId, uint256 priceUsd6, uint256 timestamp);

    // ── Request ──────────────────────────────────────────────────────────────
    function requestPrice() external payable {
        require(msg.value >= REQUEST_DEPOSIT, "LymitraPriceOracle: insufficient STT deposit");

        bytes memory payload = abi.encodeWithSelector(
            IJsonApiAgent.fetchUint.selector,
            PRICE_URL,
            PRICE_SELECTOR,
            DECIMALS
        );

        uint256 requestId = PLATFORM.createRequest{value: REQUEST_DEPOSIT}(
            JSON_API_AGENT_ID,
            address(this),
            this.receivePrice.selector,
            payload
        );

        latestRequestId = requestId;
        lastRequester   = msg.sender;

        // Refund any excess
        if (msg.value > REQUEST_DEPOSIT) {
            payable(msg.sender).transfer(msg.value - REQUEST_DEPOSIT);
        }

        emit PriceRequested(msg.sender, requestId);
    }

    // ── Callback (called by platform after validator consensus) ───────────────
    function receivePrice(uint256 requestId, bytes calldata result) external {
        require(msg.sender == address(PLATFORM), "LymitraPriceOracle: only platform");

        uint256 price = abi.decode(result, (uint256));
        latestPrice     = price;
        latestTimestamp = block.timestamp;

        emit PriceReceived(requestId, price, block.timestamp);
    }

    // ── View helpers ─────────────────────────────────────────────────────────
    function latestPriceUsd() external view returns (uint256) {
        return latestPrice;
    }

    function isFresh(uint256 maxAgeSeconds) external view returns (bool) {
        return latestTimestamp > 0 && block.timestamp - latestTimestamp <= maxAgeSeconds;
    }

    receive() external payable {}
}
