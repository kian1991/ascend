'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { countries } from '@selfxyz/core';
import { getUniversalLink } from '@selfxyz/core';
import type { EndpointType } from '@selfxyz/common';
import { SelfQRcodeWrapper, SelfAppBuilder, type SelfApp } from '@selfxyz/qrcode';
import { v4 } from 'uuid';
import { ethers } from 'ethers';
import { createUserDataABI, CaseType } from '@/utils/userData';
import { Lock } from 'lucide-react';

// Props interface for the ClaimFlow component
interface ClaimFlowProps {
    userWalletAddress: string;
    lastGrantorAddress: string;
}

// Mock beneficiary data for testing - will be replaced with real data from props
const getMockCurrentUser = (userWalletAddress: string) => ({
    wallet: userWalletAddress
});

// Mock will data - will be replaced with real data from props
const getMockWillData = (grantorWallet: string) => ({
    grantorWallet: grantorWallet,
    amount: '1.5 ETH'
});

export default function ClaimFlow({ userWalletAddress, lastGrantorAddress}: ClaimFlowProps) {
    const router = useRouter();

    // Get data using the props
    const mockCurrentUser = getMockCurrentUser(userWalletAddress);
    const mockWillData = getMockWillData(lastGrantorAddress);
    const grantorWallet = lastGrantorAddress

    // Claim flow state
    const [currentStep, setCurrentStep] = useState<'overview' | 'validating' | 'success' | 'error'>('overview');
    const [claimStatus, setClaimStatus] = useState<'idle' | 'validating' | 'processing' | 'completed' | 'failed'>('idle');

    // Self app state
    const [selfApp, setSelfApp] = useState<SelfApp | null>(null);
    const [universalLink, setUniversalLink] = useState('');
    const [userId, setUserId] = useState(ethers.ZeroAddress);

    // Use useMemo to cache the array to avoid creating a new array on each render
    const excludedCountries = useMemo(() => [countries.NORTH_KOREA], []);

    // Initialize Self app when moving to validation step
    useEffect(() => {
        if (currentStep === 'validating') {
            try {
                setUserId(grantorWallet);
                const app = new SelfAppBuilder({
                    version: 2,
                    appName: 'Ascend - Claim Inheritance',
                    scope: process.env.NEXT_PUBLIC_SELF_SCOPE || 'ascend',
                    endpoint: `${process.env.NEXT_PUBLIC_SELF_ENDPOINT}`,
                    logoBase64: 'https://i.postimg.cc/mrmVf9hm/self.png',
                    userId: userId,
                    endpointType: 'staging_celo',
                    userIdType: 'hex',
                    userDefinedData: "Verify",
                    disclosures: {
                        minimumAge: 18
                    }
                }).build();

                setSelfApp(app);
                setUniversalLink(getUniversalLink(app));
            } catch (error) {
                console.error('Failed to initialize Self app:', error);
                setCurrentStep('error');
            }
        }
    }, [currentStep, userId]);

    const openSelfApp = () => {
        if (!universalLink) return;
        window.open(universalLink, '_blank');
    };

    const handleStartClaim = () => {
        setCurrentStep('validating');
        setClaimStatus('validating');
    };

    const handleSuccessfulVerification = () => {
        setClaimStatus('processing');
        
        // Simulate blockchain transaction processing
        setTimeout(() => {
            setClaimStatus('completed');
            setCurrentStep('success');
        }, 3000);
    };

    const handleFailedVerification = () => {
        setClaimStatus('failed');
        setCurrentStep('error');
    };

    const resetClaim = () => {
        setCurrentStep('overview');
        setClaimStatus('idle');
        setSelfApp(null);
        setUniversalLink('');
    };

    // Overview Step - Initial claim information
    if (currentStep === 'overview') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8">
                <div className="w-full max-w-md">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold mb-2">Claim Ascend</h1>
                        <p className="text-base-content/60">
                            Review the details and claim your ascend
                        </p>
                    </div>

                    {/* Will Information */}
                    <div className="card bg-base-200 shadow-xl mb-6">
                        <div className="card-body">
                            <h2 className="card-title text-xl mb-4">Will Details</h2>
                            
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-base-content/70">From Wallet:</span>
                                    <span className="font-semibold font-mono text-sm truncate max-w-[150px]">
                                        {mockWillData.grantorWallet}
                                    </span>
                                </div>
                                
                                <div className="flex justify-between items-center">
                                    <span className="text-base-content/70">Amount:</span>
                                    <span className="font-semibold text-success">{mockWillData.amount}</span>
                                </div>
                            </div>

                            <div className="divider"></div>

                            <div className="alert alert-info">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                <span className="text-sm">You need to verify your identity to claim this inheritance.</span>
                            </div>
                        </div>
                    </div>

                    {/* Beneficiary Information */}
                    <div className="card bg-base-100 shadow-md border-2 border-primary bg-primary/5 mb-6">
                        <div className="card-body p-4">
                            <h3 className="font-semibold mb-2">Your Information</h3>
                            <div className="space-y-2">
                                <p className="text-xs text-base-content/60 font-mono truncate">
                                    <span className="text-base-content/70">Wallet:</span> {mockCurrentUser.wallet}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Claim Button */}
                    <div className="card bg-base-200 shadow-xl">
                        <div className="card-body">
                            <button 
                                onClick={handleStartClaim}
                                className="btn btn-primary btn-lg w-full"
                            >
                                Start Identity Verification
                            </button>
                            
                            <div className="card-actions justify-center mt-4">
                                <button 
                                    onClick={() => router.push('/')}
                                    className="btn btn-ghost"
                                >
                                    ← Back to Home
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Validation Step - ID verification
    if (currentStep === 'validating') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8">
                <div className="w-full max-w-md">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold mb-2">Verify Your Identity</h1>
                        <p className="text-base-content/60">
                            Scan the QR code to verify your identity and claim your inheritance
                        </p>
                    </div>

                    {/* Status Indicator */}
                    <div className="card bg-base-100 shadow-md border-2 border-primary bg-primary/5 mb-6">
                        <div className="card-body p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold">Identity Verification</h3>
                                    <p className="text-xs text-base-content/60">Your identity verification</p>
                                </div>
                                <div>
                                    {claimStatus === 'validating' && (
                                        <div className="badge badge-primary px-2">Validating</div>
                                    )}
                                    {claimStatus === 'processing' && (
                                        <div className="badge badge-warning px-2">Processing</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* QR Code Section */}
                    <div className="card bg-base-200 shadow-xl">
                        <div className="card-body text-center">
                            <h2 className="card-title justify-center mb-4">Scan QR Code</h2>

                            <div className="divider">Identity Verification</div>

                            <div className="flex justify-center mb-6">
                                {selfApp ? (
                                    <SelfQRcodeWrapper
                                        selfApp={selfApp}
                                        onSuccess={handleSuccessfulVerification}
                                        onError={handleFailedVerification}
                                    />
                                ) : (
                                    <div className="skeleton w-64 h-64 flex items-center justify-center">
                                        <span className="loading loading-spinner loading-lg"></span>
                                    </div>
                                )}
                            </div>

                            {claimStatus === 'processing' && (
                                <div className="alert alert-warning mb-4">
                                    <span className="loading loading-spinner"></span>
                                    <span>Processing your claim on the blockchain...</span>
                                </div>
                            )}

                            <div className="card-actions justify-center">
                                <button
                                    type="button"
                                    onClick={openSelfApp}
                                    disabled={!universalLink || claimStatus === 'processing'}
                                    className="btn btn-primary btn-wide"
                                >
                                    Open Self App
                                </button>
                            </div>

                            {/* Back Button */}
                            <div className="mt-4">
                                <button 
                                    onClick={resetClaim}
                                    disabled={claimStatus === 'processing'}
                                    className="btn btn-ghost"
                                >
                                    ← Back to Overview
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Success Step
    if (currentStep === 'success') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-success mb-2">
                            Claim Successful!
                        </h1>
                        <p className="text-base-content/60">
                            Your inheritance has been successfully claimed
                        </p>
                    </div>

                    <div className="card bg-base-200 shadow-xl mb-6">
                        <div className="card-body">
                            <div className="alert alert-success mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Identity verified and inheritance claimed</span>
                            </div>

                            <div className="stats stats-vertical w-full">
                                <div className="stat">
                                    <div className="stat-title">Amount Claimed</div>
                                    <div className="stat-value text-success">{mockWillData.amount}</div>
                                </div>
                                <div className="stat">
                                    <div className="stat-title">Transaction Status</div>
                                    <div className="stat-value text-sm">Completed</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card bg-base-200 shadow-xl">
                        <div className="card-body">
                            <div className="card-actions justify-center gap-4">
                                <button 
                                    onClick={() => router.push('/')}
                                    className="btn btn-primary flex-1"
                                >
                                    Go Home
                                </button>
                                <button 
                                    onClick={() => router.push('/dashboard')}
                                    className="btn btn-secondary flex-1"
                                >
                                    View Dashboard
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Error Step
    if (currentStep === 'error') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-error mb-2">
                            Claim Failed
                        </h1>
                        <p className="text-base-content/60">
                            There was an issue with your identity verification
                        </p>
                    </div>

                    <div className="card bg-base-200 shadow-xl mb-6">
                        <div className="card-body">
                            <div className="alert alert-error">
                                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Identity verification failed. Please try again.</span>
                            </div>
                        </div>
                    </div>

                    <div className="card bg-base-200 shadow-xl">
                        <div className="card-body">
                            <div className="card-actions justify-center gap-4">
                                <button 
                                    onClick={resetClaim}
                                    className="btn btn-primary flex-1"
                                >
                                    Try Again
                                </button>
                                <button 
                                    onClick={() => router.push('/')}
                                    className="btn btn-ghost flex-1"
                                >
                                    Go Home
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}