import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * Legacy Counter module - replaced by AscentModule.ts
 * This file can be deleted or used for testing purposes
 */
export default buildModule("CounterModule", (m) => {
  // This was a placeholder - use AscentModule.ts instead
  const counter = m.contract("Counter", []);
  
  return { counter };
});
