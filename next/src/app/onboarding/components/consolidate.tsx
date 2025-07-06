'use client';
import AscendAbi from '@/service/Ascent.json';
import { getInstance } from '@/nexus-sdk/client';
import { useAscentRegistryRead } from '@/service/smart-contract';
import {
  NexusSDK,
  type UserAsset,
  BridgeAndExecuteResult,
  type BridgeResult,
} from '@avail-project/nexus';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';

export function Consolidate() {
  const { wallets } = useWallets();
  const { ready, user } = usePrivy();
  const [balance, setBalance] = useState<string>();
  const { useAscentsByGrantor } = useAscentRegistryRead();
  const { data: contracts, isLoading } = useAscentsByGrantor(
    user?.wallet?.address as `0x${string}`
  );
  const contractsArray = Array.isArray(contracts) ? contracts : [];

  async function listAssets() {
    const sdk = await getInstance();
    const balances = await sdk.getUnifiedBalances();
    console.log('consolidate assets', balances);
    const ethBalance = balances.find(
      (balance) => balance.symbol === 'ETH'
    )?.balance;
    setBalance(ethBalance);
  }

  async function consolidateAssets() {
    // TODO: implement actual consolidation logic here
    const sdk = await getInstance();
    console.log('Consolidating assets...');
    console.log(balance);
    console.log('ascent contract', contractsArray[0]);
    try {
      //   const result: BridgeAndExecuteResult = await sdk.bridgeAndExecute({
      //     token: 'ETH',
      //     amount: '1000',
      //     toChainId: 84532, // Sepolia testnet
      //     execute: {
      //       contractAddress: contractsArray[0],
      //       contractAbi: AscendAbi,
      //       functionName: 'deposit',
      //       functionParams: [amount, userAddress],
      //     },
      //     waitForReceipt: true,
      //   });
      const result: BridgeResult = await sdk.bridge({
        token: 'ETH',
        amount: 100,
        // toChainId: 84532, // Base Sepolia
        toChainId: 421614, // Arbitrum Sepolia
      });

      console.log('✅ Bridge and execute completed!');
      console.log(result);
    } catch (error) {
      console.error('Operation failed:', error);
    }
  }

  useEffect(() => {
    // Optionally, fetch balances on mount
    listAssets();
  }, []);

  if (!ready) return null;

  return (
    <button className='btn btn-outline btn-lg' onClick={consolidateAssets}>
      BRING THEM TOGETHER
    </button>
  );
}
