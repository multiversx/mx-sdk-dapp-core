# MultiversX SDK for Front-End DApps

MultiversX Front-End SDK for JavaScript and TypeScript (written in TypeScript).

## Introduction

`sdk-dapp-core` is a library that holds core functional logic that can be used to create a dApp on MultiversX Network.

It is built for applications that use any of the following technologies:
- React
- Angular
- Vue
- Any other JavaScript framework (e.g. Solid.js etc.)
- React Native
- Next.js

## GitHub project
The GitHub repository can be found here: [https://github.com/multiversx/mx-sdk-dapp-core](https://github.com/multiversx/mx-sdk-dapp-core)

## Live demo: template-dapp
See [Dapp template](https://template-dapp.multiversx.com/) for live demo or checkout usage in the [Github repo](https://github.com/multiversx/mx-template-dapp)


## Requirements
- Node.js version 20.13.1+
- Npm version 10.5.2+

## Distribution

[npm](https://www.npmjs.com/package/@multiversx/sdk-dapp)

## Installation

The library can be installed via npm or yarn.

```bash
npm install @multiversx/sdk-dapp-core
```

or

```bash
yarn add @multiversx/sdk-dapp-core
```

If you need only the core logic, without the additional UI, you can create a project-specific `.npmrc` file to configure per-package installation behavior. This will skip the installation of `@multiversx/sdk-dapp-core-ui`, but keep in mind that you may need to provide the UI components yourself.

```bash
## .npmrc
@multiversx/sdk-dapp-core:omit-optional=true
## enable the option when needed with: 
## @multiversx/sdk-dapp-core:omit-optional=false

##Run Installation When you run npm install, NPM will use the configurations specified in the .npmrc file:
npm install
```

If you're transitioning from @multiversx/sdk-dapp, you can check out the [Migration guide PR](https://github.com/multiversx/mx-template-dapp/pull/264) of Template Dapp

## Usage

sdk-dapp-core aims to abstract and simplify the process of interacting with users' wallets and with the MultiversX blockchain, allowing developers to easily get started with new applications.

```mermaid
flowchart LR
    A["Signing Providers & APIs"] <--> B["sdk-dapp-core"] <--> C["dApp"]
```

The basic concepts you need to understand are configuration, provider interaction, transactions, and presenting data. These are the building blocks of any dApp, and they are abstracted in the `sdk-dapp-core` library.

Having this knowledge, we can consider several steps needed to put a dApp together:

**Table 1**. Steps to build a dApp
| # | Step | Description |
|---|------|-------------|
| 1 | Configuration | -  storage configuration (e.g. sessionStorage, localStorage etc.)<br>-  chain configuration<br>-  custom provider configuration (adding / disabling / changing providers) |
| 2 | Provider interaction | -  logging in and out<br>-  signing transactions / messages |
| 3 | Presenting data | -  get store data (e.g. account balance, account address etc.)<br>-  use components to display data (e.g. balance, address, transactions list) |
| 4 | Transactions | -  sending transactions<br>-  tracking transactions |


Each of these steps will be explained in more detail in the following sections.

### 1. Configuration

Before your application bootstraps, you need to configure the storage, the network, and the signing providers. This is done by calling the `initApp` method from the `core/methods` folder.

```typescript
// index.tsx
import { initApp } from '@multiversx/sdk-dapp-core/out/core/methods/initApp/initApp';
import type { InitAppType } from '@multiversx/sdk-dapp-core/out/core/methods/initApp/initApp.types';
import { EnvironmentsEnum } from '@multiversx/sdk-dapp-core/out/types/enums.types';
import { App } from "./App";

const config: InitAppType = {
  storage: { getStorageCallback: () => sessionStorage },
  dAppConfig: {
    // nativeAuth: true, // optional
    environment: EnvironmentsEnum.devnet,
    // network: { // optional
    //   walletAddress: 'https://devnet-wallet.multiversx.com'
    // },
    successfulToastLifetime: 5000
  }
  // customProviders: [myCustomProvider] // optional
};

initApp(config).then(() => {
  render(() => <App />, root!); // render your app
});
```

### 2. Provider interaction

Once your dApp has loaded, the first user action is logging in with a chosen provider.

```typescript
import { ProviderTypeEnum } from '@multiversx/sdk-dapp-core/out/core/providers/types/providerFactory.types';
import { ProviderFactory } from '@multiversx/sdk-dapp-core/out/core/providers/ProviderFactory';

const provider = await ProviderFactory.create({ type: ProviderTypeEnum.extension });
await provider.login();
```

### 3. Displaying user data

Depending on the framework, you can either use hooks or selectors to get the user details:

#### React hooks solution:
```typescript
import { useGetAccount } from '@multiversx/sdk-dapp-core/out/store/selectors/hooks/account/useGetAccount';
import { useGetNetworkConfig } from '@multiversx/sdk-dapp-core/out/store/selectors/hooks/network/useGetNetworkConfig';

const account = useGetAccount();
const {
  network: { egldLabel }
} = useGetNetworkConfig();

console.log(account.address);
console.log(`${account.balance} ${egldLabel}`);
```

#### Store selector functions:
```typescript
import { getAccount } from '@multiversx/sdk-dapp-core/out/core/methods/account/getAccount';
import { getNetworkConfig } from '@multiversx/sdk-dapp-core/out/core/methods/network/getNetworkConfig';

const account = getAccount();
const { egldLabel } = getNetworkConfig();
```

### 4. Transactions

#### Signing transactions

To sign transactions, you first need to create the `Transaction` object then pass it to the initialized provider.

```typescript
import { Transaction, TransactionPayload } from '@multiversx/sdk-core/out';
import { GAS_PRICE, GAS_LIMIT } from '@multiversx/sdk-dapp-core/out/constants/mvx.constants';
import { getAccountProvider } from '@multiversx/sdk-dapp-core/out/core/providers/helpers/accountProvider';
import { refreshAccount } from '@multiversx/sdk-dapp-core/out/utils/account/refreshAccount';

const pongTransaction = new Transaction({
  value: '0',
  data: new TransactionPayload('pong'),
  receiver: contractAddress,
  gasLimit: GAS_LIMIT,
  gasPrice: GAS_PRICE,
  chainID: network.chainId,
  nonce: account.nonce,
  sender: account.address,
  version: 1
});

await refreshAccount(); // optionally, to get the latest nonce
const provider = getAccountProvider();
const signedTransactions = await provider.signTransactions(transactions);
```

#### Sending and tracking transactions

Then, to send the transactions, you need to use the TransactionManager class and pass in the signedTransactions to the send method. You can optionally track the transactions by using the track method. This will create a toast notification with the transaction hash and its status.

```typescript
import { TransactionManager } from '@multiversx/sdk-dapp-core/out/core/managers/TransactionManager';

const txManager = TransactionManager.getInstance();
await txManager.send(signedTransactions);
await txManager.track(signedTransactions);
```

Once the transactions are executed on the blockchain, the flow ends with the user logging out.

```typescript
import { getAccountProvider } from '@multiversx/sdk-dapp-core/out/core/providers/helpers/accountProvider';
const provider = getAccountProvider();
await provider.logout();
```

## Internal structure

We have seen in the previous chapter what are the minimal steps to get up and running with a blockchain interaction using sdk-dapp-core. Next we will detail each element mentioned above

**Table 2**. Elements needed to build a dApp
| # | Type | Description |
|---|------|-------------|
| 1 | Network | Chain configuration |
| 2 | Provider | The signing provider for logging in and singing transactions |
| 3 | Account | Inspecting user address and balance |
| 4 | Transactions Manager | Sending and tracking transactions |
| 5 | Components | Displaying UI information like balance, public keys etc. |

Since these are mixtures of business logic and UI components, the library is split into several folders to make it easier to navigate.
When inspecting the package, there is more content under `src`, but the main folders of interest are:

```bash
src/
├── apiCalls/ ### methods for interacting with the API
├── constants/ ### useful constants from the ecosystem like ledger error codes, default gas limits for transactions etc.
├── controllers/ ### business logic for UI elements like transactions and amount formatting
├── core/ ### hosting the provider class, and all implementations for different signing providers
└── store/ ### store initialization, middleware, slices, selectors and actions
```

Conceptually, these can be split into 3 main parts: 
- First is the business logic in `apiCalls`, `constants` and `core` (signing providers). 
- Then comes the persistence layer hosted in the `store` folder, using [Zustand](https://zustand.docs.pmnd.rs/) under the hood.
- Last are the UI components hosted in [@multiversx/sdk-dapp-core](https://github.com/multiversx/mx-sdk-dapp-core-ui) with some components controlled on demand by classes defined in `controlles`

## Debugging your dApp

Use lerna or npm link

In your project, make sure to use the `preserveSymlinks` option in the server configuration to ensure that the symlinks are preserved, for ease of development.

``` js
  resolve: {
    preserveSymlinks: true, // 👈
    alias: {
      src: "/src",
    },
  },
```

// TODO: DEMONSTRATE init app


```mermaid
flowchart TB;
    id1{index.tsx} 
    
    -- sdk-dpp-core config --> 
    
    F(
        persistance
        network
        custom providers
    )
        
    -- await config --> 
    
    id2{/unlock}  
    
    -- user presses login --> 
    
    Provider.login

    -- redirect --> 
    
    /dashboard
```
