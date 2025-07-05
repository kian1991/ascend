#!/usr/bin/env node

/**
 * Deployment script for Ascent inheritance system
 * 
 * This script provides an easy way to deploy the contracts to different networks
 * 
 * Usage:
 * npm run deploy:local     # Deploy to local hardhat network
 * npm run deploy:testnet   # Deploy to testnet (configure in hardhat.config.ts)
 * npm run deploy:mainnet   # Deploy to mainnet (configure in hardhat.config.ts)
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const networks = {
  local: 'localhost',
  testnet: 'sepolia', // Change this to your preferred testnet
  mainnet: 'mainnet'  // Change this to your preferred mainnet
};

async function deploy(network: string) {
  try {
    console.log(`🚀 Deploying Ascent contracts to ${network}...`);
    
    const command = `npx hardhat ignition deploy ignition/modules/AscentModule.ts --network ${network}`;
    
    console.log(`Running: ${command}`);
    
    const { stdout, stderr } = await execAsync(command);
    
    if (stderr) {
      console.error('❌ Deployment errors:', stderr);
    }
    
    console.log('✅ Deployment output:', stdout);
    
    console.log(`🎉 Successfully deployed to ${network}!`);
    
  } catch (error) {
    console.error('💥 Deployment failed:', error);
    process.exit(1);
  }
}

// Get network from command line arguments
const network = process.argv[2];

if (!network || !networks[network as keyof typeof networks]) {
  console.log('Usage: node deploy.js <network>');
  console.log('Available networks:', Object.keys(networks).join(', '));
  process.exit(1);
}

deploy(networks[network as keyof typeof networks]);
