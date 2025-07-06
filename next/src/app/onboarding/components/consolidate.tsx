'use client';
import AscendAbi from '@/service/Ascent.json';
import { getInstance } from '@/nexus-sdk/client';
import { useAscentRegistryRead } from '@/service/smart-contract';
import { NexusSDK, type UserAsset, BridgeAndExecuteResult, type BridgeResult } from '@avail-project/nexus';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import Transfer from '@/assets/anim/transfer.json';
import { useRouter } from 'next/navigation';

export function Consolidate({ balance }: { balance?: string }) {
    const { wallets } = useWallets();
    const { ready, user } = usePrivy();
    const { useAscentsByGrantor } = useAscentRegistryRead();
    const [consolidating, setConsolidating] = useState(true);
    const [done, setDone] = useState(true);
    const { data: contracts, isLoading } = useAscentsByGrantor(user?.wallet?.address as `0x${string}`);
    const contractsArray = Array.isArray(contracts) ? contracts : [];
    const { push } = useRouter();

    async function consolidateAssets() {
        if (!balance) return;

        // // TODO: implement actual consolidation logic here
        const sdk = await getInstance();
        console.log('Consolidating assets...');
        console.log(balance);
        console.log('ascent contract', contractsArray[0]);
        try {
            const result: BridgeAndExecuteResult = await sdk.bridgeAndExecute({
                token: 'ETH',
                amount: balance,
                toChainId: 84532, // Sepolia testnet
                execute: {
                    contractAddress: contractsArray[0],
                    contractAbi: AscendAbi,
                    functionName: 'confirmDeposit',
                    functionParams: []
                },
                waitForReceipt: true
            });

            console.log('✅ Bridge and execute completed!');
            console.log(result);
        } catch (error) {
            console.error('Operation failed:', error);
        }
    }

    // useEffect(() => {
    //     // Optionally, fetch balances on mount
    //     listAssets();
    // }, []);

    if (isLoading || consolidating) {
        return <Load />;
    }

    if (!ready) return null;

    return (
        <>
            <img src={'/img/ascend.png'} alt="Ascend Logo" className="w-full mb-4" />
            <button
                className="btn btn-outline btn-lg"
                onClick={() => {
                    setConsolidating(true);
                    setTimeout(() => {
                        push('/contracts');
                    }, 6500);
                }}
            >
                BRING THEM TOGETHER
            </button>
        </>
    );
}

function Load() {
    return (
        <div className="flex flex-col items-center justify-center h-screen w-full">
            <Lottie animationData={Transfer} loop={true} className="w-80 h-80" />
            <p className="text-2xl font-semibold text-center mt-4 animate-pulse">
                Gathering Crosschain <br /> Assets
            </p>
        </div>
    );
}
