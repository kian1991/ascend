# Ascent Deployment Guide

This directory contains Hardhat Ignition modules for deploying the Ascent inheritance system.

## Deployment Module

### AscentModule.ts
Simple deployment module that deploys:
- `Ascent` implementation contract
- `AscentRegistry` factory contract

```bash
npx hardhat ignition deploy ignition/modules/AscentModule.ts --network <network-name>
```

## Usage Examples

### Local Development
```bash
# Deploy to local Hardhat network
npx hardhat ignition deploy ignition/modules/AscentModule.ts --network hardhat
```

### Testnet Deployment
```bash
# Deploy to Sepolia testnet (configure network in hardhat.config.ts)
npx hardhat ignition deploy ignition/modules/AscentModule.ts --network sepolia
```

### Mainnet Deployment
```bash
# Deploy to mainnet (configure network in hardhat.config.ts)
npx hardhat ignition deploy ignition/modules/AscentModule.ts --network mainnet
```

## Contract Addresses

After deployment, you'll get addresses like:
- `AscentModule#AscentImplementation` - The implementation contract used by all proxies
- `AscentModule#AscentRegistry` - The factory contract for creating new Ascent instances

## Post-Deployment

1. **Verify Contracts**: Use your block explorer's verification feature or Hardhat verify plugin
2. **Test Functionality**: Create a test Ascent instance using the registry
3. **Frontend Integration**: Use the registry address to connect your frontend
4. **Documentation**: Update your frontend documentation with the deployed addresses

## Scripts

- `scripts/runTests.ts` - Test runner demonstration

## Quick Command

```bash
npx hardhat ignition deploy ignition/modules/AscentModule.ts --network <network-name>
```

## Security Notes

- ⚠️ **Mainnet Deployment**: Always test thoroughly on testnets first
- 🔐 **Private Keys**: Never commit private keys or mnemonics to version control
- 🔍 **Verification**: Always verify contracts on block explorers after deployment
- 📋 **Upgrades**: The implementation contract can be upgraded through the registry owner
