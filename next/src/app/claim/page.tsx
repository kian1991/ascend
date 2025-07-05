'use client';

import { AscendLoading } from '@/components/ui/ascend-loading';
import { useAscentRegistry, useAscentRegistryRead } from '@/service/smart-contract';
import { usePrivy } from '@privy-io/react-auth';
import { ListAssets } from './_components/list-assets';

export default function ClaimPage() {
    const { user } = usePrivy();
    const { useGrantorsByBeneficiary, useAscentsByGrantor } = useAscentRegistryRead();
    const { data: grantors, isLoading } = useGrantorsByBeneficiary(user?.wallet?.address as `0x${string}`);
    const { data: ascents, isLoading: isAscentsLoading } = useAscentsByGrantor(grantors?.[0] as `0x${string}`);

    if (isLoading || isAscentsLoading) {
        return <AscendLoading />;
    }

    if (!grantors) {
        return (
            <main>
                <h1>No Grantors Found</h1>
                <p>You do not have any grantors associated with your account.</p>
            </main>
        );
    }

    console.log('Grantors:', grantors);
    console.log('Ascents:', ascents);

    return (
        <main className="flex flex-col items-center justify-center min-h-screen py-12 px-6">
            <button className="btn btn-outline btn-lg">CLAIM</button>
            {/* <ListAssets /> */}
        </main>
    );
}
