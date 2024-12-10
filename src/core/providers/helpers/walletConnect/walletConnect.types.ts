export enum WalletConnectV2Error {
  invalidAddress = 'Invalid address',
  invalidConfig = 'Invalid WalletConnect setup',
  invalidTopic = 'Expired connection',
  sessionExpired = 'Unable to connect to existing session',
  connectError = 'Unable to connect',
  userRejected = 'User rejected connection proposal',
  userRejectedExisting = 'User rejected existing connection proposal',
  errorLogout = 'Unable to remove existing pairing',
  invalidChainID = 'Invalid chainID'
}

export enum WalletConnectEventsEnum {
  'CLOSE' = 'CLOSE',
  'DATA_UPDATE' = 'DATA_UPDATE'
}

export interface IWalletConnectModalData {
  wcURI: string;
  shouldClose?: boolean;
}
