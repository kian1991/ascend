'use client';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export const LoginButton = () => {
  const { login, authenticated } = usePrivy();
  const { push } = useRouter();

  useEffect(() => {
    if (authenticated) push('/role');
  }, [authenticated]);

  return (
    <>
      <button
        className='btn btn-xl btn-primary uppercase'
        onClick={() => login()}>
        BE PART OF IT
      </button>
    </>
  );
};
