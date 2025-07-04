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
  const ascentImplementation = m.contract("Ascent", [], {
    id: "AscentImplementation",
  });

  // Deploy the AscentRegistry factory contract
  // Pass the implementation contract address to the registry constructor
  const ascentRegistry = m.contract("AscentRegistry", [ascentImplementation], {
    id: "AscentRegistry",
  });

  // Return both contracts for verification and interaction
  return {
    ascentImplementation,
    ascentRegistry,
  };
});
