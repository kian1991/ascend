# Ascend – Onchain Last Will

Ascend is an onchain inheritance and asset consolidation platform, developed during ETH Cannes Global. It enables users to create, manage, and claim digital wills securely on Ethereum and Celo testnets.

## Features

- **Onchain Last Will:** Create and manage inheritance contracts for your digital assets.
- **Beneficiary Verification:** Secure, privacy-preserving identity checks for beneficiaries using Self.ID.
- **Asset Consolidation:** Bring together assets from multiple wallets for streamlined inheritance.
- **Modern UI:** Built with Next.js, DaisyUI, and TypeScript for a seamless user experience.
- **Smart Contracts:** Solidity contracts for will creation, verification, and claiming.

## Getting Started

1. **Install dependencies:**
   ```bash
   cd next
   npm install
   cd ../contracts
   npm install
   ```

2. **Start the frontend:**
   ```bash
   cd ../next
   npm run dev
   ```

3. **Deploy smart contracts (Example Celo Testnet):**
    ### Set private key for deployment on Celo testnet (alfajores) 

    ```shell
    npx hardhat keystore set ALFAJORES_PRIVATE_KEY 
    ```
   ```bash
   cd ../contracts
   npx hardhat ignition deploy --network alfajores ignition/modules/AscentModule.ts
   npx hardhat ignition deploy --network alfajores ignition/modules UserVerificationModule.ts
   ```

4. **Open the app:**  
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- Next.js, React, DaisyUI, TypeScript
- Solidity, Hardhat
- Celo & Ethereum Testnets
- Self.ID for identity verification

## About

Developed at the [ETH Cannes Global](https://ethcannes.global) 2024 by the Ascend team.

---

*For demo purposes only. Not audited. Use at your own risk.*

# Ascend Contracts

### Running Tests


```shell
npx hardhat test
```

You can also selectively run the Solidity or `node:test` tests:

```shell
npx hardhat test solidity
npx hardhat test nodejs
```

For better option of debugging, especially of the contracts and the zk-proof-process of self-protocol we´ve created helper scripts using hardhat and viem to interact with the contract over the chain.
These can be found in next/contracts/scripts

