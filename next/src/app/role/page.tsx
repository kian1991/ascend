'use client';

import { useAscentRegistryRead } from '@/service/smart-contract';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';

export default function Role() {
    const { user } = usePrivy();
    const { useAscentsByGrantor } = useAscentRegistryRead();
    const { push } = useRouter();

    const { data: ascends, isLoading } = useAscentsByGrantor(user?.wallet?.address! as `0x${string}`);

    function handleGrantorClick() {
        // Logic for Grantor role selection
        if (!ascends) push('/onboarding');
        else push('/contracts');
    }

    function handleBeneficiaryClick() {
        // Logic for Beneficiary role selection
        push('/claim');
    }

    return (
        <div className="grid place-items-center min-h-screen">
            <div className="flex flex-col gap-3">
                <h3 className="tracking-tight font-thin text-3xl text-center mb-2">WHO ARE YOU?</h3>
                <button className="btn btn-xl btn-outline uppercase" onClick={handleGrantorClick}>
                    GRANTOR
                </button>
                <button className="btn btn-xl btn-outline uppercase" onClick={handleBeneficiaryClick}>
                    BENEFICIARY
                </button>
            </div>
        </div>
    );
}
