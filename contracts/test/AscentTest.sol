// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "forge-std/Test.sol";
import "../contracts/AscentRegistry.sol";
import "../contracts/Ascent.sol";
import "../contracts/interfaces/IAscent.sol";
import "../contracts/interfaces/IAscentRegistry.sol";
import "../mocks/MockERC20.sol";

contract AscentTest is Test {
    AscentRegistry public registry;
    Ascent public implementationContract;

    address public owner;
    address public grantor1;
    address public grantor2;
    address public beneficiary1;
    address public beneficiary2;
    address public beneficiary3;

    function setUp() public {
        // Set up test addresses
        owner = address(this);
        grantor1 = makeAddr("grantor1");
        grantor2 = makeAddr("grantor2");
        beneficiary1 = makeAddr("beneficiary1");
        beneficiary2 = makeAddr("beneficiary2");
        beneficiary3 = makeAddr("beneficiary3");

        // Deploy the implementation contract
        implementationContract = new Ascent();

        // Deploy the registry with the implementation
        registry = new AscentRegistry(address(implementationContract));

        // Give test accounts some ETH
        vm.deal(grantor1, 10 ether);
        vm.deal(grantor2, 10 ether);
    }

    // Add your test functions here

    function testCreateAscentWithThreeBeneficiaries() public {
        // Use helper function to create ascent
        address ascentAddress = createAscentWithThreeBeneficiaries();

        // Get the deployed Ascent contract
        Ascent ascent = Ascent(ascentAddress);

        // Get beneficiaries from the contract
        address[] memory returnedBeneficiaries = ascent.getBeneficiaries();

        // Assert that the returned beneficiaries match what we set
        assertEq(
            returnedBeneficiaries.length,
            3,
            "Should have 3 beneficiaries"
        );
        assertEq(
            returnedBeneficiaries[0],
            beneficiary1,
            "First beneficiary should match"
        );
        assertEq(
            returnedBeneficiaries[1],
            beneficiary2,
            "Second beneficiary should match"
        );
        assertEq(
            returnedBeneficiaries[2],
            beneficiary3,
            "Third beneficiary should match"
        );

        // Also test getBeneficiaryCount
        assertEq(
            ascent.getBeneficiaryCount(),
            3,
            "Beneficiary count should be 3"
        );

        // Test registry mappings - grantorToBeneficiaries
        address[] memory registryBeneficiaries = registry
            .getBeneficiariesByGrantor(grantor1);
        assertEq(
            registryBeneficiaries.length,
            3,
            "Registry should track 3 beneficiaries for grantor"
        );
        assertEq(
            registryBeneficiaries[0],
            beneficiary1,
            "Registry first beneficiary should match"
        );
        assertEq(
            registryBeneficiaries[1],
            beneficiary2,
            "Registry second beneficiary should match"
        );
        assertEq(
            registryBeneficiaries[2],
            beneficiary3,
            "Registry third beneficiary should match"
        );

        // Test reverse mappings - beneficiaryToGrantors
        address[] memory grantor1List = registry.getGrantorsByBeneficiary(
            beneficiary1
        );
        address[] memory grantor2List = registry.getGrantorsByBeneficiary(
            beneficiary2
        );
        address[] memory grantor3List = registry.getGrantorsByBeneficiary(
            beneficiary3
        );

        assertEq(grantor1List.length, 1, "Beneficiary1 should have 1 grantor");
        assertEq(
            grantor1List[0],
            grantor1,
            "Beneficiary1's grantor should be grantor1"
        );

        assertEq(grantor2List.length, 1, "Beneficiary2 should have 1 grantor");
        assertEq(
            grantor2List[0],
            grantor1,
            "Beneficiary2's grantor should be grantor1"
        );

        assertEq(grantor3List.length, 1, "Beneficiary3 should have 1 grantor");
        assertEq(
            grantor3List[0],
            grantor1,
            "Beneficiary3's grantor should be grantor1"
        );

        // Test relationship existence checks
        assertTrue(
            registry.isGrantorBeneficiaryRelationship(grantor1, beneficiary1),
            "Grantor1-Beneficiary1 relationship should exist"
        );
        assertTrue(
            registry.isGrantorBeneficiaryRelationship(grantor1, beneficiary2),
            "Grantor1-Beneficiary2 relationship should exist"
        );
        assertTrue(
            registry.isGrantorBeneficiaryRelationship(grantor1, beneficiary3),
            "Grantor1-Beneficiary3 relationship should exist"
        );

        // Test non-existent relationships
        assertFalse(
            registry.isGrantorBeneficiaryRelationship(grantor2, beneficiary1),
            "Grantor2-Beneficiary1 relationship should not exist"
        );
        assertFalse(
            registry.isGrantorBeneficiaryRelationship(grantor1, grantor2),
            "Grantor1-Grantor2 relationship should not exist"
        );
    }

    function testHeartbeatTimingAfterThreeDays() public {
        // Create an ascent with 7-day check-in interval
        address ascentAddress = createAscentWithThreeBeneficiaries();
        Ascent ascent = Ascent(ascentAddress);

        // Initially, heartbeat should not be expired and time remaining should be 7 days
        assertFalse(
            ascent.hasHeartbeatExpired(),
            "Heartbeat should not be expired initially"
        );
        assertEq(
            ascent.getTimeRemaining(),
            7 days,
            "Time remaining should be 7 days initially"
        );

        // Advance time by 3 days
        vm.warp(block.timestamp + 3 days);

        // After 3 days, heartbeat should still not be expired
        assertFalse(
            ascent.hasHeartbeatExpired(),
            "Heartbeat should not be expired after 3 days"
        );

        // Time remaining should be 4 days (7 - 3 = 4)
        assertEq(
            ascent.getTimeRemaining(),
            4 days,
            "Time remaining should be 4 days after 3 days"
        );

        // Check that the deadline is correctly calculated
        uint256 expectedDeadline = block.timestamp + 4 days;
        assertEq(
            ascent.getNextCheckInDeadline(),
            expectedDeadline,
            "Next check-in deadline should be 4 days from now"
        );
    }

    function testHeartbeatExpiredAfterSevenDaysAndOneSecond() public {
        // Create an ascent with 7-day check-in interval
        address ascentAddress = createAscentWithThreeBeneficiaries();
        Ascent ascent = Ascent(ascentAddress);

        // Initially, heartbeat should not be expired and time remaining should be 7 days
        assertFalse(
            ascent.hasHeartbeatExpired(),
            "Heartbeat should not be expired initially"
        );
        assertEq(
            ascent.getTimeRemaining(),
            7 days,
            "Time remaining should be 7 days initially"
        );

        // Advance time by 7 days and 1 second (past the deadline)
        vm.warp(block.timestamp + 7 days + 1 seconds);

        // After 7 days + 1 second, heartbeat should be expired
        assertTrue(
            ascent.hasHeartbeatExpired(),
            "Heartbeat should be expired after 7 days and 1 second"
        );

        // Time remaining should be 0 (deadline has passed)
        assertEq(
            ascent.getTimeRemaining(),
            0,
            "Time remaining should be 0 after deadline has passed"
        );

        // The deadline timestamp should still be the original deadline (doesn't change)
        uint256 originalDeadline = block.timestamp - 1 seconds; // Current time minus 1 second = deadline
        assertEq(
            ascent.getNextCheckInDeadline(),
            originalDeadline,
            "Deadline should be the original deadline timestamp"
        );
    }

    function testCheckInWorksBeforeExpiration() public {
        // Create an ascent with 7-day check-in interval
        address ascentAddress = createAscentWithThreeBeneficiaries();
        Ascent ascent = Ascent(ascentAddress);

        // Advance time to 6 days (still within the 7-day window)
        vm.warp(block.timestamp + 6 days);

        // Verify heartbeat is not expired yet
        assertFalse(
            ascent.hasHeartbeatExpired(),
            "Heartbeat should not be expired after 6 days"
        );

        // Check-in should work (grantor1 is the owner)
        vm.prank(grantor1);
        ascent.checkIn();

        // Verify the check-in updated the timestamp and reset the countdown
        assertEq(
            ascent.lastCheckIn(),
            block.timestamp,
            "Last check-in should be updated to current time"
        );
        assertEq(
            ascent.getTimeRemaining(),
            7 days,
            "Time remaining should be reset to 7 days after check-in"
        );
        assertFalse(
            ascent.hasHeartbeatExpired(),
            "Heartbeat should not be expired after successful check-in"
        );
    }

    function testCheckInFailsAfterExpiration() public {
        // Create an already expired ascent using helper function
        address ascentAddress = createExpiredAscent();
        Ascent ascent = Ascent(ascentAddress);

        // Verify the ascent is expired
        assertTrue(ascent.hasHeartbeatExpired(), "Heartbeat should be expired");
        assertEq(ascent.getTimeRemaining(), 0, "Time remaining should be 0");

        // Attempt to check-in should fail (grantor1 is the owner)
        vm.prank(grantor1);
        vm.expectRevert(Ascent.HeartbeatExpiredCannotCheckIn.selector);
        ascent.checkIn();

        // Verify that the failed check-in didn't change anything
        assertTrue(
            ascent.hasHeartbeatExpired(),
            "Heartbeat should still be expired after failed check-in"
        );
        assertEq(
            ascent.getTimeRemaining(),
            0,
            "Time remaining should still be 0 after failed check-in"
        );
    }

    function testDistributeAssetsAfterHeartbeatExpiry() public {
        // Deploy mock ERC20 token
        MockERC20 mockToken = new MockERC20("MockToken", "MTK", 3000 ether);

        // Create ascent with three beneficiaries
        address ascentAddress = createAscentWithThreeBeneficiaries();
        Ascent ascent = Ascent(ascentAddress);

        // Grantor1 gets 3000 tokens
        mockToken.transfer(grantor1, 3000 ether);
        assertEq(
            mockToken.balanceOf(grantor1),
            3000 ether,
            "Grantor1 should have 3000 tokens"
        );

        // Grantor1 approves the Ascent contract to spend tokens
        vm.prank(grantor1);
        mockToken.approve(ascentAddress, 3000 ether);

        // Grantor1 registers the token with the ascent contract
        vm.prank(grantor1);
        ascent.registerToken(address(mockToken));

        // Heartbeat expires
        vm.warp(block.timestamp + 8 days);
        assertTrue(ascent.hasHeartbeatExpired(), "Heartbeat should be expired");

        ascent.distributeAssets();

        // Each beneficiary should get 1000 tokens
        assertEq(
            mockToken.balanceOf(beneficiary1),
            1000 ether,
            "Beneficiary1 should get 1000 tokens"
        );
        assertEq(
            mockToken.balanceOf(beneficiary2),
            1000 ether,
            "Beneficiary2 should get 1000 tokens"
        );
        assertEq(
            mockToken.balanceOf(beneficiary3),
            1000 ether,
            "Beneficiary3 should get 1000 tokens"
        );
        // Ascent contract and grantor should have 0 tokens
        assertEq(
            mockToken.balanceOf(ascentAddress),
            0,
            "Ascent contract should have 0 tokens"
        );
        assertEq(
            mockToken.balanceOf(grantor1),
            0,
            "Grantor1 should have 0 tokens"
        );
    }

    // Helper function to create an Ascent with grantor1 and all three beneficiaries
    function createAscentWithThreeBeneficiaries()
        internal
        returns (address ascentAddress)
    {
        address[] memory beneficiaries = new address[](3);
        beneficiaries[0] = beneficiary1;
        beneficiaries[1] = beneficiary2;
        beneficiaries[2] = beneficiary3;

        vm.prank(grantor1);
        ascentAddress = registry.createAscent(
            grantor1,
            beneficiaries,
            IAscent.CheckInInterval.SEVEN_DAYS
        );

        return ascentAddress;
    }

    // Helper function to create an already expired Ascent by advancing time past the deadline
    function createExpiredAscent() internal returns (address ascentAddress) {
        // Create a fresh ascent
        ascentAddress = createAscentWithThreeBeneficiaries();

        // Advance time past the 7-day deadline to make it expired
        vm.warp(block.timestamp + 7 days + 1 seconds);

        return ascentAddress;
    }
}
