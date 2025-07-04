// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IAscent.sol";
import "./interfaces/IAscentRegistry.sol";

/**
 * @title AscentRegistry
 * @dev Factory contract that deploys new ERC1967 proxy contracts pointing to the same Ascent implementation
 * Each proxy represents a separate ascent instance for users
 */
contract AscentRegistry is Ownable, IAscentRegistry {
    address public implementationContract;
    mapping(address => address[]) public grantorAscents;
    address[] public allAscents;

    // Bidirectional mappings for grantor-beneficiary relationships
    mapping(address => address[]) public grantorToBeneficiaries; // grantor => beneficiaries
    mapping(address => address[]) public beneficiaryToGrantors; // beneficiary => grantors
    mapping(address => mapping(address => bool))
        public isGrantorBeneficiaryPair; // grantor => beneficiary => exists

    // Mapping to track valid Ascent contracts
    mapping(address => bool) public isValidAscentContract;

    /**
     * @dev Modifier to restrict access to valid Ascent contracts only
     */
    modifier onlyValidAscentContract() {
        if (!isValidAscentContract[msg.sender])
            revert OnlyAscentContractCanCall();
        _;
    }

    /**
     * @dev Constructor sets the Ascent implementation contract address
     * @param _implementation Address of the Ascent implementation contract
     */
    constructor(address _implementation) Ownable(msg.sender) {
        require(
            _implementation != address(0),
            ImplementationCannotBeZeroAddress()
        );
        implementationContract = _implementation;
    }

    /**
     * @dev Updates the implementation contract address
     * @param _newImplementation Address of the new implementation contract
     */
    function updateImplementation(
        address _newImplementation
    ) external onlyOwner {
        require(
            _newImplementation != address(0),
            ImplementationCannotBeZeroAddress()
        );
        implementationContract = _newImplementation;
    }

    /**
     * @dev Deploys a new ascent proxy contract pointing to the implementation
     * @param _grantor Address of the grantor
     * @param _beneficiaries Array of beneficiary addresses
     * @param _checkInInterval Initial check-in interval period
     * @return ascent Address of the newly deployed ascent proxy
     */
    function createAscent(
        address _grantor,
        address[] memory _beneficiaries,
        IAscent.CheckInInterval _checkInInterval
    ) external returns (address ascent) {
        // Encode the constructor parameters
        bytes memory initData = abi.encodeWithSignature(
            "initialize(address,address[],uint8)",
            _grantor,
            _beneficiaries,
            _checkInInterval
        );

        ascent = address(new ERC1967Proxy(implementationContract, initData));

        grantorAscents[msg.sender].push(ascent);
        allAscents.push(ascent);
        isValidAscentContract[ascent] = true;

        // Initialize beneficiary mappings for this grantor
        for (uint256 i = 0; i < _beneficiaries.length; i++) {
            _addBeneficiaryMapping(_grantor, _beneficiaries[i]);
        }

        emit AscentCreated(msg.sender, ascent);
        return ascent;
    }

    /**
     * @dev Returns all ascent proxies created by a specific grantor
     * @param _grantor Address of the grantor
     * @return Array of ascent addresses created by the grantor
     */
    function getAscentsByGrantor(
        address _grantor
    ) external view returns (address[] memory) {
        return grantorAscents[_grantor];
    }

    /**
     * @dev Returns the total number of created ascents
     */
    function getTotalAscents() external view returns (uint256) {
        return allAscents.length;
    }


    /**
     * @dev Called by Ascent contracts when a beneficiary is added
     * @param _grantor The grantor address
     * @param _beneficiary The beneficiary address
     */
    function notifyBeneficiaryAdded(
        address _grantor,
        address _beneficiary
    ) external onlyValidAscentContract {
        require(!isGrantorBeneficiaryPair[_grantor][_beneficiary], BeneficiaryMappingAlreadyExists());
        _addBeneficiaryMapping(_grantor, _beneficiary);
        emit BeneficiaryAdded(_grantor, _beneficiary, msg.sender);
    }

    /**
     * @dev Called by Ascent contracts when a beneficiary is removed
     * @param _grantor The grantor address
     * @param _beneficiary The beneficiary address
     */
    function notifyBeneficiaryRemoved(
        address _grantor,
        address _beneficiary
    ) external onlyValidAscentContract {
        require(isGrantorBeneficiaryPair[_grantor][_beneficiary], BeneficiaryMappingNotFound());
        _removeBeneficiaryMapping(_grantor, _beneficiary);
        emit BeneficiaryRemoved(_grantor, _beneficiary, msg.sender);
    }

    /**
     * @dev Returns all beneficiaries for a specific grantor across all their Ascent contracts
     * @param _grantor The grantor address
     * @return Array of beneficiary addresses
     */
    function getBeneficiariesByGrantor(
        address _grantor
    ) external view returns (address[] memory) {
        return grantorToBeneficiaries[_grantor];
    }

    /**
     * @dev Returns all grantors for a specific beneficiary across all Ascent contracts
     * @param _beneficiary The beneficiary address
     * @return Array of grantor addresses
     */
    function getGrantorsByBeneficiary(
        address _beneficiary
    ) external view returns (address[] memory) {
        return beneficiaryToGrantors[_beneficiary];
    }

    /**
     * @dev Checks if a grantor-beneficiary relationship exists
     * @param _grantor The grantor address
     * @param _beneficiary The beneficiary address
     * @return True if the relationship exists
     */
    function isGrantorBeneficiaryRelationship(
        address _grantor,
        address _beneficiary
    ) external view returns (bool) {
        return isGrantorBeneficiaryPair[_grantor][_beneficiary];
    }

    /**
     * @dev Internal function to add beneficiary mapping
     * @param _grantor The grantor address
     * @param _beneficiary The beneficiary address
     */
    function _addBeneficiaryMapping(
        address _grantor,
        address _beneficiary
    ) internal {
        grantorToBeneficiaries[_grantor].push(_beneficiary);
        beneficiaryToGrantors[_beneficiary].push(_grantor);
        isGrantorBeneficiaryPair[_grantor][_beneficiary] = true;
    }

    /**
     * @dev Internal function to remove beneficiary mapping
     * @param _grantor The grantor address
     * @param _beneficiary The beneficiary address
     */
    function _removeBeneficiaryMapping(
        address _grantor,
        address _beneficiary
    ) internal {

        // Remove from grantorToBeneficiaries mapping
        address[] storage grantorBeneficiaries = grantorToBeneficiaries[
            _grantor
        ];
        for (uint256 i = 0; i < grantorBeneficiaries.length; i++) {
            if (grantorBeneficiaries[i] == _beneficiary) {
                grantorBeneficiaries[i] = grantorBeneficiaries[
                    grantorBeneficiaries.length - 1
                ];
                grantorBeneficiaries.pop();
                break;
            }
        }

        // Remove from beneficiaryToGrantors mapping
        address[] storage beneficiaryGrantors = beneficiaryToGrantors[
            _beneficiary
        ];
        for (uint256 i = 0; i < beneficiaryGrantors.length; i++) {
            if (beneficiaryGrantors[i] == _grantor) {
                beneficiaryGrantors[i] = beneficiaryGrantors[
                    beneficiaryGrantors.length - 1
                ];
                beneficiaryGrantors.pop();
                break;
            }
        }

        // Remove the grantor-beneficiary pair flag
        isGrantorBeneficiaryPair[_grantor][_beneficiary] = false;
    }
}
