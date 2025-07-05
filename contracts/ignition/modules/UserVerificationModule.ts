import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * Hardhat Ignition deployment module for the Ascent inheritance system
 * 
 * This module deploys:
 * 1. Ascent implementation contract
 * 2. AscentRegistry factory contract pointing to the implementation
 * 
 * Usage:
 * npx hardhat ignition deploy ignition/modules/AscentModule.ts --network <network-name>
 */
export default buildModule("AscentModule", (m) => {
  // Deploy the Ascent implementation contract first
  // This will be used as the implementation for all proxy contracts

  const mockScope = 1; // unless you use create2 and know the address of the contract before deploying, use a mock scope and update it after deployment.
  // see https://tools.self.xyz to compute the real value of the scope will set after deployment.
  
  const hubAddress = "0x68c931C9a534D37aa78094877F46fE46a49F1A51"; //Adress of Testnet
  const verificationConfigId = "0xc52f992ebee4435b00b65d2c74b12435e96359d1ccf408041528414e6ea687bc"; //Default, only checks for age

  const UserVerificationImplementation = m.contract("UserVerification", [hubAddress, mockScope, verificationConfigId], {
    id: "UserVerificationImplementation",
  });

  // Return both contracts for verification and interaction
  return {
    UserVerificationImplementation,
  };
});
