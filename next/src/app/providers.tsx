'use client';
import { ENV } from '@/env';
import { PrivyProvider } from '@privy-io/react-auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
// import { WagmiProvider } from 'wagmi';
// import { config } from '@/wagmi/config';

export function Providers(props: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    // <WagmiProvider config={config}>
    <PrivyProvider
      clientId={ENV.PRIVY_CLIENT_ID}
      appId={ENV.PRIVY_APP_ID}
      config={{
        // Create embedded wallets for users who don't have a wallet
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets',
          },
        },
      }}>
      <QueryClientProvider client={queryClient}>
        {props.children}
      </QueryClientProvider>
    </PrivyProvider>
    // </WagmiProvider>
  );
}
