import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useSimulateContract } from 'wagmi';
import { Address } from 'viem';

// Import actual ABIs from compiled contracts
import AscentRegistryArtifact from './AscentRegistry.json';
import AscentArtifact from './Ascent.json';
import { ASCEND_IMPLEMENTATION, ASCEND_REGISTRY } from '@/constants';

// Contract addresses - Update these after deployment
export const CONTRACT_ADDRESSES = {
    ASCENT_REGISTRY: ASCEND_REGISTRY as Address, // Replace with deployed AscentRegistry address
    ASCENT_IMPLEMENTATION: ASCEND_IMPLEMENTATION as Address // Replace with deployed Ascent implementation address
} as const;

// ABI definitions - Use actual ABIs from compiled contracts
export const ASCENT_REGISTRY_ABI = AscentRegistryArtifact.abi;
export const ASCENT_ABI = AscentArtifact.abi;

// Check-in interval enum
export enum CheckInInterval {
    SEVEN_DAYS = 0, // 7 days
    FOURTEEN_DAYS = 1, // 14 days
    THIRTY_DAYS = 2, // 30 days
    ONE_EIGHTY_DAYS = 3, // 180 days
    THREE_SIXTY_FIVE_DAYS = 4 // 365 days
}

// AscentRegistry Contract Functions
export const useAscentRegistry = () => {
    const { writeContract, isPending, error } = useWriteContract();

    const createAscent = async (grantor: Address, beneficiaries: Address[], checkInInterval: CheckInInterval) => {
        return writeContract({
            address: CONTRACT_ADDRESSES.ASCENT_REGISTRY,
            abi: ASCENT_REGISTRY_ABI,
            functionName: 'createAscent',
            args: [grantor, beneficiaries, checkInInterval]
        });
    };

    const updateImplementation = async (newImplementation: Address) => {
        return writeContract({
            address: CONTRACT_ADDRESSES.ASCENT_REGISTRY,
            abi: ASCENT_REGISTRY_ABI,
            functionName: 'updateImplementation',
            args: [newImplementation]
        });
    };

    return {
        createAscent,
        updateImplementation,
        isPending,
        error
    };
};

// Read functions for AscentRegistry
export const useAscentRegistryRead = () => {
    const useImplementationContract = () =>
        useReadContract({
            address: CONTRACT_ADDRESSES.ASCENT_REGISTRY,
            abi: ASCENT_REGISTRY_ABI,
            functionName: 'implementationContract'
        });

    const useTotalAscents = () =>
        useReadContract({
            address: CONTRACT_ADDRESSES.ASCENT_REGISTRY,
            abi: ASCENT_REGISTRY_ABI,
            functionName: 'getTotalAscents'
        });

    const useAscentsByGrantor = (grantor: Address) =>
        useReadContract({
            address: CONTRACT_ADDRESSES.ASCENT_REGISTRY,
            abi: ASCENT_REGISTRY_ABI,
            functionName: 'getAscentsByGrantor',
            args: [grantor]
        });

    const useBeneficiariesByGrantor = (grantor: Address) =>
        useReadContract({
            address: CONTRACT_ADDRESSES.ASCENT_REGISTRY,
            abi: ASCENT_REGISTRY_ABI,
            functionName: 'getBeneficiariesByGrantor',
            args: [grantor]
        });

    const useGrantorsByBeneficiary = (beneficiary: Address) =>
        useReadContract({
            address: CONTRACT_ADDRESSES.ASCENT_REGISTRY,
            abi: ASCENT_REGISTRY_ABI,
            functionName: 'getGrantorsByBeneficiary',
            args: [beneficiary]
        });

    const useIsGrantorBeneficiaryRelationship = (grantor: Address, beneficiary: Address) =>
        useReadContract({
            address: CONTRACT_ADDRESSES.ASCENT_REGISTRY,
            abi: ASCENT_REGISTRY_ABI,
            functionName: 'isGrantorBeneficiaryRelationship',
            args: [grantor, beneficiary]
        });

    return {
        useImplementationContract,
        useTotalAscents,
        useAscentsByGrantor,
        useBeneficiariesByGrantor,
        useGrantorsByBeneficiary,
        useIsGrantorBeneficiaryRelationship
    };
};

