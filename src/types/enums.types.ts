export enum EnvironmentsEnum {
  testnet = 'testnet',
  devnet = 'devnet',
  mainnet = 'mainnet'
}

export const LoginMethodsEnum = {
  iframe: 'iframe',
  crossWindow: 'crossWindow',
  extension: 'extension',
  walletConnect: 'walletConnect',
  hardware: 'hardware',
  opera: 'opera',
  metamask: 'metamask',
  webhook: 'webhook',
  custom: "custom",
  none: ''
} as const

export type LoginMethodsType = typeof LoginMethodsEnum[keyof typeof LoginMethodsEnum];

export enum TypesOfSmartContractCallsEnum {
  MultiESDTNFTTransfer = 'MultiESDTNFTTransfer',
  ESDTNFTTransfer = 'ESDTNFTTransfer'
}

export enum ESDTTransferTypesEnum {
  ESDTNFTTransfer = 'ESDTNFTTransfer',
  ESDTNFTBurn = 'ESDTNFTBurn',
  ESDTNFTAddQuantity = 'ESDTNFTAddQuantity',
  ESDTNFTCreate = 'ESDTNFTCreate',
  MultiESDTNFTTransfer = 'MultiESDTNFTTransfer',
  ESDTTransfer = 'ESDTTransfer',
  ESDTBurn = 'ESDTBurn',
  ESDTLocalMint = 'ESDTLocalMint',
  ESDTLocalBurn = 'ESDTLocalBurn',
  ESDTWipe = 'ESDTWipe',
  ESDTFreeze = 'ESDTFreeze'
}
