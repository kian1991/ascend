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

    //New
    string public lastUserFirstName;
    string public lastUserLastName;
    string public lastUserDOB;

    mapping (address => BeneficiaryInfo) beneficiaryData; 

    //Define Error
    error LogError(string[] namesArray);
    error FirstNameMismatch(string expectedValue, string actualValue);
    error LastNameMismatch(string expectedValue, string actualValue);
    error DOBMismatch(string expectedValue, string actualValue);

    // Zusätzliche Debug-Fehler für verschiedene Typen
    error LogString(string value);
    error LogUint(uint256 value);
    error LogAddress(address value);
    error LogBytes(bytes value);
    error LogBool(bool value);

    struct BeneficiaryInfo {
        string beneficiaryFirstName;
        string beneficiaryLastName;
        string beneficiaryDOB;
    }

    function verifyUserData() internal {
        if (keccak256(abi.encodePacked(lastUserFirstName)) != keccak256(abi.encodePacked("TOM"))) {
            revert FirstNameMismatch("TOM", lastUserFirstName);
        }
        
        if (keccak256(abi.encodePacked(lastUserLastName)) != keccak256(abi.encodePacked("ALBRECHT"))) {
            revert LastNameMismatch("ALBRECHT", lastUserLastName);
        }
        
        if (keccak256(abi.encodePacked(lastUserDOB)) != keccak256(abi.encodePacked("01-01-00"))) {
            revert DOBMismatch("01-01-00", lastUserDOB);
        }
    }

    // Events for testing
    event VerificationCompleted(
        ISelfVerificationRoot.GenericDiscloseOutputV2 output,
        bytes userData
    );

    event UserData(
        string firstName,
        string lastName,
        string dob
    );
    
    function getBeneficiaryData(address _address) public view returns (BeneficiaryInfo memory) {
        return beneficiaryData[_address];
    }

    constructor(
        address identityVerificationHubV2Address,
        uint256 scope,
        bytes32 _verificationConfigId
    ) SelfVerificationRoot(identityVerificationHubV2Address, scope) {
        verificationConfigId = _verificationConfigId;
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
        lastOutput = output;
        lastUserData = userData;
        lastUserAddress = address(uint160(output.userIdentifier));

        // Test Data -> Test successful
        /*
        string memory name = "ALBRECHT<<TOM";
        string memory dateOfBirth = "000101";
        */
        //revert LogError(output.name);
        // Verwende das erste Element des Name-Arrays als Input für formatName
        //string[] memory names = formatName(name); 
        lastUserFirstName = output.name[0];
        lastUserLastName = output.name[1];
        lastUserDOB = output.dateOfBirth;
        
        verifyUserData();
        
        emit UserData(lastUserFirstName, lastUserLastName, lastUserDOB);
        emit VerificationCompleted(output, userData);
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
        bytes32 destinationChainId,
        bytes32 userIdentifier,
        bytes memory userDefinedData
    ) public view override returns (bytes32) {
        return verificationConfigId;
    }

    /**
     * @notice Test function to simulate calling onVerificationSuccess from hub
     * @dev This function is only for testing purposes to verify access control
     * @param output The verification output
     * @param userData The user data
     */
    function testOnVerificationSuccess(
        bytes memory output,
        bytes memory userData
    ) external {
        // This should fail if called by anyone other than the hub
        onVerificationSuccess(output, userData);
    }
}
