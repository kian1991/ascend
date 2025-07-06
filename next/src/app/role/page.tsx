'use client';

import { useAscentRegistryRead } from '@/service/smart-contract';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import Choice from '@/assets/choice.svg';
import Image from 'next/image';

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
        <div className="flex flex-col justify-center items-center min-h-screen">
            <Image width={500} height={500} src={Choice} alt="Choice Illustration" className="inline h-48 mb-4" />

            <div className="flex flex-col gap-3">
                <h3 className="tracking-tight font-semibold text-3xl text-center mb-2">Who are you?</h3>
                <button className="btn btn-xl btn-soft uppercase" onClick={handleGrantorClick}>
                    GRANTOR
                </button>
                <button className="btn btn-xl btn-soft uppercase" onClick={handleBeneficiaryClick}>
                    BENEFICIARY
                </button>
            </div>
        </div>
    );
}
