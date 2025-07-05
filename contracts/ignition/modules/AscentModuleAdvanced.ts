import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * Advanced Ascent deployment module with parameters
 * 
 * This module supports:
 * - Custom deployment parameters
 * - Different configurations for different networks
 * - Verification settings
 * 
 * Usage with parameters:
 * npx hardhat ignition deploy ignition/modules/AscentModuleAdvanced.ts --network <network> --parameters ignition/parameters.json
 */
export default buildModule("AscentModuleAdvanced", (m) => {
  // Deploy the Ascent implementation contract
  const ascentImplementation = m.contract("Ascent", [], {
    id: "AscentImplementation",
  });

  // Deploy the AscentRegistry factory contract
  const ascentRegistry = m.contract("AscentRegistry", [ascentImplementation], {
    id: "AscentRegistry",
  });

  // Call a post-deployment verification (optional)
  m.call(ascentRegistry, "implementationContract", [], {
    id: "VerifyImplementation",
  });

  // Return deployed contracts
  return {
    ascentImplementation,
    ascentRegistry,
  };
});
