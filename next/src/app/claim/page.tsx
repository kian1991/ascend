'use client';

import { AscendLoading } from '@/components/ui/ascend-loading';
import { useAscentRegistry, useAscentRegistryRead } from '@/service/smart-contract';
import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';
import ClaimFlow from './_components/flow';

export default function ClaimPage() {
    const { user } = usePrivy();
    const { useGrantorsByBeneficiary, useAscentsByGrantor } = useAscentRegistryRead();
    const { data: grantors, isLoading } = useGrantorsByBeneficiary(user?.wallet?.address as `0x${string}`);
    const { data: ascents, isLoading: isAscentsLoading } = useAscentsByGrantor(
        grantors && Array.isArray(grantors) && grantors.length > 0
            ? (grantors[0] as `0x${string}`)
            : ('0x0000000000000000000000000000000000000000' as `0x${string}`)
    );

    // State to track if claim button was clicked
    const [showClaimFlow, setShowClaimFlow] = useState(false);

    console.log('User Wallet Address:', user?.wallet?.address);

    useEffect(() => {
        if (grantors) {
            console.log('Grantors:', grantors);
        }
        if (ascents) {
            console.log('Ascents:', ascents);
        }
    }, [grantors, ascents]);

    // Handle claim button click
    const handleClaimClick = () => {
        setShowClaimFlow(true);
    };

    if (isLoading || isAscentsLoading) {
        return <AscendLoading />;
    }

    // If claim flow should be shown, render the ClaimFlow component
    if (showClaimFlow) {
        return (
            <ClaimFlow
                userWalletAddress={user?.wallet?.address || ''}
                //firstGrantorAddress={(grantors && Array.isArray(grantors) && grantors.length > 0) ? grantors[0] as string : ''}
                lastGrantorAddress={
                    grantors && Array.isArray(grantors) && grantors.length > 0
                        ? (grantors[grantors.length - 1] as string)
                        : ''
                }
            />
        );
    }

    if (!grantors || !Array.isArray(grantors) || grantors.length === 0) {
        return (
            <main className="min-h-screen flex flex-col items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold mb-2">No Ascends Available</h1>
                        <p className="text-base-content/60">You do not have any claimable ascend at this time.</p>
                    </div>

                    <div className="">
                        <div className="card-body">
                            <div className="alert alert-info">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    className="stroke-current shrink-0 w-6 h-6"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    ></path>
                                </svg>
                                <span className="text-sm">No grantors found associated with your wallet address.</span>
                            </div>

                            <div className="card-actions justify-center mt-4">
                                <button onClick={() => (window.location.href = '/')} className="btn btn-primary">
                                    ← Back to Home
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    console.log('Grantors:', grantors);
    console.log('Ascents:', ascents);

    // Main claim page with inheritance information
    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-8">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">Ascend Available</h1>
                    <p className="text-base-content/60">You have an Ascend available for claiming</p>
                </div>

                {/* Display inheritance information */}
                <div className="card bg-base-200 shadow-xl mb-6">
                    <div className="card-body">
                        <h2 className="card-title text-xl mb-4">Available Ascend</h2>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-base-content/70">Grantors Found:</span>
                                <span className="font-semibold">{Array.isArray(grantors) ? grantors.length : 0}</span>
                            </div>

                            {ascents && Array.isArray(ascents) && ascents.length > 0 ? (
                                <div className="flex justify-between items-center">
                                    <span className="text-base-content/70">Total Ascents:</span>
                                    <span className="font-semibold">{ascents.length}</span>
                                </div>
                            ) : null}

                            <div className="flex justify-between items-center">
                                <span className="text-base-content/70">Your Wallet:</span>
                                <span className="font-mono text-xs truncate max-w-32" title={user?.wallet?.address}>
                                    {user?.wallet?.address}
                                </span>
                            </div>
                        </div>

                        <div className="divider"></div>

                        <div className="alert alert-info">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                className="stroke-current shrink-0 w-6 h-6"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                ></path>
                            </svg>
                            <span className="text-sm">Identity verification required to proceed with claiming.</span>
                        </div>
                    </div>
                </div>

                {/* Claim button */}
                <div className="card bg-base-200 shadow-xl">
                    <div className="card-body">
                        <button onClick={handleClaimClick} className="btn btn-primary btn-lg w-full">
                            CLAIM
                        </button>

                        <div className="card-actions justify-center mt-4">
                            <button onClick={() => (window.location.href = '/')} className="btn btn-ghost">
                                ← Back to Home
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
