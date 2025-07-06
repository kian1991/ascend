import { NexusSDK } from '@avail-project/nexus';

let nexusClient: NexusSDK | null = null;

export const getInstance = async () => {
  if (!nexusClient) {
    nexusClient = new NexusSDK({
      network: 'testnet',
    });
    await nexusClient.initialize(window.ethereum);
  }

  return nexusClient;
};

export const NexusClient = await getInstance();
