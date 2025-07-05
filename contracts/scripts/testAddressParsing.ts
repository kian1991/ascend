import hre from "hardhat";
import { ethers } from "ethers";

async function main() {
    console.log("Testing address parsing formats for UserVerification contract...");

    // Test address to parse (using a well-known address)
    const testAddress = "0x742d35Cc6834C532532Da037EE398710c3cDa915".toLowerCase();
    const checksumAddress = ethers.getAddress(testAddress); // This will create proper checksum
    console.log("Test address:", checksumAddress);

    // Test different formats of userData that the contract can handle
    console.log("\n=== Testing userData Formats ===");

    // 1. ABI-encoded address (32 bytes)
    console.log("\n1. ABI-encoded address (32 bytes):");
    const abiCoder = ethers.AbiCoder.defaultAbiCoder();
    const abiEncoded = abiCoder.encode(["address"], [checksumAddress]);
    console.log("   Hex:", abiEncoded);
    console.log("   Length:", abiEncoded.length, "characters (", (abiEncoded.length - 2) / 2, "bytes )");

    // 2. Raw address (20 bytes)
    console.log("\n2. Raw address bytes (20 bytes):");
    console.log("   Hex:", checksumAddress);
    console.log("   Length:", checksumAddress.length, "characters (", (checksumAddress.length - 2) / 2, "bytes )");

    // 3. Hex string with 0x prefix as UTF-8 bytes
    console.log("\n3. Hex string with 0x prefix as UTF-8 (42 bytes):");
    const hexWithPrefix = ethers.toUtf8Bytes(checksumAddress);
    const hexWithPrefixHex = ethers.hexlify(hexWithPrefix);
    console.log("   Original string:", checksumAddress);
    console.log("   As UTF-8 bytes (hex):", hexWithPrefixHex);
    console.log("   Length:", hexWithPrefixHex.length, "characters (", (hexWithPrefixHex.length - 2) / 2, "bytes )");

    // 4. Hex string without 0x prefix as UTF-8 bytes
    console.log("\n4. Hex string without 0x prefix as UTF-8 (40 bytes):");
    const hexWithoutPrefix = ethers.toUtf8Bytes(checksumAddress.slice(2));
    const hexWithoutPrefixHex = ethers.hexlify(hexWithoutPrefix);
    console.log("   Original string:", checksumAddress.slice(2));
    console.log("   As UTF-8 bytes (hex):", hexWithoutPrefixHex);
    console.log("   Length:", hexWithoutPrefixHex.length, "characters (", (hexWithoutPrefixHex.length - 2) / 2, "bytes )");

    console.log("\n=== Contract Implementation ===");
    console.log("The UserVerification contract parseAddressFromUserData() function handles:");
    console.log("✅ 32-byte userData: ABI-decoded as address");
    console.log("✅ 20-byte userData: Direct conversion to address");
    console.log("✅ 42-byte userData: Parsed as hex string with '0x' prefix");
    console.log("✅ 40-byte userData: Parsed as hex string without '0x' prefix");
    
    console.log("\n=== Usage in Your Code ===");
    console.log("When calling the verification with userData containing an address:");
    console.log("");
    console.log("Option 1 - ABI encode the address:");
    console.log('const userData = ethers.AbiCoder.defaultAbiCoder().encode(["address"], [myAddress]);');
    console.log("");
    console.log("Option 2 - Pass the raw address:");
    console.log("const userData = myAddress; // '0x742d35...'");
    console.log("");
    console.log("Option 3 - Pass as UTF-8 string:");
    console.log("const userData = ethers.toUtf8Bytes(myAddress);");
    console.log("");
    console.log("The contract will automatically detect the format and parse accordingly.");

    console.log("\n=== Testing the Contract ===");
    console.log("To test the actual parsing:");
    console.log("1. Deploy the UserVerification contract");
    console.log("2. Make parseAddressFromUserData() public temporarily");
    console.log("3. Call it with different userData formats");
    console.log("4. Or test through the verification flow");

    console.log("\n✅ Address parsing logic implemented in UserVerification contract");
    console.log("Run 'npx hardhat compile' to compile the updated contract");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
