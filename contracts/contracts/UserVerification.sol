// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {SelfVerificationRoot} from "@selfxyz/contracts/contracts/abstract/SelfVerificationRoot.sol";
import {ISelfVerificationRoot} from "@selfxyz/contracts/contracts/interfaces/ISelfVerificationRoot.sol";
import {SelfStructs} from "@selfxyz/contracts/contracts/libraries/SelfStructs.sol";
import {Formatter} from "@selfxyz/contracts/contracts/libraries/Formatter.sol";

/**
 * @title TestSelfVerificationRoot
 * @notice Test implementation of SelfVerificationRoot for testing purposes
 * @dev This contract provides a concrete implementation of the abstract SelfVerificationRoot
 */
contract UserVerification is SelfVerificationRoot {
    // Storage for testing purposes
    bool public verificationSuccessful;
    ISelfVerificationRoot.GenericDiscloseOutputV2 public lastOutput;
    bytes public lastUserData;
    SelfStructs.VerificationConfigV2 public verificationConfig;
    bytes32 public verificationConfigId;
    address public lastUserAddress;

    //Define Error
    error LogError(string[] namesArray);
    error UserIdentifierMismatch(uint256 expectedValue, uint256 actualValue);

    // Added Information
    uint256 public lastUserIdentifier;
    
    mapping (address => BeneficiaryInfo) beneficiaryData; 

    struct BeneficiaryInfo {
        uint256[] beneficiaryUserIdentifier;
    }

    // Added Events
    event AddedBeneficiary(
        address ascendAddress,
        uint256 beneficiaryUserIdentifier
    );

    event AddedBeneficiaries(
        address ascendAddress,
        uint256[] beneficiaryUserIdentifiers
    );

    event RemovedBeneficiaryUserIdentifier(
        address ascendAddress,
        uint256 beneficiaryUserIdentifier
    );

    event StringLogEvent(
        string log    
    );
    
    event ByteLogEvent(
        bytes log    
    );

    event Uint256LogEvent(
        uint256 log
    );

    event AddressParsingEvent(
        address parsedAddress,
        bytes originalUserData
    );

    constructor(
        address identityVerificationHubV2Address,
        uint256 scope,
        bytes32 _verificationConfigId
    ) SelfVerificationRoot(identityVerificationHubV2Address, scope) {
        verificationConfigId = _verificationConfigId;
    }

    //Helper Functions
    function addOneBeneficiary(address _ascendAddress, uint256 _beneficiaryUserIdentifier) internal {
        beneficiaryData[_ascendAddress].beneficiaryUserIdentifier.push(_beneficiaryUserIdentifier);
        emit AddedBeneficiary(_ascendAddress, _beneficiaryUserIdentifier);
    }

    function addBeneficiaryData(address _ascendAddress, uint256[] memory _beneficiaryUserIdentifiers) external {
        for (uint256 j = 0; j < _beneficiaryUserIdentifiers.length; j++) {
                beneficiaryData[_ascendAddress].beneficiaryUserIdentifier.push(_beneficiaryUserIdentifiers[j]);
            }
        emit AddedBeneficiaries(_ascendAddress, _beneficiaryUserIdentifiers);
    }

    function addBeneficiaryDataBatch(
        address[] calldata _ascendAddresses, 
        uint256[][] calldata _beneficiaryUserIdentifiers
    ) external {
        require(_ascendAddresses.length == _beneficiaryUserIdentifiers.length, "Arrays length mismatch");
        
        for (uint256 i = 0; i < _ascendAddresses.length; i++) {
            address addr = _ascendAddresses[i];
            uint256[] calldata identifiers = _beneficiaryUserIdentifiers[i];
            
            for (uint256 j = 0; j < identifiers.length; j++) {
                beneficiaryData[addr].beneficiaryUserIdentifier.push(identifiers[j]);
            }
            emit AddedBeneficiaries(addr, identifiers);
        }
    }

    function getBeneficiaryData(address _address) public view returns (BeneficiaryInfo memory) {
        return beneficiaryData[_address];
    }

    /* Function which needs to be called from the smart contract that handles the releasing of the funds, 
    once the funds have been released to the corresponding user. To make sure that no other beneficiary can claim using the same ZK Proof.
    */
    function removeBeneficiaryUserIdentifier(address _ascendAddress, uint256 _beneficiaryUserIdentifier) internal {
        uint256[] storage identifiers = beneficiaryData[_ascendAddress].beneficiaryUserIdentifier;
        
        // Find and remove the identifier
        for (uint256 i = 0; i < identifiers.length; i++) {
            if (identifiers[i] == _beneficiaryUserIdentifier) {
                // Move the last element to the current position and remove the last element
                identifiers[i] = identifiers[identifiers.length - 1];
                identifiers.pop();
                break;
            }
        }
        
        emit RemovedBeneficiaryUserIdentifier(_ascendAddress, _beneficiaryUserIdentifier);
    }

    function verifyUserData(address ascendAddress) internal view {        
        // Get the allowed beneficiary user identifiers for this ascend
        uint256[] memory allowedBeneficiaryUserIdentifier = beneficiaryData[ascendAddress].beneficiaryUserIdentifier;
        
        // Check if lastUserIdentifier exists in the allowed list
        bool isAllowed = false;
        for (uint256 i = 0; i < allowedBeneficiaryUserIdentifier.length; i++) {
            if (allowedBeneficiaryUserIdentifier[i] == lastUserIdentifier) {
                isAllowed = true;
                break;
            }
        }
        
        if (!isAllowed) {
            revert UserIdentifierMismatch(0, lastUserIdentifier); // 0 indicates "not found in allowed list"
        } 
    }

    function testverifyUserData(address ascendAddress) internal {        
        // Get the allowed beneficiary user identifiers for this ascend
        uint256[] memory allowedBeneficiaryUserIdentifier = beneficiaryData[ascendAddress].beneficiaryUserIdentifier;
        
        // Check if lastUserIdentifier exists in the allowed list
        bool isAllowed = false;
        for (uint256 i = 0; i < allowedBeneficiaryUserIdentifier.length; i++) {
            if (allowedBeneficiaryUserIdentifier[i] == lastUserIdentifier) {
                isAllowed = true;
                break;
            }
        }
        
        if (!isAllowed) {
            emit StringLogEvent("Check_Failed");
        } else {
            emit StringLogEvent("Check_Successfull");
        }
    }

    struct CaseData {
        uint8 caseType;  // 1 = Connect, 2 = Verify
    }


    /**
     * @notice Implementation of customVerificationHook for testing
     * @dev This function is called by onVerificationSuccess after hub address validation
     * @param output The verification output from the hub
     * @param userData The user data passed through verification
     */
    function customVerificationHook(
        ISelfVerificationRoot.GenericDiscloseOutputV2 memory output,
        bytes memory userData
    ) internal override {
        verificationSuccessful = true;
        lastUserIdentifier = output.nullifier;
        address ascendAddress = address(uint160(output.userIdentifier));

        // Parse userData to get case type and address
        CaseData memory caseData;

        // Parse userData as integer (1 or 2)
        if (keccak256(userData) == keccak256(abi.encodePacked("Connect"))) {
            caseData.caseType = 1;
        } else if (keccak256(userData) == keccak256(abi.encodePacked("Verify"))) {
            caseData.caseType = 2;
        } else {
           revert("Invalid userData format for case type");
        }

        require(caseData.caseType == 1 || caseData.caseType == 2, "Invalid case type");

        emit Uint256LogEvent(caseData.caseType);
        
        if (caseData.caseType == 1) {
            // Handle Connect case
            emit StringLogEvent("Case: Connect");
            addOneBeneficiary(ascendAddress, lastUserIdentifier);
            // Your connect logic here
        } else if (caseData.caseType == 2) {
            // Handle Verify case
            emit StringLogEvent("Case: Verify");
            verifyUserData(ascendAddress);
            removeBeneficiaryUserIdentifier(ascendAddress, lastUserIdentifier);
        }
    }
    

    function testCustomVerification(
        ISelfVerificationRoot.GenericDiscloseOutputV2 memory output,
        bytes memory userData
    ) external {
        customVerificationHook(output, userData);
    } 

    /**
     * Was previously needed where we planned to give the ascendId by the userData
     * @notice Parse address from userData bytes
     * @dev Handles both ABI-encoded addresses and hex string addresses
     * @param userData The user data containing the address
     * @return The parsed address
     */
    function parseAddressFromUserData(bytes memory userData) internal pure returns (address) {
        // First, try to decode as ABI-encoded address (20 bytes)
        if (userData.length == 32) {
            // Standard ABI encoding of address (padded to 32 bytes)
            return abi.decode(userData, (address));
        } else if (userData.length == 20) {
            // Raw address bytes (20 bytes)
            return address(bytes20(userData));
        } else if (userData.length == 42) {
            // Hex string format: "0x" + 40 hex chars = 42 chars
            return parseHexStringToAddress(userData);
        } else if (userData.length == 40) {
            // Hex string without "0x" prefix = 40 chars
            return parseHexStringToAddress(userData);
        } else {
            revert("Invalid userData format for address parsing");
        }
    }

    /**
     * @notice Parse hex string to address
     * @dev Converts hex string bytes to address
     * @param hexString The hex string as bytes
     * @return The parsed address
     */
    function parseHexStringToAddress(bytes memory hexString) internal pure returns (address) {
        require(hexString.length == 40 || hexString.length == 42, "Invalid hex string length");
        
        uint256 startIndex = 0;
        if (hexString.length == 42) {
            // Skip "0x" prefix
            require(hexString[0] == 0x30 && hexString[1] == 0x78, "Invalid hex prefix");
            startIndex = 2;
        }
        
        bytes20 addressBytes;
        for (uint256 i = 0; i < 20; i++) {
            uint8 high = hexCharToByte(hexString[startIndex + i * 2]);
            uint8 low = hexCharToByte(hexString[startIndex + i * 2 + 1]);
            addressBytes |= bytes20(bytes1(high * 16 + low)) >> (i * 8);
        }
        
        return address(addressBytes);
    }

    /**
     * Was previously needed where we planned to give the ascendId by the userData
     * @notice Convert hex character to byte value
     * @dev Converts ASCII hex character to its byte value
     * @param hexChar The hex character as byte
     * @return The byte value (0-15)
     */
    function hexCharToByte(bytes1 hexChar) internal pure returns (uint8) {
        uint8 char = uint8(hexChar);
        if (char >= 48 && char <= 57) {
            // '0' - '9'
            return char - 48;
        } else if (char >= 65 && char <= 70) {
            // 'A' - 'F'
            return char - 55;
        } else if (char >= 97 && char <= 102) {
            // 'a' - 'f'
            return char - 87;
        } else {
            revert("Invalid hex character");
        }
    }

    /**
     * @notice Reset the test state
     */
    function resetTestState() external {
        verificationSuccessful = false;
        lastOutput = ISelfVerificationRoot.GenericDiscloseOutputV2({
            attestationId: bytes32(0),
            userIdentifier: 0,
            nullifier: 0,
            forbiddenCountriesListPacked: [
                uint256(0),
                uint256(0),
                uint256(0),
                uint256(0)
            ],
            issuingState: "",
            name: new string[](3),
            idNumber: "",
            nationality: "",
            dateOfBirth: "",
            gender: "",
            expiryDate: "",
            olderThan: 0,
            ofac: [false, false, false]
        });
        lastUserData = "";
        lastUserAddress = address(0);
    }

    function setScope(uint256 newScope) external {
        _setScope(newScope);
    }

    function setVerificationConfig(
        SelfStructs.VerificationConfigV2 memory config
    ) external {
        verificationConfig = config;
        _identityVerificationHubV2.setVerificationConfigV2(verificationConfig);
    }

    function setVerificationConfigNoHub(
        SelfStructs.VerificationConfigV2 memory config
    ) external {
        verificationConfig = config;
    }

    function setConfigId(bytes32 configId) external {
        verificationConfigId = configId;
    }

    function getConfigId(
        bytes32 /* destinationChainId */,
        bytes32 /* userIdentifier */,
        bytes memory /* userDefinedData */
    ) public view override returns (bytes32) {
        return verificationConfigId;
    }
}
