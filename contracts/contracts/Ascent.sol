// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
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
    error HeartbeatNotExpired();
    error AssetsAlreadyDistributed();
    error NoAssetsToDistribute();

    // Distribution state
    bool public assetsDistributed;
    
    // ERC20 tokens registered for distribution
    address[] public registeredTokens;

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
        assetsDistributed = false;
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
     * @dev Registers an ERC20 token for distribution
     * Only the owner can call this function
     * @param tokenAddress Address of the ERC20 token contract
     */
    function registerToken(address tokenAddress) external onlyOwner {
        require(tokenAddress != address(0), InvalidBeneficiaryAddress());
        
        // Check if token is already registered
        for (uint256 i = 0; i < registeredTokens.length; i++) {
            if (registeredTokens[i] == tokenAddress) {
                revert BeneficiaryAlreadyExists(); // Reusing error for token already exists
            }
        }
        
        registeredTokens.push(tokenAddress);
    }

    /**
     * @dev Returns all registered token addresses
     * @return Array of registered ERC20 token addresses
     */
    function getRegisteredTokens() external view returns (address[] memory) {
        return registeredTokens;
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

    /**
     * @dev Distributes the grantor's ERC20 tokens equally among beneficiaries when heartbeat has expired
     * Can be called by anyone once the heartbeat has expired
     * Assets can only be distributed once to prevent double spending
     */
    function distributeAssets() external {
        require(hasHeartbeatExpired(), HeartbeatNotExpired());
        require(!assetsDistributed, AssetsAlreadyDistributed());
        require(beneficiaries.length > 0, NoAssetsToDistribute());
        require(registeredTokens.length > 0, NoAssetsToDistribute());

        // Mark assets as distributed to prevent re-entry
        assetsDistributed = true;

        // Distribute all registered ERC20 tokens
        for (uint256 tokenIndex = 0; tokenIndex < registeredTokens.length; tokenIndex++) {
            address tokenAddress = registeredTokens[tokenIndex];
            IERC20 token = IERC20(tokenAddress);
            
            // 
            uint256 tokenAllowance = token.allowance(owner(), address(this));
            if (tokenAllowance > 0) {
                _distributeToken(token, tokenAllowance);
            }
        }

        emit AssetsDistributed(beneficiaries, registeredTokens.length);
    }

    /**
     * @dev Internal function to distribute a specific ERC20 token among beneficiaries
     * @param token The ERC20 token contract interface
     * @param totalAmount Total amount of tokens to distribute
     */
    function _distributeToken(IERC20 token, uint256 totalAmount) internal {
        // Calculate equal distribution amount per beneficiary
        uint256 amountPerBeneficiary = totalAmount / beneficiaries.length;
        uint256 remainder = totalAmount % beneficiaries.length;

        // Distribute tokens equally among all beneficiaries
        for (uint256 i = 0; i < beneficiaries.length; i++) {
            uint256 amount = amountPerBeneficiary;
            
            // Give remainder to the first beneficiary to ensure all tokens are distributed
            if (i == 0) {
                amount += remainder;
            }
            
            if (amount > 0) {
                require(token.transfer(beneficiaries[i], amount), "Token transfer failed");
            }
        }
    }
}
