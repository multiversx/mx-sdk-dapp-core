# Change Log

All notable changes will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

- [Fixed ledger double screen](https://github.com/multiversx/mx-sdk-dapp-core/pull/158)
- [Updated providers order](https://github.com/multiversx/mx-sdk-dapp-core/pull/157)
- [Added support for dapps inside iframe/webview](https://github.com/multiversx/mx-sdk-dapp-core/pull/156)

## [[0.0.0-alpha.20](https://github.com/multiversx/mx-sdk-dapp-core/pull/155)] - 2025-05-05

- [Added custom provider side panel integration](https://github.com/multiversx/mx-sdk-dapp-core/pull/154)
- [Added providers customization support](https://github.com/multiversx/mx-sdk-dapp-core/pull/153)
- [Fixed multisig login](https://github.com/multiversx/mx-sdk-dapp-core/pull/150)
- [Fixed Ledger address table pagination transition state](https://github.com/multiversx/mx-sdk-dapp-core/pull/149)
- [Removed unnecessary next and previous Ledger address table pagination handlers](https://github.com/multiversx/mx-sdk-dapp-core/pull/148)
- [Added cancel login](https://github.com/multiversx/mx-sdk-dapp-core/pull/147)
- [Added `usdValue` to ledger accounts](https://github.com/multiversx/mx-sdk-dapp-core-ui/pull/146)
- [Fixed logging in without native auth](https://github.com/multiversx/mx-sdk-dapp-core/pull/143)
- [Fixed ledger idle state manager check connection while signing](https://github.com/multiversx/mx-sdk-dapp-core/pull/141)
- [Fixed canceling transactions creates different toasts](https://github.com/multiversx/mx-sdk-dapp-core/pull/140)
- [Fix isssues with websocket and polling on init](https://github.com/multiversx/mx-sdk-dapp-core/pull/139)
- [Prevent multiple initApp executions](https://github.com/multiversx/mx-sdk-dapp-core/pull/138)

## [[0.0.0-alpha.19](https://github.com/multiversx/mx-sdk-dapp-core/pull/137)] - 2025-04-10

- [Switched publish workflow to esbuild](https://github.com/multiversx/mx-sdk-dapp-core/pull/137)
- [Add parallel manager initialization](https://github.com/multiversx/mx-sdk-dapp-core/pull/136)

## [[0.0.0-alpha.18](https://github.com/multiversx/mx-sdk-dapp-core/pull/135)] - 2025-04-09

- [Fix DappProvider init in NextJS](https://github.com/multiversx/mx-sdk-dapp-core/pull/134)
- [Updated prefix to ui tags and component imports](https://github.com/multiversx/mx-sdk-dapp-core/pull/133)

## [[0.0.0-alpha.17](https://github.com/multiversx/mx-sdk-dapp-core/pull/124)] - 2025-03-31

- [Fixed toasts completion and notifications feed toasts management](https://github.com/multiversx/mx-sdk-dapp-core/pull/131)
- [Upgrade sdk core v14](https://github.com/multiversx/mx-sdk-dapp-core/pull/130)
- [Toasts data refactoring](https://github.com/multiversx/mx-sdk-dapp-core/pull/129)
- [Added ledger idle connection manager](https://github.com/multiversx/mx-sdk-dapp-core/pull/127)
- [Fixed ledger logout on page reload](https://github.com/multiversx/mx-sdk-dapp-core/pull/126)
- [Fixed handling of array data in side panel manager](https://github.com/multiversx/mx-sdk-dapp-core/pull/125)
- [Migrate modals to side panel](https://github.com/multiversx/mx-sdk-dapp-core/pull/122)

## [[0.0.0-alpha.16](https://github.com/multiversx/mx-sdk-dapp-core/pull/124)] - 2025-03-18

- [Fixed sdk-core version](https://github.com/multiversx/mx-sdk-dapp-core/pull/123)
- [Added gasStationMetadata](https://github.com/multiversx/mx-sdk-dapp-core/pull/121)
- [Updated address validation](https://github.com/multiversx/mx-sdk-dapp-core/pull/120)
- [Added gasPrice editing](https://github.com/multiversx/mx-sdk-dapp-core/pull/116)

## [[0.0.0-alpha.15](https://github.com/multiversx/mx-sdk-dapp-core/pull/118)] - 2025-03-12

- [Added ledger error handling](https://github.com/multiversx/mx-sdk-dapp-core/pull/117)
- [Added notifications feed historical transactions mapping](https://github.com/multiversx/mx-sdk-dapp-core/pull/114)
- [Added sign message helper](https://github.com/multiversx/mx-sdk-dapp-core/pull/113)
- [Added notifications feed manager](https://github.com/multiversx/mx-sdk-dapp-core/pull/112)
- [Fixed minor TODOs](https://github.com/multiversx/mx-sdk-dapp-core/pull/110)
- [Fixed getWindowParentOrigin.test](https://github.com/multiversx/mx-sdk-dapp-core/pull/111)
- [Fixed minor TODOs](https://github.com/multiversx/mx-sdk-dapp-core/pull/110)
- [Updated managers to use internal folder](https://github.com/multiversx/mx-sdk-dapp-core/pull/108)
- [Added network round duration initialization](https://github.com/multiversx/mx-sdk-dapp-core/pull/107)
- [Fixed cancel Ledger message signing](https://github.com/multiversx/mx-sdk-dapp-core/pull/106)
- [Fixed websocket connection error handling](https://github.com/multiversx/mx-sdk-dapp-core/pull/105)
- [Added clear initiated logins on provider creation](https://github.com/multiversx/mx-sdk-dapp-core/pull/104)
- [Fixed cancel action in cross window does not close child window](https://github.com/multiversx/mx-sdk-dapp-core/pull/103)
- [Added wallet-connect when anchor is provided](https://github.com/multiversx/mx-sdk-dapp-core/pull/102)
- [Update default iframe network addresses](https://github.com/multiversx/mx-sdk-dapp-core/pull/101)
- [Added wallet connect anchor support](https://github.com/multiversx/mx-sdk-dapp-core/pull/100)
- [Added webview provider](https://github.com/multiversx/mx-sdk-dapp-core/pull/99)
- [Clean-up tracking types](https://github.com/multiversx/mx-sdk-dapp-core/pull/98)
- [Clean-up network configuration](https://github.com/multiversx/mx-sdk-dapp-core/pull/97)
- [FormatAmountController validation improvements](https://github.com/multiversx/mx-sdk-dapp-core/pull/96)
- [Added setAxiosInterceptors utility function](https://github.com/multiversx/mx-sdk-dapp-core/pull/94)

## [[0.0.0-alpha.14](https://github.com/multiversx/mx-sdk-dapp-core/pull/93)] - 2025-02-18

- [Updated packages](https://github.com/multiversx/mx-sdk-dapp-core/pull/93)

## [[0.0.0-alpha.13](https://github.com/multiversx/mx-sdk-dapp-core/pull/92)] - 2025-02-18

- [Fixed lint errors](https://github.com/multiversx/mx-sdk-dapp-core/pull/89)
- [Added nonce management](https://github.com/multiversx/mx-sdk-dapp-core/pull/88)
- [Added `FormatAmountController` and `TransactionsTableController` tests](https://github.com/multiversx/mx-sdk-dapp-core/pull/83)
- [Cleanup transactions and tracked transactions logic](https://github.com/multiversx/mx-sdk-dapp-core/pull/82)
- [Enhance toast progress](https://github.com/multiversx/mx-sdk-dapp-core/pull/81)
- [Fixed react type mismatch](https://github.com/multiversx/mx-sdk-dapp-core/pull/80)
- [Removed React hooks from `TransactionsTableController` `processTransaction` method](https://github.com/multiversx/mx-sdk-dapp-core/pull/79)
- [Added transaction value in controller processing](https://github.com/multiversx/mx-sdk-dapp-core/pull/78)
- [Enhance handle sign error](https://github.com/multiversx/mx-sdk-dapp-core/pull/77)
- [Added transaction accounts in controller processing](https://github.com/multiversx/mx-sdk-dapp-core/pull/76)
- [Fixed track transactions web socket re-trigger](https://github.com/multiversx/mx-sdk-dapp-core/pull/75)
- [Added devtools action names](https://github.com/multiversx/mx-sdk-dapp-core/pull/74)
- [Added transaction display info support](https://github.com/multiversx/mx-sdk-dapp-core/pull/73)
- [Remove storage helpers](https://github.com/multiversx/mx-sdk-dapp-core/pull/72)

## [[0.0.0-alpha.12](https://github.com/multiversx/mx-sdk-dapp-core/pull/56)] - 2025-01-20

- [Added transaction and message cancel signing handle](https://github.com/multiversx/mx-sdk-dapp-core/pull/71)
- [Clear tracked transaction and toasts on logout](https://github.com/multiversx/mx-sdk-dapp-core/pull/70)
- [Added transactions table controller](https://github.com/multiversx/mx-sdk-dapp-core/pull/69)
- [Added custom guard transactions support](https://github.com/multiversx/mx-sdk-dapp-core/pull/68)
- [Added custom toast support](https://github.com/multiversx/mx-sdk-dapp-core/pull/67)
- [Fixed guarded transactions](https://github.com/multiversx/mx-sdk-dapp-core/pull/66)
- [Added format amount controller](https://github.com/multiversx/mx-sdk-dapp-core/pull/65)
- [Added logout check on forced address change](https://github.com/multiversx/mx-sdk-dapp-core/pull/64)
- [Refactor LedgerProviderStrategy](https://github.com/multiversx/mx-sdk-dapp-core/pull/63)
- [Added react hooks](https://github.com/multiversx/mx-sdk-dapp-core/pull/62)
- [Added toast progress](https://github.com/multiversx/mx-sdk-dapp-core/pull/61)

## [[0.0.0-alpha.11](https://github.com/multiversx/mx-sdk-dapp-core/pull/62)] - 2025-01-20

- [Added react hooks](https://github.com/multiversx/mx-sdk-dapp-core/pull/62)
- [Fixed issue with state manager](https://github.com/multiversx/mx-sdk-dapp-core/pull/58)
- [Added multi-step navigation in sign modal](https://github.com/multiversx/mx-sdk-dapp-core/pull/60)
- [Fix issue with state manager](https://github.com/multiversx/mx-sdk-dapp-core/pull/58)

## [[0.0.0-alpha.10](https://github.com/multiversx/mx-sdk-dapp-core/pull/56)] - 2024-12-23

- [Added transactions interpretation helpers](https://github.com/multiversx/mx-sdk-dapp-core/pull/55)
- [Added transaction toasts](https://github.com/multiversx/mx-sdk-dapp-core/pull/53)
- [Added transactions helpers](https://github.com/multiversx/mx-sdk-dapp-core/pull/52)
- [Added transactions tracking](https://github.com/multiversx/mx-sdk-dapp-core/pull/51)
- [Added provider constants and getTransactions API call](https://github.com/multiversx/mx-sdk-dapp-core/pull/50)
- [Added pending transactions](https://github.com/multiversx/mx-sdk-dapp-core/pull/48)
- [Added transaction manager](https://github.com/multiversx/mx-sdk-dapp-core/pull/41)
- [Added custom web socket url support](https://github.com/multiversx/mx-sdk-dapp-core/pull/35)
- [Metamask integration](https://github.com/multiversx/mx-sdk-dapp-core/pull/27)
- [Extension integration](https://github.com/multiversx/mx-sdk-dapp-core/pull/26)
- [Ledger integration](https://github.com/multiversx/mx-sdk-dapp-core/pull/22)
- [Added sign, send, & track transactions with websocket connection](https://github.com/multiversx/mx-sdk-dapp-core/pull/21)
- [Added restore provider after page reload](https://github.com/multiversx/mx-sdk-dapp-core/pull/19)
- [Added signMessage](https://github.com/multiversx/mx-sdk-dapp-core/pull/18)

## [[0.0.0-alpha.9]](https://github.com/multiversx/mx-sdk-dapp-core)] - 2024-08-29

- [CrossWindow login](https://github.com/multiversx/mx-sdk-dapp-core/pull/13)

## [[v0.0.0-alpha.8]](https://github.com/multiversx/mx-sdk-dapp-core/pull/16) - 2024-08-27

- [Added sdk-web-wallet-cross-window-provider as peer dependency](https://github.com/multiversx/mx-sdk-dapp-core/pull/14)
- [Generic login + ExtensionProvider login](https://github.com/multiversx/mx-sdk-dapp-core/pull/12)
- [Make middlewares registration more scalable](https://github.com/multiversx/mx-sdk-dapp-core/pull/11)
- [Fix Node Polyfills](https://github.com/multiversx/mx-sdk-dapp-core/pull/10)
- [Removed chain id from network slice & added esbuild and absolute imports](https://github.com/multiversx/mx-sdk-dapp-core/pull/3)
- [Reverted absolute imports](https://github.com/multiversx/mx-sdk-dapp-core/pull/2)
- [Added network store](https://github.com/multiversx/mx-sdk-dapp-core/pull/1)

## [[v0.0.0]](https://github.com/multiversx/mx-sdk-dapp-core)] - 2024-04-17
