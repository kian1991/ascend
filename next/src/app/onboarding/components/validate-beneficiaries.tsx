'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { countries } from '@selfxyz/core';
import { getUniversalLink } from '@selfxyz/core';
import type { EndpointType } from '@selfxyz/common';
import { SelfQRcodeWrapper, SelfAppBuilder, type SelfApp } from '@selfxyz/qrcode';
import { v4 } from 'uuid';
import { ethers } from 'ethers';
import { createUserData, CaseType } from '@/utils/userData';

// Mock beneficiary data
interface Beneficiary {
    name: string;
    lastName: string;
    wallet?: string;
}

export function ValidateBeneficiaries({
    beneficiaries,
    grantorWallet
}: {
    beneficiaries: Beneficiary[];
    grantorWallet: string;
}) {
    const router = useRouter();

    // Beneficiary flow state
    const [currentBeneficiaryIndex, setCurrentBeneficiaryIndex] = useState(0);
    const [validationResults, setValidationResults] = useState<{ [key: number]: boolean }>({});
    const [allValidationsComplete, setAllValidationsComplete] = useState(false);
    const [showValidationSummary, setShowValidationSummary] = useState(false);

    // Self app state
    const [linkCopied, setLinkCopied] = useState(false);
    const [selfApp, setSelfApp] = useState<SelfApp | null>(null);
    const [universalLink, setUniversalLink] = useState('');
    const [userId, setUserId] = useState(ethers.ZeroAddress);

    const currentBeneficiary = beneficiaries[currentBeneficiaryIndex];

    // Use useMemo to cache the array to avoid creating a new array on each render
    const excludedCountries = useMemo(() => [countries.NORTH_KOREA], []);

    // Use useEffect to ensure code only executes on the client side and reinitialize when beneficiary changes
    useEffect(() => {
        try {
            // Use current beneficiary's wallet address if available, otherwise use default
            setUserId(grantorWallet);
            const app = new SelfAppBuilder({
                version: 2,
                appName: 'Ascend',
                scope: process.env.NEXT_PUBLIC_SELF_SCOPE || 'ascend',
                endpoint: `${process.env.NEXT_PUBLIC_SELF_ENDPOINT}`,
                logoBase64: 'https://i.postimg.cc/mrmVf9hm/self.png', // url of a png image, base64 is accepted but not recommended
                userId: userId,
                endpointType: 'staging_celo',
                userIdType: 'hex', // use 'hex' for ethereum address or 'uuid' for uuidv4
                userDefinedData: "Connect",
                disclosures: {
                    // ofac: false,
                    // excludedCountries: [countries.BELGIUM],
                    minimumAge: 18
                }
            }).build();

            setSelfApp(app);
            setUniversalLink(getUniversalLink(app));
        } catch (error) {
            console.error('Failed to initialize Self app:', error);
        }
    }, [currentBeneficiaryIndex]); // Reinitialize when beneficiary changes

    const copyToClipboard = () => {
        if (!universalLink) return;

        navigator.clipboard
            .writeText(universalLink)
            .then(() => {
                setLinkCopied(true);
                setTimeout(() => setLinkCopied(false), 2000);
            })
            .catch((err) => {
                console.error('Failed to copy text: ', err);
            });
    };

    const openSelfApp = () => {
        if (!universalLink) return;
        window.open(universalLink, '_blank');
    };

    const handleSuccessfulVerification = () => {
        // Store validation result
        setValidationResults((prev) => ({
            ...prev,
            [currentBeneficiaryIndex]: true
        }));

        // Move to next beneficiary or show summary
        if (currentBeneficiaryIndex < beneficiaries.length - 1) {
            setTimeout(() => {
                setCurrentBeneficiaryIndex((prev) => prev + 1);
            }, 1500);
        } else {
            setTimeout(() => {
                setAllValidationsComplete(true);
                setShowValidationSummary(true);
            }, 1500);
        }
    };

    const handleFailedVerification = () => {
        // Store validation result
        setValidationResults((prev) => ({
            ...prev,
            [currentBeneficiaryIndex]: false
        }));

        // Still move to next beneficiary after failure
        if (currentBeneficiaryIndex < beneficiaries.length - 1) {
            setTimeout(() => {
                setCurrentBeneficiaryIndex((prev) => prev + 1);
            }, 2000);
        } else {
            setTimeout(() => {
                setAllValidationsComplete(true);
                setShowValidationSummary(true);
            }, 2000);
        }
    };

    const resetValidation = () => {
        setCurrentBeneficiaryIndex(0);
        setValidationResults({});
        setAllValidationsComplete(false);
        setShowValidationSummary(false);
    };

    const getValidationStatus = (index: number) => {
        if (index < currentBeneficiaryIndex) {
            return validationResults[index] ? 'completed-success' : 'completed-failed';
        } else if (index === currentBeneficiaryIndex && !allValidationsComplete) {
            return 'current';
        } else {
            return 'pending';
        }
    };

    // Show validation summary if all validations are complete
    if (showValidationSummary) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8">
            <div className="w-full max-w-md">
                {/* Summary Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-success mb-2">
                        All Validations Complete! 🎉
                    </h1>
                    <p className="text-base-content/60">
                        {Object.values(validationResults).filter(Boolean).length} of {beneficiaries.length} beneficiaries validated successfully
                    </p>
                </div>

                {/* Results List */}
                <div className="space-y-2 mb-8">
                    {beneficiaries.map((beneficiary, index) => (
                        <div
                            key={index}
                            className={`card bg-base-100 shadow-md border-2 transition-all ${
                                validationResults[index]
                                    ? 'border-success bg-success/10'
                                    : 'border-error bg-error/10'
                            }`}
                        >
                            <div className="card-body p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold">
                                            {beneficiary.name} {beneficiary.lastName}
                                        </h3>
                                        {beneficiary.wallet && (
                                            <p className="text-xs text-base-content/60 font-mono truncate max-w-[200px]">
                                                {beneficiary.wallet}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        {validationResults[index] ? (
                                            <div className="badge badge-success">✅ Valid</div>
                                        ) : (
                                            <div className="badge badge-error">❌ Failed</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8">
            <div className="w-full max-w-md">
                {/* Progress Indicator */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">
                            Beneficiary {currentBeneficiaryIndex + 1} of {beneficiaries.length}
                        </span>
                        <span className="text-sm text-base-content/60">
                            {Math.round((currentBeneficiaryIndex / beneficiaries.length) * 100)}% Complete
                        </span>
                    </div>
                    <progress 
                        className="progress progress-primary w-full" 
                        value={currentBeneficiaryIndex} 
                        max={beneficiaries.length}
                    ></progress>
                </div>

                {/* Beneficiary List with Status */}
                <div className="space-y-2 mb-8">
                    {beneficiaries.map((beneficiary, index) => {
                        const status = getValidationStatus(index);
                        return (
                            <div
                                key={index}
                                className={`card bg-base-100 shadow-md border-2 transition-all ${
                                    status === 'current'
                                        ? 'border-primary bg-primary/10'
                                        : status === 'completed-success'
                                        ? 'border-success bg-success/10'
                                        : status === 'completed-failed'
                                        ? 'border-error bg-error/10'
                                        : 'border-base-300'
                                }`}
                            >
                                <div className="card-body p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold">
                                                {beneficiary.name} {beneficiary.lastName}
                                            </h3>
                                            {beneficiary.wallet && (
                                                <p className="text-xs text-base-content/60 font-mono truncate max-w-[200px]">
                                                    {beneficiary.wallet}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            {status === 'current' && (
                                                <div className="badge badge-primary">Current</div>
                                            )}
                                            {status === 'completed-success' && (
                                                <span className="badge badge-success">✅ Valid</span>
                                            )}
                                            {status === 'completed-failed' && (
                                                <span className="text-error">❌ Failed</span>
                                            )}
                                            {status === 'pending' && (
                                                <div className="badge badge-ghost">Pending</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Current Beneficiary Validation */}
                <div className="card bg-base-200 shadow-xl">
                    <div className="card-body text-center">
                        <h1 className="card-title text-2xl justify-center mb-4">Validate ID</h1>
                        <h2 className="text-xl mb-6">
                            {currentBeneficiary.name} {currentBeneficiary.lastName}
                        </h2>

                        <div className="divider">Scan QR Code</div>

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

                        <div className="card-actions justify-center">
                            <button
                                type="button"
                                onClick={openSelfApp}
                                disabled={!universalLink}
                                className="btn btn-primary btn-wide"
                            >
                                Open Self App
                            </button>
                        </div>

                        {/* Navigation Controls */}
                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={() => {
                                    if (currentBeneficiaryIndex > 0) {
                                        setCurrentBeneficiaryIndex((prev) => prev - 1);
                                    }
                                }}
                                disabled={currentBeneficiaryIndex === 0}
                                className="btn btn-outline flex-1"
                            >
                                ← Previous
                            </button>

                            <button
                                onClick={() => {
                                    if (currentBeneficiaryIndex < beneficiaries.length - 1) {
                                        setCurrentBeneficiaryIndex((prev) => prev + 1);
                                    }
                                }}
                                disabled={currentBeneficiaryIndex === beneficiaries.length - 1}
                                className="btn btn-outline flex-1"
                            >
                                Next →
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}