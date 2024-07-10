export enum EnvironmentsEnum {
  testnet = 'testnet',
  devnet = 'devnet',
  mainnet = 'mainnet'
}

export enum LoginMethodsEnum {
  ledger = 'ledger',
  walletconnect = 'walletconnect',
  walletconnectv2 = 'walletconnectv2',
  wallet = 'wallet',
  crossWindow = 'crossWindow',
  extension = 'extension',
  metamask = 'metamask',
  opera = 'opera',
  extra = 'extra',
  none = ''
}

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
