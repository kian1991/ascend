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

### Set private key for deployment on Base Sepolia testnet

```shell
npx hardhat keystore set SEPOLIA_PRIVATE_KEY 
```

### Make a deployment to Celo testnet (alfajores) 

```shell
npx hardhat ignition deploy --network alfajores ignition/modules/AscentModule.ts
```

### Make a deployment to Base Sepolia

```shell
npx hardhat ignition deploy --network sepolia ignition/modules/AscentModule.ts
```
### Verify contracts on etherscan

```shell
npx hardhat keystore set SEPOLIA_PRIVATE_KEY 
```
PCKWEP58XW8UI8C74RDF7I9ZXER27UUTXU
