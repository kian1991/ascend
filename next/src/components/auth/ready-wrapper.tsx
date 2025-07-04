import { usePrivy } from '@privy-io/react-auth';
import LoginWithEmail from './login-with-email';
import { log } from 'console';

export function AuthWrapper() {
  const { ready, connectWallet, login, logout, user } = usePrivy();

  if (!ready) {
    return <div>Loading...</div>;
  }

  // Now it's safe to use other Privy hooks and state
  return (
    <>
      <pre>{JSON.stringify(user, null, 2)}</pre>
      <LoginWithEmail />
      <button onClick={() => connectWallet()} className='btn btn-secondary'>
        Connect Wallet
      </button>
      <button onClick={() => login()} className='btn btn-secondary'>
        Login
      </button>
      <button onClick={() => logout()} className='btn btn-secondary'>
        Logout
      </button>
    </>
  );
}
