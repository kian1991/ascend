import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("AscentModule", (m) => {
  const ascent = m.contract("Ascent");
  
  return { ascent };
});
