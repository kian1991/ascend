'use client';

import { AscendLoading } from '@/components/ui/ascend-loading';
import { SlidingNumber } from '@/components/ui/sliding-number';
import { useAscent, useAscentRead, useAscentRegistryRead } from '@/service/smart-contract';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { set } from 'date-fns';

export function Contracts() {
    const { user } = usePrivy();
    const { useAscentsByGrantor } = useAscentRegistryRead();
    const { push } = useRouter();
    const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [artiLoad, setArtiLoad] = useState(false);
    const { data: contracts, isLoading } = useAscentsByGrantor(user?.wallet?.address as `0x${string}`);
    const contractsArray = Array.isArray(contracts) ? contracts : [];
    const { useNextCheckInDeadline, useBeneficiaries } = useAscentRead(
        (contractsArray?.[0] as `0x${string}`) || ('' as `0x${string}`)
    );
    const { data: nextDeadline, isLoading: isNextDeadlineLoading } = useNextCheckInDeadline();
    const { checkIn, isPending } = useAscent((contractsArray?.[0] as `0x${string}`) || ('' as `0x${string}`));

    // Countdown logic
    useEffect(() => {
        if (!nextDeadline) return;

        const updateCountdown = () => {
            const now = Date.now();
            const deadline = Number(nextDeadline) * 1000;
            const diff = deadline - now;

            if (diff <= 0) {
                setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeRemaining({ days, hours, minutes, seconds });
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);

        return () => clearInterval(interval);
    }, [nextDeadline]);

    useEffect(() => {
        if (contractsArray.length === 0) return;
        console.log('Contracts:', contractsArray);
    }, [contractsArray]);
    if (isLoading || isNextDeadlineLoading || artiLoad) {
        return <AscendLoading />;
    }

    if (!user || !user.wallet?.address) {
        push('/login');
        return null;
    }

    async function handleCheckIn() {
        console.log(user.wallet.address, 'Checking in...');
        checkIn().then((data) => {
            console.log('Check-in successful:', data);
        });
    }

    return (
        <div className="flex flex-col gap-3 px-6 w-full min-h-screen justify-center">
            <motion.img src={'/img/a.png'} alt="Ascend Logo" className="w-64 mx-auto mb-4" />
            <h3 className="tracking-tight font-bold text-2xl text-center mb-2">Your Ascend</h3>
            <div className="mt-6">
                {contractsArray && contractsArray.length > 0 ? (
                    <div className="flex flex-col items-center gap-4">
                        <h4 className="text-lg font-thin">Next Check-in Deadline</h4>
                        <div className="flex items-center gap-2 text-4xl font-bold">
                            <div className="flex flex-col items-center">
                                <SlidingNumber value={timeRemaining.days} padStart={true} />
                                <span className="text-xs text-muted-foreground">DAYS</span>
                            </div>
                            <span>:</span>
                            <div className="flex flex-col items-center">
                                <SlidingNumber value={timeRemaining.hours} padStart={true} />
                                <span className="text-xs text-muted-foreground">HOURS</span>
                            </div>
                            <span>:</span>
                            <div className="flex flex-col items-center">
                                <SlidingNumber value={timeRemaining.minutes} padStart={true} />
                                <span className="text-xs text-muted-foreground">MIN</span>
                            </div>
                            <span>:</span>
                            <div className="flex flex-col items-center">
                                <SlidingNumber value={timeRemaining.seconds} padStart={true} />
                                <span className="text-xs text-muted-foreground">SEC</span>
                            </div>
                        </div>

                        <button
                            className="btn btn-xl uppercase font-bold btn-outline mt-6"
                            onClick={() => handleCheckIn()}
                            disabled={isPending}
                        >
                            {isPending ? 'Checking in...' : 'Check In'}
                        </button>
                    </div>
                ) : (
                    <div className="text-center">
                        <p className="text-muted-foreground mb-4">No contracts found</p>
                        <button className="btn btn-primary" onClick={() => push('/onboarding')}>
                            Create Your First Contract
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
