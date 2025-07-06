import {
  NexusSDK,
  type UserAsset,
  BridgeAndExecuteResult,
} from '@avail-project/nexus';

let nexusClient: null | any = null;

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
