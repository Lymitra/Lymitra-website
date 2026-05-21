// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// Source: https://github.com/Kali-Decoder/Somnia-Agentic-examples
// Platform contract: 0x037Bb9C718F3f7fe5eCBDB0b600D607b52706776

enum ConsensusType {
    Majority,
    Threshold
}

enum ResponseStatus {
    None,      // 0
    Pending,   // 1
    Success,   // 2
    Failed,    // 3
    TimedOut   // 4
}

struct Response {
    address validator;
    bytes result;
    ResponseStatus status;
    uint256 receipt;
    uint256 timestamp;
    uint256 executionCost;
}

struct Request {
    uint256 id;
    address requester;
    address callbackAddress;
    bytes4 callbackSelector;
    address[] subcommittee;
    Response[] responses;
    uint256 responseCount;
    uint256 failureCount;
    uint256 threshold;
    uint256 createdAt;
    uint256 deadline;
    ResponseStatus status;
    ConsensusType consensusType;
    uint256 remainingBudget;
}

interface IAgentRequester {
    function createRequest(
        uint256 agentId,
        address callbackAddress,
        bytes4 callbackSelector,
        bytes calldata payload
    ) external payable returns (uint256 requestId);

    function getRequestDeposit() external view returns (uint256);
}

// Used only for abi.encodeWithSelector(IJsonApiAgent.fetchUint.selector, ...)
interface IJsonApiAgent {
    function fetchUint(string calldata url, string calldata selector, uint8 decimals) external returns (uint256);
    function fetchString(string calldata url, string calldata selector) external returns (string memory);
}

// Used only for abi.encodeWithSelector(ILLMAgent.inferString.selector, ...)
interface ILLMAgent {
    function inferString(
        string calldata prompt,
        string calldata system,
        bool chainOfThought,
        string[] calldata allowedValues
    ) external returns (string memory);
}
