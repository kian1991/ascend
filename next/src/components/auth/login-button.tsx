'use client';
import { useAscentRegistryRead } from '@/service/smart-contract';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'motion/react';

export const LoginButton = () => {
    const { login, authenticated } = usePrivy();
    const { push } = useRouter();

    useEffect(() => {
        if (authenticated) push('/role');
    }, [authenticated]);

    return (
        <div className="flex justify-center w-full flex-col mx-auto max-w-sm items-center px-4 py-12 border gap-4 rounded-2xl shadow-md">
            <div className="text-center mb-6">
                <img src="/img/ascend.png" alt="Ascend Logo" className="w-64 mb-4" />
                <span className="text-muted-foreground font-bold text-center mb-4">Better Safe Than Sorry.</span>
            </div>
            <p className="text-center mb-6">
                Join us in revolutionizing the way we manage contracts and relationships.
            </p>
            <button className="btn btn-xl btn-outline  uppercase" onClick={() => login()}>
                BE PART OF IT
            </button>
        </div>
    );
};
