# Ascend Contracts

### Running Tests


```shell
npx hardhat test
```

You can also selectively run the Solidity or `node:test` tests:

```shell
npx hardhat test solidity
npx hardhat test nodejs
```

### Set private key for deployment on Celo testnet (alfajores) 

```shell
npx hardhat keystore set ALFAJORES_PRIVATE_KEY 
```

### Make a deployment to Celo testnet (alfajores) 

```shell
npx hardhat ignition deploy --network alfajores ignition/modules/AscentModule.ts
```
