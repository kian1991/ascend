"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { countries } from "@selfxyz/core";
import { getUniversalLink } from '@selfxyz/core';
import type { EndpointType } from '@selfxyz/common';
import {
  SelfQRcodeWrapper,
  SelfAppBuilder,
  type SelfApp,
} from "@selfxyz/qrcode";
import { v4 } from "uuid";
import { ethers } from "ethers";
import { createUserData, CaseType } from "@/utils/userData";

// Mock beneficiary data
interface Beneficiary {
  name: string;
  lastName: string;
  wallet?: string;
}


const mockAscendID = "0xa783Dd4f1Aaa4BE8e8b0Cf70aE3E24e635dBC514"
const mockBeneficiaries: Beneficiary[] = [
  {
    name: 'Kian',
    lastName: 'Lütke',
    wallet: '0x4a1db00CEF07772e38D0235A0341164Ec1D63C09'
  },
  {
    name: 'Tim',
    lastName: 'Sigl', 
    wallet: '0x06Ed05340de68Dd5BaF10Fc77e296b106De7b2ee'
  }
];

export default function Page() {
  const router = useRouter();
  
  // Beneficiary flow state
  const [currentBeneficiaryIndex, setCurrentBeneficiaryIndex] = useState(0);
  const [validationResults, setValidationResults] = useState<{[key: number]: boolean}>({});
  const [allValidationsComplete, setAllValidationsComplete] = useState(false);
  const [showValidationSummary, setShowValidationSummary] = useState(false);
  
  // Self app state
  const [linkCopied, setLinkCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [selfApp, setSelfApp] = useState<SelfApp | null>(null);
  const [universalLink, setUniversalLink] = useState("");
  const [userId, setUserId] = useState(ethers.ZeroAddress);
  
  const currentBeneficiary = mockBeneficiaries[currentBeneficiaryIndex];
  const title = `Securing ${currentBeneficiary.name} ${currentBeneficiary.lastName}`;
  
  // Use useMemo to cache the array to avoid creating a new array on each render
  const excludedCountries = useMemo(() => [countries.NORTH_KOREA], []);

  // Use useEffect to ensure code only executes on the client side and reinitialize when beneficiary changes
  useEffect(() => {
    try {
      // Use current beneficiary's wallet address if available, otherwise use default
      setUserId(mockAscendID)
      const app = new SelfAppBuilder({
        version: 2,
        appName: "Ascend",
        scope: process.env.NEXT_PUBLIC_SELF_SCOPE || "ascend",
        endpoint: `${process.env.NEXT_PUBLIC_SELF_ENDPOINT}`,
        logoBase64:
          "https://i.postimg.cc/mrmVf9hm/self.png", // url of a png image, base64 is accepted but not recommended
        userId: userId,
        endpointType: "staging_celo",
        userIdType: "hex", // use 'hex' for ethereum address or 'uuid' for uuidv4
        userDefinedData: createUserData(CaseType.VERIFY, currentBeneficiary.wallet || "0xa783Dd4f1Aaa4BE8e8b0Cf70aE3E24e635dBC514"),
        disclosures: {
          // ofac: false,
          // excludedCountries: [countries.BELGIUM],
          minimumAge: 18,
        }
      }).build();

      setSelfApp(app);
      setUniversalLink(getUniversalLink(app));
    } catch (error) {
      console.error("Failed to initialize Self app:", error);
    }
  }, [currentBeneficiaryIndex]); // Reinitialize when beneficiary changes

  const displayToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const copyToClipboard = () => {
    if (!universalLink) return;

    navigator.clipboard
      .writeText(universalLink)
      .then(() => {
        setLinkCopied(true);
        displayToast("Universal link copied to clipboard!");
        setTimeout(() => setLinkCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        displayToast("Failed to copy link");
      });
  };

  const openSelfApp = () => {
    if (!universalLink) return;

    window.open(universalLink, "_blank");
    displayToast("Opening Self App...");
  };

  const handleSuccessfulVerification = () => {
    displayToast("Verification successful!");
    
    // Store validation result
    setValidationResults(prev => ({
      ...prev,
      [currentBeneficiaryIndex]: true
    }));
    
    // Move to next beneficiary or show summary
    if (currentBeneficiaryIndex < mockBeneficiaries.length - 1) {
      setTimeout(() => {
        setCurrentBeneficiaryIndex(prev => prev + 1);
        displayToast(`Moving to next beneficiary...`);
      }, 1500);
    } else {
      setTimeout(() => {
        setAllValidationsComplete(true);
        setShowValidationSummary(true);
      }, 1500);
    }
  };

  const handleFailedVerification = () => {
    displayToast("Verification failed!");
    
    // Store validation result
    setValidationResults(prev => ({
      ...prev,
      [currentBeneficiaryIndex]: false
    }));
    
    // Still move to next beneficiary after failure
    if (currentBeneficiaryIndex < mockBeneficiaries.length - 1) {
      setTimeout(() => {
        setCurrentBeneficiaryIndex(prev => prev + 1);
        displayToast(`Moving to next beneficiary...`);
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
      <div className="min-h-screen w-full bg-gray-50 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-center text-green-600">
            All Validations Complete! 🎉
          </h1>
          
          <div className="space-y-3 mb-6">
            {mockBeneficiaries.map((beneficiary, index) => (
              <div 
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  validationResults[index] 
                    ? 'bg-green-100 border border-green-300' 
                    : 'bg-red-100 border border-red-300'
                }`}
              >
                <span className="font-semibold">
                  {beneficiary.name} {beneficiary.lastName}
                </span>
                <span className="text-sm font-bold">
                  {validationResults[index] ? '✅ Valid' : '❌ Failed'}
                </span>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button 
              onClick={resetValidation}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-md font-medium transition-colors"
            >
              Validate Again
            </button>
            <button 
              onClick={() => router.push('/')}
              className="flex-1 bg-gray-600 hover:bg-gray-500 text-white p-3 rounded-md font-medium transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      {/* Progress Indicator */}
      <div className="w-full max-w-md mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Beneficiary {currentBeneficiaryIndex + 1} of {mockBeneficiaries.length}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(((currentBeneficiaryIndex) / mockBeneficiaries.length) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${((currentBeneficiaryIndex) / mockBeneficiaries.length) * 100}%` 
            }}
          />
        </div>
      </div>

      {/* Beneficiary List with Status */}
      <div className="w-full max-w-md space-y-2 mb-6">
        {mockBeneficiaries.map((beneficiary, index) => {
          const status = getValidationStatus(index);
          return (
            <div 
              key={index}
              className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                status === 'current' 
                  ? 'border-blue-500 bg-blue-50' 
                  : status === 'completed-success'
                  ? 'border-green-500 bg-green-50'
                  : status === 'completed-failed'
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div>
                <span className="font-semibold text-gray-800">
                  {beneficiary.name} {beneficiary.lastName}
                </span>
                {beneficiary.wallet && (
                  <div className="text-xs text-gray-500 font-mono truncate max-w-[200px]">
                    {beneficiary.wallet}
                  </div>
                )}
              </div>
              <div className="text-right">
                {status === 'current' && (
                  <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">Current</span>
                )}
                {status === 'completed-success' && (
                  <span className="text-green-600 font-bold text-lg">✅</span>
                )}
                {status === 'completed-failed' && (
                  <span className="text-red-600 font-bold text-lg">❌</span>
                )}
                {status === 'pending' && (
                  <span className="bg-gray-300 text-gray-600 px-2 py-1 rounded text-xs">Pending</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Header */}
      <div className="mb-6 md:mb-8 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-800">
          {title}
        </h1>
        <p className="text-sm sm:text-base text-gray-600 px-2">
          Scan QR code with Self Protocol App to secure the identity
        </p>
      </div>

      {/* Main content */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto">
        <div className="flex justify-center mb-4 sm:mb-6">
          {selfApp ? (
            <SelfQRcodeWrapper
              selfApp={selfApp}
              onSuccess={handleSuccessfulVerification}
              onError={handleFailedVerification}
            />
          ) : (
            <div className="w-[256px] h-[256px] bg-gray-200 animate-pulse flex items-center justify-center">
              <p className="text-gray-500 text-sm">Loading QR Code...</p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2 mb-4 sm:mb-6">
          <button
            type="button"
            onClick={copyToClipboard}
            disabled={!universalLink}
            className="flex-1 bg-gray-800 hover:bg-gray-700 transition-colors text-white p-2 rounded-md text-sm sm:text-base disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {linkCopied ? "Copied!" : "Copy Universal Link"}
          </button>

          <button
            type="button"
            onClick={openSelfApp}
            disabled={!universalLink}
            className="flex-1 bg-blue-600 hover:bg-blue-500 transition-colors text-white p-2 rounded-md text-sm sm:text-base mt-2 sm:mt-0 disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            Open Self App
          </button>
        </div>

        {/* Navigation Controls */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => {
              if (currentBeneficiaryIndex > 0) {
                setCurrentBeneficiaryIndex(prev => prev - 1);
              }
            }}
            disabled={currentBeneficiaryIndex === 0}
            className="flex-1 bg-gray-400 hover:bg-gray-500 disabled:bg-gray-300 text-white p-2 rounded-md text-sm transition-colors"
          >
            ← Previous
          </button>
          
          <button
            onClick={() => {
              if (currentBeneficiaryIndex < mockBeneficiaries.length - 1) {
                setCurrentBeneficiaryIndex(prev => prev + 1);
              }
            }}
            disabled={currentBeneficiaryIndex === mockBeneficiaries.length - 1}
            className="flex-1 bg-gray-400 hover:bg-gray-500 disabled:bg-gray-300 text-white p-2 rounded-md text-sm transition-colors"
          >
            Next →
          </button>
        </div>

        <div className="flex flex-col items-center gap-2 mt-2">
          <span className="text-gray-500 text-xs uppercase tracking-wide">User Address</span>
          <div className="bg-gray-100 rounded-md px-3 py-2 w-full text-center break-all text-sm font-mono text-gray-800 border border-gray-200">
            {userId ? userId : <span className="text-gray-400">Not connected</span>}
          </div>
        </div>

        {/* Toast notification */}
        {showToast && (
          <div className="fixed bottom-4 right-4 bg-gray-800 text-white py-2 px-4 rounded shadow-lg animate-fade-in text-sm">
            {toastMessage}
          </div>
        )}
      </div>
    </div>
  );
}

