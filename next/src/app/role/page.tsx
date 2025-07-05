'use client';

import { useAscentRegistryRead } from '@/service/smart-contract';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';

export default function Role() {
    const { user } = usePrivy();
    const { useBeneficiariesByGrantor } = useAscentRegistryRead();
    const { push } = useRouter();

    const { data, isLoading } = useBeneficiariesByGrantor(user?.wallet?.address![0] as `0x${string}`);

    function handleGrantorClick() {
        // Logic for Grantor role selection
        console.log('Grantor selected', data);
        push('/onboarding');
    }

    function handleBeneficiaryClick() {
        // Logic for Beneficiary role selection
        console.log('Beneficiary selected', data);
    }

    return (
        <div className="">
            <div className="flex flex-col gap-3">
                <h3 className="tracking-tight font-bold text-2xl text-center mb-2">WHO ARE YOU?</h3>
                <button className="btn btn-xl btn-dash uppercase" onClick={handleGrantorClick}>
                    GRANTOR
                </button>
                <button className="btn btn-xl btn-dash uppercase" onClick={handleBeneficiaryClick}>
                    BENEFICIARY
                </button>
            </div>
        </div>
    );
}
