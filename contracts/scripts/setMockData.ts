import { network } from "hardhat";
import fs from "fs";
import { getAddress } from "viem";
import type { Address } from "viem";

async function main(): Promise<void> {
    console.log("Adding Mock-Data for UserVerification contract...");

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

        console.log("\nReady to set Mock-Data - contract interface is available!");
        const ascendAddress = "0xa783Dd4f1Aaa4BE8e8b0Cf70aE3E24e635dBC514" as `0x${string}`;
        const beneficiaryUserID = [
            BigInt("0x115b67fef6957d3ea9ba60dcb906e5ea796d9b2d725b65f0ec83dac6e6d0aef5") 
        ];
        console.log("Setting Mock-Data");
        
        try {
            // Call addBeneficiaryData function with address and uint256[] array parameters
            const tx = await contract.write.addBeneficiaryData([ascendAddress, beneficiaryUserID]);
            console.log("Transaction hash:", tx);

            // Wait for transaction confirmation
            console.log("Waiting for transaction confirmation...");
            const publicClient = await viem.getPublicClient();
            const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
            console.log("Transaction confirmed in block:", receipt.blockNumber.toString());

            // Add a small delay to ensure state is fully updated
            console.log("Waiting for state to update...");
            await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay

            // Verify the beneficiary data was added
            const updatedBeneficiaryData = await contract.read.getBeneficiaryData([ascendAddress]);
            console.log("Updated beneficiary data:", JSON.stringify(updatedBeneficiaryData, (key, value) =>
                typeof value === 'bigint' ? value.toString() : value, 2
            ));

        } catch (error: any) {
            console.error("Failed to set mockData:", error.message);
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
