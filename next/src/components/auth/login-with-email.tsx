'use client';
import { useState } from 'react';
import { useLoginWithEmail } from '@privy-io/react-auth';

export default function LoginWithEmail() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const { sendCode, loginWithCode, state } = useLoginWithEmail();

  return (
    <div className='min-h-full grid place-items-center'>
      <div className='flex flex-col gap-2 h-full'>
        {state.status === 'initial' && (
          <>
            <input
              type='email'
              className='input input-primary'
              onChange={(e) => setEmail(e.currentTarget.value)}
              value={email}
            />
            <button
              className='btn btn-primary'
              onClick={() => sendCode({ email })}>
              Send Code
            </button>
          </>
        )}
        {state.status === 'awaiting-code-input' && (
          <>
            <input
              onChange={(e) => setCode(e.currentTarget.value)}
              value={code}
            />
            <button onClick={() => loginWithCode({ code })}>Login</button>
          </>
        )}
      </div>
    </div>
  );
}
