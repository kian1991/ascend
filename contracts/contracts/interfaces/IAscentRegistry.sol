// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "./IAscent.sol";

/**
 * @title IAscentRegistry
 * @dev Interface for the AscentRegistry contract
 */
interface IAscentRegistry {
    // Custom errors
    error ImplementationCannotBeZeroAddress();
    error OnlyAscentContractCanCall();
    error InvalidAscentContract();
    error BeneficiaryMappingAlreadyExists();
    error BeneficiaryMappingNotFound();

    // Events
    event AscentCreated(address indexed owner, address ascent);
    event BeneficiaryAdded(
        address indexed grantor,
        address indexed beneficiary,
        address ascentContract
    );
    event BeneficiaryRemoved(
        address indexed grantor,
        address indexed beneficiary,
        address ascentContract
    );

    // Main function signatures
    function implementationContract() external view returns (address);
    
    function updateImplementation(address _newImplementation) external;
    
    function createAscent(
        address _grantor,
        address[] memory _beneficiaries,
        IAscent.CheckInInterval _checkInInterval
    ) external returns (address ascent);
    
    function getAscentsByGrantor(address _grantor) external view returns (address[] memory);
    
    function getTotalAscents() external view returns (uint256);
    
    function notifyBeneficiaryAdded(address _grantor, address _beneficiary) external;
    
    function notifyBeneficiaryRemoved(address _grantor, address _beneficiary) external;
    
    function getBeneficiariesByGrantor(address _grantor) external view returns (address[] memory);
    
    function getGrantorsByBeneficiary(address _beneficiary) external view returns (address[] memory);
    
    function isGrantorBeneficiaryRelationship(
        address _grantor,
        address _beneficiary
    ) external view returns (bool);
    
    function isValidAscentContract(address _contract) external view returns (bool);
}
