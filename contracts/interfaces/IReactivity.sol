// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IReactivity {
    // Schedule a one-shot callback at a specific timestamp (milliseconds)
    function scheduleSubscriptionAtTimestamp(
        address contractAddress,
        bytes4 selector,
        uint64 timestampMs
    ) external;

    // Subscribe to events emitted by a specific address
    function subscribe(
        address emitter,
        bytes32[] calldata topics,
        address subscriber,
        bytes4 selector
    ) external;
}
