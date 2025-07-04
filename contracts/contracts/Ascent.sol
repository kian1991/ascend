// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./interfaces/IAscent.sol";
import "./interfaces/IAscentRegistry.sol";
import "./helpers/AscentHelper.sol";

/**
 * @title Ascent
 * @dev A contract that manages a grantor and beneficiaries with a dead man's switch
 */
contract Ascent is Initializable, OwnableUpgradeable, IAscent {
    address[] public beneficiaries;
    IAscent.CheckInInterval public checkInInterval;
    uint256 public lastCheckIn;
    address public registry; // AscentRegistry address

    // Custom errors
    error HeartbeatExpiredCannotCheckIn();
    error BeneficiaryAlreadyExists();
    error BeneficiaryNotFound();
    error InvalidBeneficiaryAddress();

    /**
     * @dev Constructor for the implementation contract (disables initializers)
     */
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev Initializes the proxy contract (replaces constructor for proxies)
     * @param _grantor Address of the grantor
     * @param _beneficiaries Array of beneficiary addresses
     * @param _checkInInterval Initial check-in interval period
     */
    function initialize(
        address _grantor,
        address[] memory _beneficiaries,
        IAscent.CheckInInterval _checkInInterval
    ) external initializer {
        __Ownable_init(_grantor);
        beneficiaries = _beneficiaries;
        checkInInterval = _checkInInterval;
        lastCheckIn = block.timestamp;
        registry = msg.sender; // The registry is the caller
    }

    /**
     * @dev Grantor checks in to prove they are still alive
     * Only the grantor can call this function and only if heartbeat hasn't expired
     */
    function checkIn() external override onlyOwner {
        require(!hasHeartbeatExpired(), HeartbeatExpiredCannotCheckIn());

        lastCheckIn = block.timestamp;
        emit CheckIn(owner(), block.timestamp);
    }

    /**
     * @dev Adds a new beneficiary to the list
     * Only the owner can call this function
     * @param _beneficiary Address of the beneficiary to add
     */
    function addBeneficiary(address _beneficiary) external onlyOwner {
        require(_beneficiary != address(0), InvalidBeneficiaryAddress());

        // Check if beneficiary already exists
        for (uint256 i = 0; i < beneficiaries.length; i++) {
            if (beneficiaries[i] == _beneficiary) {
                revert BeneficiaryAlreadyExists();
            }
        }

        beneficiaries.push(_beneficiary);
        
        // Notify registry about the new beneficiary
        IAscentRegistry(registry).notifyBeneficiaryAdded(owner(), _beneficiary);
    }

    /**
     * @dev Removes a beneficiary from the list
     * Only the owner can call this function
     * @param _beneficiary Address of the beneficiary to remove
     */
    function removeBeneficiary(address _beneficiary) external onlyOwner {
        require(_beneficiary != address(0), InvalidBeneficiaryAddress());

        bool found = false;
        uint256 indexToRemove;

        // Find the beneficiary
        for (uint256 i = 0; i < beneficiaries.length; i++) {
            if (beneficiaries[i] == _beneficiary) {
                found = true;
                indexToRemove = i;
                break;
            }
        }

        require(found, BeneficiaryNotFound());

        // Remove by swapping with last element and popping
        beneficiaries[indexToRemove] = beneficiaries[beneficiaries.length - 1];
        beneficiaries.pop();
        
        // Notify registry about the removed beneficiary
        IAscentRegistry(registry).notifyBeneficiaryRemoved(owner(), _beneficiary);
    }

    /**
     * @dev Returns the number of beneficiaries
     */
    function getBeneficiaryCount() external view override returns (uint256) {
        return beneficiaries.length;
    }

    /**
     * @dev Returns all beneficiaries
     */
    function getBeneficiaries()
        external
        view
        override
        returns (address[] memory)
    {
        return beneficiaries;
    }

    /**
     * @dev Returns the deadline for the next check-in
     */
    function getNextCheckInDeadline() external view override returns (uint256) {
        return
            lastCheckIn +
            AscentHelper.getCheckInIntervalSeconds(checkInInterval);
    }

    /**
     * @dev Returns time remaining until the dead man's switch triggers
     * @return seconds remaining, or 0 if already triggered
     */
    function getTimeRemaining() external view override returns (uint256) {
        uint256 deadline = lastCheckIn +
            AscentHelper.getCheckInIntervalSeconds(checkInInterval);
        if (block.timestamp >= deadline) {
            return 0;
        }
        return deadline - block.timestamp;
    }

    /**
     * @dev Checks if the heartbeat has expired (no check-in within required interval)
     * @return true if the grantor has not checked in within the required interval
     */
    function hasHeartbeatExpired() public view override returns (bool) {
        return
            block.timestamp >=
            lastCheckIn +
                AscentHelper.getCheckInIntervalSeconds(checkInInterval);
    }
}
