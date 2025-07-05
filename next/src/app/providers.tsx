'use client';
import { PrivyProvider } from '@privy-io/react-auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

export function Providers(props: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <PrivyProvider
      clientId={process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID || ''}
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
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
  );
}
