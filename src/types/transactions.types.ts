import { Address, Transaction } from '@multiversx/sdk-core';
import { IPlainTransactionObject } from '@multiversx/sdk-core/out/interface';

import { AssetType, ScamInfoType } from './account.types';
import { EsdtEnumType, NftEnumType } from './tokens.types';
import {
  TransactionBatchStatusesEnum,
  TransactionServerStatusesEnum,
  TransactionTypesEnum
} from './enums.types';

export interface ScResultType {
  callType: string;
  data?: string;
  gasLimit: number;
  gasPrice: number;
  hash: string;
  nonce: number;
  originalTxHash: string;
  prevTxHash: string;
  receiver: string;
  returnMessage?: string;
  sender: string;
  timestamp: number;
  value: string;
}

export interface TransactionTokensType {
  esdts: string[];
  nfts: string[];
}

export enum TransactionActionsEnum {
  addLiquidity = 'addLiquidity',
  addLiquidityProxy = 'addLiquidityProxy',
  claimDualYield = 'claimDualYield',
  claimDualYieldProxy = 'claimDualYieldProxy',
  claimLockedAssets = 'claimLockedAssets',
  claimRewards = 'claimRewards',
  claimRewardsProxy = 'claimRewardsProxy',
  compoundRewards = 'compoundRewards',
  compoundRewardsProxy = 'compoundRewardsProxy',
  delegate = 'delegate',
  enterFarm = 'enterFarm',
  enterFarmAndLockRewards = 'enterFarmAndLockRewards',
  enterFarmAndLockRewardsProxy = 'enterFarmAndLockRewardsProxy',
  enterFarmProxy = 'enterFarmProxy',
  exitFarm = 'exitFarm',
  exitFarmProxy = 'exitFarmProxy',
  lockTokens = 'lockTokens',
  mergeLockedAssetTokens = 'mergeLockedAssetTokens',
  migrateOldTokens = 'migrateOldTokens',
  ping = 'ping',
  reDelegateRewards = 'reDelegateRewards',
  removeLiquidity = 'removeLiquidity',
  removeLiquidityProxy = 'removeLiquidityProxy',
  stake = 'stake',
  stakeClaimRewards = 'claimRewards',
  stakeFarm = 'stakeFarm',
  stakeFarmProxy = 'stakeFarmProxy',
  stakeFarmTokens = 'stakeFarmTokens',
  stakeFarmTokensProxy = 'stakeFarmTokensProxy',
  swap = 'swap',
  swapTokensFixedInput = 'swapTokensFixedInput',
  swapTokensFixedOutput = 'swapTokensFixedOutput',
  transfer = 'transfer',
  unBond = 'unBond',
  unDelegate = 'unDelegate',
  unStake = 'unStake',
  unbondFarm = 'unbondFarm',
  unlockAssets = 'unlockAssets',
  unstakeFarm = 'unstakeFarm',
  unstakeFarmProxy = 'unstakeFarmProxy',
  unstakeFarmTokens = 'unstakeFarmTokens',
  unstakeFarmTokensProxy = 'unstakeFarmTokensProxy',
  unwrapEgld = 'unwrapEgld',
  withdraw = 'withdraw',
  wrapEgld = 'wrapEgld'
}

export enum TransactionActionCategoryEnum {
  esdtNft = 'esdtNft',
  mex = 'mex',
  stake = 'stake',
  scCall = 'scCall'
}

export interface TokenArgumentType {
  type: NftEnumType | EsdtEnumType;
  name: string;
  ticker: string;
  collection?: string;
  identifier?: string;
  token?: string;
  decimals: number;
  value: string;
  providerName?: string;
  providerAvatar?: string;
  svgUrl?: string;
  valueUSD?: string;
}

export interface TransactionActionType {
  category: string;
  name: TransactionActionsEnum;
  description?: string;
  arguments?: { [key: string]: any };
}

export interface UnwrapperType {
  token?: TokenArgumentType[];
  tokenNoValue?: TokenArgumentType[];
  tokenNoLink?: TokenArgumentType[];
  address?: string;
  egldValue?: string;
  value?: string;
  providerName?: string;
  providerAvatar?: string;
}

export enum TransactionOperationActionTypeEnum {
  none = 'none',
  transfer = 'transfer',
  burn = 'burn',
  addQuantity = 'addQuantity',
  create = 'create',
  multiTransfer = 'multiTransfer',
  localMint = 'localMint',
  localBurn = 'localBurn',
  wipe = 'wipe',
  freeze = 'freeze',
  writeLog = 'writeLog',
  signalError = 'signalError',

  // to be deprecated ?
  ESDTLocalMint = 'ESDTLocalMint',
  ESDTLocalBurn = 'ESDTLocalBurn'
}

