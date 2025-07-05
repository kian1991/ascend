import { useWalletClient, useConnect } from 'wagmi';
import {useEffect} from

export default function App() {
  const { data: walletClient } = useWalletClient();
  const { connect, connectors, status } = useConnect();

  const metamask = connectors.find((c) => c.id === 'metaMask');

  useEffect(() => {
    console.log('MetaMask connector:', metamask);
  }, [metamask]);

  return (
    <div>
      {walletClient ? (
        <p>Connected</p>
      ) : (
        <button
          disabled={!metamask || status === 'pending'}
          onClick={() => connect({ connector: metamask! })}>
          Connect MetaMask
        </button>
      )}
      <p>Status: {status}</p>
    </div>
  );
}
