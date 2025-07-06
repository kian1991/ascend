import { network } from "hardhat";
import fs from "fs";
import { getAddress } from "viem";
import type { Address } from "viem";

interface GenericDiscloseOutputV2 {
    attestationId: `0x${string}`;
    userIdentifier: bigint;
    nullifier: bigint;
    forbiddenCountriesListPacked: [bigint, bigint, bigint, bigint];
    issuingState: string;
    name: string[];
    idNumber: string;
    nationality: string;
    dateOfBirth: string;
    gender: string;
    expiryDate: string;
    olderThan: bigint;
    ofac: [boolean, boolean, boolean];
}

function createEmptyOutputWithNullifier(nullifierValue: bigint, userIdentifier: bigint): GenericDiscloseOutputV2 {
    return {
        attestationId: "0x0000000000000000000000000000000000000000000000000000000000000000",
        userIdentifier: userIdentifier,
        nullifier: nullifierValue,
        forbiddenCountriesListPacked: [0n, 0n, 0n, 0n],
        issuingState: "",
        name: [],
        idNumber: "",
        nationality: "",
        dateOfBirth: "",
        gender: "",
        expiryDate: "",
        olderThan: 0n,
        ofac: [false, false, false]
    };
}

export enum CaseType {
  CONNECT = 1,
  VERIFY = 2
}

export function createUserData(caseType: CaseType): `0x${string}` {
  // Combine: 1 byte case + 20 bytes address
  return `0x0${caseType}` as `0x${string}`;
}

async function main(): Promise<void> {
    console.log("Testing UserVerification contract...");

    // Find contract address from deployment files
    const ignitionPath = "./ignition/deployments/chain-44787/deployed_addresses.json";
    const legacyPath = "./deployments/latest.json";
    
    let contractAddress: Address;

    if (fs.existsSync(ignitionPath)) {
        const deploymentData = JSON.parse(fs.readFileSync(ignitionPath, "utf8"));
        const userVerificationKey = Object.keys(deploymentData).find(key => 
            key.includes("UserVerification")
        );
        
        if (!userVerificationKey) {
            console.error("UserVerification contract not found in deployments.");
            console.error("Available contracts:", Object.keys(deploymentData));
            process.exit(1);
        }
        
        contractAddress = getAddress(deploymentData[userVerificationKey]);
    } else if (fs.existsSync(legacyPath)) {
        const deploymentInfo = JSON.parse(fs.readFileSync(legacyPath, "utf8"));
        contractAddress = getAddress(deploymentInfo.contractAddress);
    } else {
        console.error("No deployment found. Please deploy the contract first.");
        process.exit(1);
    }

    console.log("Using contract at:", contractAddress);

    try {
        
        console.log("Reading ALFAJORES_PRIVATE_KEY from Hardhat configuration...");
        const { viem } = await network.connect();
        const contract = await viem.getContractAt("UserVerification", contractAddress);
        console.log("Contract instance read successfully");
        
        try {
            function stringToHexBytes(str: string): `0x${string}` {
                return `0x${Array.from(new TextEncoder().encode(str))
                    .map(b => b.toString(16).padStart(2, '0'))
                    .join('')}`;
            }

            // Usage
            const userData = stringToHexBytes("Connect");

            const nullifierValue = BigInt("0x115b67fef6957d3ea9ba60dcb906e5ea796d9b2d725b65f0ec83dac6e6d0aef5");
            const userIdentifier = BigInt("0xa783Dd4f1Aaa4BE8e8b0Cf70aE3E24e635dBC514");
            const emptyOutput = createEmptyOutputWithNullifier(nullifierValue, userIdentifier);

            // Call addBeneficiaryData function with address and uint256[] array parameters
            const tx = await contract.write.testCustomVerification([emptyOutput, userData]);
            console.log("Transaction hash:", tx);

            // Wait for transaction confirmation
            console.log("Waiting for transaction confirmation...");
            const publicClient = await viem.getPublicClient();
            const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
            console.log("Transaction confirmed in block:", receipt.blockNumber.toString());

            // Add a small delay to ensure state is fully updated
            console.log("Waiting for state to update...");
            await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay

        } catch (error: any) {
            console.error("Failed to perform Test:", error.message);
            process.exit(1);
        }

    } catch (error: any) {
        console.error("Failed to load contract:", error.message);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error: any) => {
        console.error(error);
        process.exit(1);
    });