export enum VisibleTransactionOperationType {
  nft = 'nft',
  esdt = 'esdt',
  egld = 'egld'
}
export enum HiddenTransactionOperationType {
  none = 'none',
  error = 'error',
  log = 'log'
}

export interface OperationType {
  id?: string;
  action: TransactionOperationActionTypeEnum;
  type: VisibleTransactionOperationType | HiddenTransactionOperationType;
  esdtType?: NftEnumType | EsdtEnumType;
  collection?: string;
  name?: string;
  identifier?: string;
  sender: string;
  ticker?: string;
  receiver: string;
  value: string;
  decimals?: number;
  data?: string;
  message?: string;
  svgUrl?: string;
  senderAssets?: AssetType;
  receiverAssets?: AssetType;
  valueUSD?: string;
}

export interface LogType {
  hash: string;
  callType: string;
  gasLimit: number;
  gasPrice: number;
  nonce: number;
  prevTxHash: string;
  receiver?: string;
  sender: string;
  value: string;
  data?: string;
  originalTxHash: string;
  returnMessage?: string;
  logs?: any;
}

export interface EventType {
  address: string;
  identifier: string;
  topics: string[];
  order: number;
  data?: string;
  additionalData?: string[];
}

export interface ResultLogType {
  id: string;
  address: string;
  events: EventType[];
}

export interface ResultType {
  hash: string;
  callType: string;
  gasLimit: number;
  gasPrice: number;
  nonce: number;
  prevTxHash: string;
  receiver?: string;
  sender: string;
  value: string;
  data?: string;
  originalTxHash: string;
  returnMessage?: string;
  logs?: ResultLogType;
  senderAssets?: AssetType;
  receiverAssets?: AssetType;
  miniBlockHash?: string;
  function?: string;
  timestamp?: number;
}

export interface ReceiptType {
  value: string;
  sender: string;
  data: string;
}

export interface ServerTransactionType {
  fee?: string;
  data: string;
  gasLimit: number;
  gasPrice: number;
  gasUsed: number;
  txHash: string;
  miniBlockHash: string;
  nonce: number;
  receiver: string;
  receiverShard: number;
  round: number;
  sender: string;
  senderShard: number;
  signature: string;
  status: string;
  inTransit?: boolean;
  timestamp: number;
  value: string;
  price: number;
  results?: ResultType[];
  operations?: OperationType[];
  action?: TransactionActionType;
  logs?: {
    id: string;
    address: string;
    events: EventType[];
  };
  scamInfo?: ScamInfoType;
  pendingResults?: boolean;
  receipt?: ReceiptType;
  senderAssets?: AssetType;
  receiverAssets?: AssetType;
  type?: TransferTypeEnum;
  originalTxHash?: string;
  isNew?: boolean; // UI flag
  tokenValue?: string;
  tokenIdentifier?: string;
  function?: string;
}

export enum TransferTypeEnum {
  Transaction = 'Transaction',
  SmartContractResult = 'SmartContractResult'
}

//#endregion

//#region interpreted trasactions

export enum TransactionDirectionEnum {
  SELF = 'Self',
  INTERNAL = 'Internal',
  IN = 'In',
  OUT = 'Out'
}

export interface InterpretedTransactionType extends ServerTransactionType {
  transactionDetails: {
    direction?: TransactionDirectionEnum;
    method: string;
    transactionTokens: TokenArgumentType[];
    isContract?: boolean;
  };
  links: {
    senderLink?: string;
    receiverLink?: string;
    senderShardLink?: string;
    receiverShardLink?: string;
    transactionLink?: string;
  };
}

export interface DecodeForDisplayPropsType {
  input: string;
  decodeMethod: DecodeMethodEnum;
  identifier?: string;
}

export interface DecodedDisplayType {
  displayValue: string;
  validationWarnings: string[];
}

export enum DecodeMethodEnum {
  raw = 'raw',
  text = 'text',
  decimal = 'decimal',
  smart = 'smart'
}

//#endregion

export enum BatchTransactionStatus {
  pending = 'pending',
  success = 'success',
  invalid = 'invalid',
  dropped = 'dropped',
  fail = 'fail'
}

export interface BatchTransactionsRequestType {
  id: string;
  transactions: SignedTransactionType[][];
}

export interface BatchTransactionsResponseType {
  id: string;
  status: BatchTransactionStatus;
  transactions: SignedTransactionType[][];
  error?: string;
  message?: string;
  statusCode?: string;
}

export type BatchTransactionsWSResponseType = {
  batchId: string;
  txHashes: string[];
};

export interface TransactionsToSignType {
  transactions: IPlainTransactionObject[];
  callbackRoute?: string;
  sessionId: string;
  customTransactionInformation: CustomTransactionInformation;
}

