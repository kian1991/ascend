'use client';
import { config } from '@/wagmi/config';
import { NexusProvider } from '@avail-project/nexus';
import { PrivyProvider } from '@privy-io/react-auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { WagmiProvider } from 'wagmi';

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
                        createOnLogin: 'users-without-wallets'
                    }
                }
            }}
        >
            <WagmiProvider config={config}>
                <NexusProvider config={{ network: 'testnet' }}>
                    <QueryClientProvider client={queryClient}>{props.children}</QueryClientProvider>
                </NexusProvider>
            </WagmiProvider>
        </PrivyProvider>
    );
}
