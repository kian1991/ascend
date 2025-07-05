'use client';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export const SplashScreen = () => {
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.push('/login');
    }, 3700);

    return () => {
      clearTimeout(timeout);
    };
  }, [router]);

  return (
    <div className='flex flex-col items-center relative justify-center min-h-screen bg-base-100'>
      <motion.div
        initial={{ bottom: '-100%' }}
        animate={{ bottom: '0%' }}
        transition={{ duration: 1, ease: 'easeInOut' }}
        className='absolute inset-0 bg-gradient-to-b from-primary to-secondary'
      />

      <motion.img
        src='/img/ascend.png'
        alt='Ascend Logo'
        className='w-64 absolute'
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: [0, 1, 0], y: [100, 0, -100] }}
        transition={{ duration: 6, ease: 'easeInOut' }}
      />

      <h1 className='text-3xl font-bold text-center absolute bottom-10 text-base-content'>
        Welcome.
      </h1>
    </div>
  );
};
