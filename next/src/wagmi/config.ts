import { http, createConfig } from 'wagmi';
import { baseSepolia, celoAlfajores } from 'wagmi/chains';
import { metaMask } from 'wagmi/connectors';

export const config = createConfig({
    chains: [baseSepolia, celoAlfajores],
    connectors: [metaMask()],
    transports: {
        [baseSepolia.id]: http(),
        [celoAlfajores.id]: http()
    }
});
