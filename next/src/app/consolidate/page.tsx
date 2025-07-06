'use client';
import { ListAssets } from '../claim/_components/list-assets';
import { Consolidate } from '../onboarding/components/consolidate';
import Secure from '@/assets/secure.svg';
import Vault from '@/assets/vault.svg';
import Image from 'next/image';

export default function ConsolidatePage() {
    return (
        <div className="h-screen w-full overflow-y-auto snap-y snap-mandatory scroll-smooth max-w-2xl mx-auto">
            <div className="h-screen flex flex-col items-center justify-center snap-start">
                <Image width={500} height={500} src={Vault} alt="Vault Illustration" className="inline h-32 mb-4" />

                <p className="text-3xl font-thin text-center max-w-48 mx-auto">
                    Lets check where your <strong className="font-bold">assets</strong> are floating around.
                </p>
            </div>
            <div className="h-screen flex flex-col items-center px-6 pt-12 snap-start">
                <ListAssets />
            </div>
            <div className="h-screen flex flex-col items-center justify-center snap-start">
                <p className="text-3xl font-thin text-center max-w-52 mx-auto">
                    <Image
                        width={500}
                        height={500}
                        src={Secure}
                        alt="Secure Illustration"
                        className="inline h-48 mb-4"
                    />
                    Let's make it easy and <span className="font-bold">secure them in one place</span>.
                </p>
            </div>
            <div className="h-screen flex flex-col items-center justify-center snap-start">
                <Consolidate />
            </div>
        </div>
    );
}