// Ascent Contract Functions
export const useAscent = (ascentAddress: Address) => {
    const { writeContract, isPending, error } = useWriteContract();

    const checkIn = async () => {
        return writeContract({
            address: ascentAddress,
            abi: ASCENT_ABI,
            functionName: 'checkIn',
            args: []
        });
    };

    const addBeneficiary = async (beneficiary: Address) => {
        return writeContract({
            address: ascentAddress,
            abi: ASCENT_ABI,
            functionName: 'addBeneficiary',
            args: [beneficiary]
        });
    };

    const removeBeneficiary = async (beneficiary: Address) => {
        return writeContract({
            address: ascentAddress,
            abi: ASCENT_ABI,
            functionName: 'removeBeneficiary',
            args: [beneficiary]
        });
    };

    const registerToken = async (tokenAddress: Address) => {
        return writeContract({
            address: ascentAddress,
            abi: ASCENT_ABI,
            functionName: 'registerToken',
            args: [tokenAddress]
        });
    };

    const distributeAssets = async () => {
        return writeContract({
            address: ascentAddress,
            abi: ASCENT_ABI,
            functionName: 'distributeAssets'
        });
    };

    return {
        checkIn,
        addBeneficiary,
        removeBeneficiary,
        registerToken,
        distributeAssets,
        isPending,
        error
    };
};

// Read functions for Ascent Contract
export const useAscentRead = (ascentAddress: Address) => {
    const useOwner = () =>
        useReadContract({
            address: ascentAddress,
            abi: ASCENT_ABI,
            functionName: 'owner'
        });

    const useBeneficiaries = () =>
        useReadContract({
            address: ascentAddress,
            abi: ASCENT_ABI,
            functionName: 'getBeneficiaries'
        });

    const useBeneficiaryCount = () =>
        useReadContract({
            address: ascentAddress,
            abi: ASCENT_ABI,
            functionName: 'getBeneficiaryCount'
        });

    const useCheckInInterval = () =>
        useReadContract({
            address: ascentAddress,
            abi: ASCENT_ABI,
            functionName: 'checkInInterval'
        });

    const useLastCheckIn = () =>
        useReadContract({
            address: ascentAddress,
            abi: ASCENT_ABI,
            functionName: 'lastCheckIn'
        });

    const useHasHeartbeatExpired = () =>
        useReadContract({
            address: ascentAddress,
            abi: ASCENT_ABI,
            functionName: 'hasHeartbeatExpired'
        });

    const useNextCheckInDeadline = () =>
        useReadContract({
            address: ascentAddress,
            abi: ASCENT_ABI,
            functionName: 'getNextCheckInDeadline'
        });

    const useTimeRemaining = () =>
        useReadContract({
            address: ascentAddress,
            abi: ASCENT_ABI,
            functionName: 'getTimeRemaining'
        });

    const useAssetsDistributed = () =>
        useReadContract({
            address: ascentAddress,
            abi: ASCENT_ABI,
            functionName: 'assetsDistributed'
        });

    const useRegisteredTokens = () =>
        useReadContract({
            address: ascentAddress,
            abi: ASCENT_ABI,
            functionName: 'getRegisteredTokens'
        });

    return {
        useOwner,
        useBeneficiaries,
        useBeneficiaryCount,
        useCheckInInterval,
        useLastCheckIn,
        useHasHeartbeatExpired,
        useNextCheckInDeadline,
        useTimeRemaining,
        useAssetsDistributed,
        useRegisteredTokens
    };
};

// Transaction confirmation hook
export const useTransactionConfirmation = (hash?: `0x${string}`) => {
    return useWaitForTransactionReceipt({
        hash
    });
};

// Utility functions
export const formatCheckInInterval = (interval: CheckInInterval): string => {
    switch (interval) {
        case CheckInInterval.SEVEN_DAYS:
            return '7 Days';
        case CheckInInterval.FOURTEEN_DAYS:
            return '14 Days';
        case CheckInInterval.THIRTY_DAYS:
            return '30 Days';
        case CheckInInterval.ONE_EIGHTY_DAYS:
            return '180 Days';
        case CheckInInterval.THREE_SIXTY_FIVE_DAYS:
            return '365 Days';
        default:
            return 'Unknown';
    }
};

export const formatTimeRemaining = (seconds: bigint): string => {
    const totalSeconds = Number(seconds);

    if (totalSeconds <= 0) return 'Expired';

    const days = Math.floor(totalSeconds / (24 * 60 * 60));
    const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
};
