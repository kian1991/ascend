// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "../interfaces/IAscent.sol";

/**
 * @title AscentHelper
 * @dev Helper library for Ascent contract utility functions
 */
library AscentHelper {
    // Custom errors
    error InvalidCheckInInterval();

    /**
     * @dev Converts CheckInInterval enum to seconds
     * @param interval The check-in interval enum value
     * @return The interval in seconds
     */
    function getCheckInIntervalSeconds(IAscent.CheckInInterval interval) internal pure returns (uint256) {
        if (interval == IAscent.CheckInInterval.SEVEN_DAYS) {
            return 7 days;
        } else if (interval == IAscent.CheckInInterval.FOURTEEN_DAYS) {
            return 14 days;
        } else if (interval == IAscent.CheckInInterval.THIRTY_DAYS) {
            return 30 days;
        } else if (interval == IAscent.CheckInInterval.ONE_EIGHTY_DAYS) {
            return 180 days;
        } else if (interval == IAscent.CheckInInterval.THREE_SIXTY_FIVE_DAYS) {
            return 365 days;
        } else {
            revert InvalidCheckInInterval();
        }
    }
}
