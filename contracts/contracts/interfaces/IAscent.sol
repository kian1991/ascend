// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

/**
 * @title IAscent
 * @dev Interface for Ascent contract defining core types and functions
 */
interface IAscent {
    // Enum for check-in intervals
    enum CheckInInterval {
        SEVEN_DAYS,     // 7 days
        FOURTEEN_DAYS,  // 14 days
        THIRTY_DAYS,    // 30 days
        ONE_EIGHTY_DAYS, // 180 days
        THREE_SIXTY_FIVE_DAYS // 365 days
    }

    // Events
    event CheckIn(address indexed grantor, uint256 timestamp);
    event DeadMansSwitchTriggered(uint256 timestamp);

    // Core functions
    function checkIn() external;
    function hasHeartbeatExpired() external view returns (bool);
    function getNextCheckInDeadline() external view returns (uint256);
    function getTimeRemaining() external view returns (uint256);
    function getBeneficiaries() external view returns (address[] memory);
    function getBeneficiaryCount() external view returns (uint256);
}
