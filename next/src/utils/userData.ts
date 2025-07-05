// Helper functions for creating userData with case type and address

export enum CaseType {
  CONNECT = 1,
  VERIFY = 2
}

/**
 * Create userData bytes containing case type and Ethereum address
 * @param caseType 1 for Connect, 2 for Verify
 * @param ethAddress Ethereum address as string
 * @returns Hex string of encoded userData
 */
export function createUserData(caseType: CaseType, ethAddress: string): `0x${string}` {
  // Convert case type to hex (1 byte)
  const caseHex = caseType.toString(16).padStart(2, '0');
  
  // Remove 0x prefix from address and ensure it's lowercase
  const addressHex = ethAddress.toLowerCase().replace('0x', '');
  
  // Combine: 1 byte case + 20 bytes address
  return `0x${caseHex}${addressHex}` as `0x${string}`;
}

/**
 * Alternative: Using ethers ABI encoding (more gas efficient)
 */
import { ethers } from "ethers";

export function createUserDataABI(caseType: CaseType, ethAddress: string): string {
  return ethers.AbiCoder.defaultAbiCoder().encode(
    ["uint8", "address"],
    [caseType, ethAddress]
  );
}

/**
 * Create userData for struct encoding (most efficient)
 */
export function createUserDataStruct(caseType: CaseType, ethAddress: string): string {
  return ethers.AbiCoder.defaultAbiCoder().encode(
    ["tuple(uint8,address)"],
    [[caseType, ethAddress]]
  );
}

// Usage examples:
/*
// Method 1: Simple concatenation
const connectData = createUserData(CaseType.CONNECT, "0x742D35cc6834C532532da037EE398710C3cdA915");
const verifyData = createUserData(CaseType.VERIFY, "0x742D35cc6834C532532da037EE398710C3cdA915");

// Method 2: ABI encoding (recommended)
const connectDataABI = createUserDataABI(CaseType.CONNECT, "0x742D35cc6834C532532da037EE398710C3cdA915");
const verifyDataABI = createUserDataABI(CaseType.VERIFY, "0x742D35cc6834C532532da037EE398710C3cdA915");

// Method 3: Struct encoding (most gas efficient)
const connectDataStruct = createUserDataStruct(CaseType.CONNECT, "0x742D35cc6834C532532da037EE398710C3cdA915");
const verifyDataStruct = createUserDataStruct(CaseType.VERIFY, "0x742D35cc6834C532532da037EE398710C3cdA915");
*/