export interface SignedTransactionsBodyType {
  transactions?: SignedTransactionType[];
  status?: TransactionBatchStatusesEnum;
  errorMessage?: string;
  redirectRoute?: string;
  customTransactionInformation?: CustomTransactionInformation;
}

export interface SignedTransactionsType {
  [sessionId: string]: SignedTransactionsBodyType;
}

export interface TransactionParameter {
  sender: Address;
  receiver: Address;
  functionName: string;
  inputParameters: string[];
  outputParameters: string[];
}

export type RawTransactionType = IPlainTransactionObject;

export interface TransactionDataTokenType {
  tokenId: string;
  amount: string;
  receiver: string;
  type?: MultiEsdtTransactionType['type'] | '';
  nonce?: string;
  multiTxData?: string;
}

export type TransactionsDataTokensType =
  | Record<string, TransactionDataTokenType>
  | undefined;

interface MultiEsdtType {
  type:
    | TransactionTypesEnum.esdtTransaction
    | TransactionTypesEnum.nftTransaction;
  receiver: string;
  token?: string;
  nonce?: string;
  amount?: string;
  data: string;
}

interface MultiEsdtScCallType {
  type: TransactionTypesEnum.scCall;
  receiver: string;
  token?: string;
  nonce?: string;
  amount?: string;
  data: string;
}

export type MultiEsdtTransactionType = MultiEsdtType | MultiEsdtScCallType;

export interface MultiSignTransactionType {
  multiTxData?: string;
  transactionIndex: number;
  transaction: Transaction;
}

export interface TokenOptionType {
  name: string;
  identifier: string;
  balance: string;
  decimals: number;
  collection?: string;
  avatar?: string;
}

export interface SimpleTransactionType {
  value: string;
  receiver: string;
  data?: string;
  gasPrice?: number;
  gasLimit?: number;
  chainID?: string;
  version?: number;
  options?: number;
  guardian?: string;
  guardianSignature?: string;
  nonce?: number;
}

export interface TransactionsDisplayInfoType {
  errorMessage?: string;
  successMessage?: string;
  processingMessage?: string;
  submittedMessage?: string;
  transactionDuration?: number;
  timedOutMessage?: string;
  invalidMessage?: string;
}

export interface SendSimpleTransactionPropsType {
  transactions: SimpleTransactionType[];
  minGasLimit?: number;
}

export interface ActiveLedgerTransactionType {
  dataField: string;
  isTokenTransaction: boolean;
  receiverScamInfo: string | null;
  transaction: Transaction;
  transactionIndex: number;
  transactionTokenInfo: TransactionDataTokenType;
}

export interface SmartContractResult {
  hash: string;
  timestamp: number;
  nonce: number;
  gasLimit: number;
  gasPrice: number;
  value: string;
  sender: string;
  receiver: string;
  data: string;
  prevTxHash: string;
  originalTxHash: string;
  callType: string;
  miniBlockHash: string;
  returnMessage: string;
}

export type DeviceSignedTransactions = Record<number, Transaction>;

export interface SendTransactionReturnType {
  error?: string;
  sessionId: string | null;
}

export interface SendBatchTransactionReturnType {
  error?: string;
  batchId: string | null;
}

export type GetTransactionsByHashesType = (
  pendingTransactions: PendingTransactionsType
) => Promise<GetTransactionsByHashesReturnType>;

export type GetTransactionsByHashesReturnType = {
  hash: string;
  invalidTransaction: boolean;
  status: TransactionServerStatusesEnum;
  inTransit?: boolean;
  results: SmartContractResult[];
  sender: string;
  receiver: string;
  data: string;
  previousStatus: string;
  hasStatusChanged: boolean;
}[];

export type PendingTransactionsType = {
  hash: string;
  previousStatus: string;
}[];

export interface TransactionLinkType {
  link: string;
  label: string;
  address: string;
}

export interface SignedTransactionType extends RawTransactionType {
  hash: string;
  status: TransactionServerStatusesEnum;
  inTransit?: boolean;
  errorMessage?: string;
  customTransactionInformation?: CustomTransactionInformation;
}

export interface CustomTransactionInformation {
  redirectAfterSign: boolean;
  sessionInformation: any;
  completedTransactionsDelay?: number;
  signWithoutSending: boolean;
  /**
   * If true, transactions with lower nonces than the account nonce will not be updated with the correct nonce
   */
  skipUpdateNonces?: boolean;
  /**
   * If true, the change guardian action will not trigger transaction version update
   */
  skipGuardian?: boolean;
  /**
   * Keeps indexes of transactions that should be grouped together. If not provided, all transactions will be grouped together. Used only for batch transactions.
   */
  grouping?: number[][];
  /**
   * For Cross-Window provider in Safari browser, performing async calls before signing transactions needs a consent popup in order to open a new tab.
   */
  hasConsentPopup?: boolean;
}
