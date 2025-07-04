// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "forge-std/Test.sol";
import "../contracts/AscentRegistry.sol";
import "../contracts/Ascent.sol";
import "../contracts/interfaces/IAscent.sol";
import "../contracts/interfaces/IAscentRegistry.sol";

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
}
