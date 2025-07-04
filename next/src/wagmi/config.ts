import { http, createConfig } from 'wagmi';
import { celoAlfajores } from 'wagmi/chains';
import { metaMask } from 'wagmi/connectors';

export const config = createConfig({
  chains: [celoAlfajores],
  connectors: [metaMask()],
  transports: {
    [celoAlfajores.id]: http(),
  },
});
