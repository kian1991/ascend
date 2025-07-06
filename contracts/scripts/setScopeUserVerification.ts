import { network } from "hardhat";
import fs from "fs";
import { getAddress } from "viem";
import type { Address } from "viem";

async function main(): Promise<void> {
    console.log("Setting scope for UserVerification contract...");

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

        console.log("\nReady to set scope - contract interface is available!");
        const newScope = "11232303686099886954859476558684289858569066383749890528552866674390476368324";
        console.log("Setting scope to:", newScope);
        
        try {
            // Call setScope function directly on the contract
            const tx = await contract.write.setScope([BigInt(newScope)]);
            console.log("Transaction hash:", tx);

            // Wait for transaction confirmation
            console.log("Waiting for transaction confirmation...");
            const publicClient = await viem.getPublicClient();
            const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
            console.log("Transaction confirmed in block:", receipt.blockNumber.toString());

            // Verify the scope was updated
            const updatedScope = await contract.read.scope();
            console.log("Updated scope:", updatedScope.toString());

            console.log("\nScope update complete!");

        } catch (error: any) {
            console.error("Failed to set scope:", error.message);
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
