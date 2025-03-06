import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import type { TransactionsSliceType } from 'store/slices/transactions/transactionsSlice.types';
import type { ServerTransactionType } from 'types/serverTransactions.types';

export enum TransactionIconTypeEnum {
  FAILED = 'failed',
  MULTIPLE_ASSETS = 'multiple_assets',
  ASSET = 'asset',
  NFT = 'nft',
  SFT = 'sft',
  CONTRACT = 'contract',
  SYMBOL = 'symbol'
}

export interface TransactionListItemAssetType {
  imageUrl?: string;
  text?: string;
  icon?: string | IconDefinition;
}

export interface TransactionListItemActionType {
  name: string;
  description?: string;
}

export interface TransactionListItemDetailsType {
  // The address and asset of the sender or receiver of the transaction depending on the direction
  initiator: string;
  initiatorAsset?: string;
  directionLabel: string;
}

export interface TransactionListItemType {
  asset: TransactionListItemAssetType | null;
  details: TransactionListItemDetailsType;
  action: TransactionListItemActionType;
  amount?: string;
}

export interface BaseTransactionParamsType {
  address: string;
  explorerAddress: string;
  egldLabel: string;
}

export interface GetHistoricalTransactionsParamsType
  extends BaseTransactionParamsType {
  sessions: TransactionsSliceType;
}

export interface MapTransactionToListItemParamsType
  extends BaseTransactionParamsType {
  transaction: ServerTransactionType;
  isPending?: boolean;
  profileImages?: Record<string, string>;
}

export interface TransactionAssetType {
  assetPrefix: string;
  assetTicker: string;
  assetAmount: string;
  assetImage?: string;
  assetPrice?: string;
  type: string;
}

export enum TransactionActionMethodTypeEnum {
  transfer = 'Transfer',
  delegate = 'Delegate',
  stake = 'Stake',
  unDelegate = 'Undelegate',
  stakeClaimRewards = 'Stake Claim Rewards',
  reDelegateRewards = 'Redelegate Rewards',
  withdraw = 'Withdraw',
  claimLockedAssets = 'Claim Locked Assets',
  swapTokensFixedInput = 'Swap',
  swapTokensFixedOutput = 'Swap',
  swap = 'Swap',
  multiPairSwap = 'Multiple Pair Swap',
  aggregateEgld = 'Aggregate EGLD',
  addLiquidity = 'Add Liquidity',
  addLiquidityProxy = 'Add Liquidity Proxy',
  removeLiquidity = 'Remove Liquidity',
  removeLiquidityProxy = 'Remove Liquidity Proxy',
  enterFarm = 'Enter Farm',
  enterFarmProxy = 'Enter Farm Proxy',
  enterFarmAndLockRewards = 'Enter Farm & Lock Rewards',
  enterFarmAndLockRewardsProxy = 'Enter Farm & Lock Rewards Proxy',
  exitFarm = 'Exit Farm',
  exitFarmProxy = 'Exit Farm Proxy',
  claimRewards = 'Claim Rewards',
  claimRewardsProxy = 'Claim Rewards Proxy',
  compoundRewards = 'Reinvest Rewards',
  compoundRewardsProxy = 'Reinvest Rewards Proxy',
  createNftMinter = 'Create NFT Minter',
  scDeploy = 'Smart Contract Deploy',
  wrapEgld = 'Wrap EGLD',
  unwrapEgld = 'Unwrap EGLD',
  lockAssets = 'Lock Assets',
  unlockAssets = 'Unlock Assets',
  mergeLockedAssetTokens = 'Merge Locked Tokens',
  stakeFarm = 'Stake Farm',
  stakeFarmProxy = 'Stake Farm Proxy',
  stakeFarmTokens = 'Stake Farm Tokens',
  stakeFarmTokensProxy = 'Stake Farm Tokens Proxy',
  unstakeFarm = 'Unstake Farm',
  unstakeFarmProxy = 'Unstake Farm Proxy Proxy',
  unstakeFarmTokens = 'Unstake Farm Tokens',
  unstakeFarmTokensProxy = 'Unstake Farm Proxy',
  claimDualYield = 'Claim Dual Yield',
  claimDualYieldProxy = 'Claim Dual Yield Proxy',
  unbondFarm = 'Unbond Farm',
  ClaimDeveloperRewards = 'Claim Developer Rewards',
  ChangeOwnerAddress = 'Change Owner Address',
  SetUserName = 'Set Username',
  SaveKeyValue = 'Save Key Value',
  ESDTTransfer = 'Transfer ESDT',
  ESDTBurn = 'Burn ESDT',
  ESDTFreeze = 'Freeze ESDT',
  ESDTUnFreeze = 'Unfreeze ESDT',
  ESDTWipe = 'Wipe ESDT',
  ESDTPause = 'Pause ESDT',
  ESDTUnPause = 'Unpause ESDTBurn',
  ESDTSetRole = 'Set ESDT Role',
  ESDTUnSetRole = 'Unset ESDT Role',
  ESDTSetLimitedTransfer = 'Set ESDT Limited Transfer',
  ESDTUnSetLimitedTransfer = 'Unset ESDT Limited Transfer',
  ESDTLocalBurn = 'Local ESDT Burn',
  ESDTLocalMint = 'Local ESDT Mint',
  ESDTNFTTransfer = 'Transfer ESDT/NFT',
  ESDTNFTCreate = 'Create ESDT/NFT',
  ESDTNFTAddQuantity = 'Add ESDT/NFT Quantity',
  ESDTNFTBurn = 'Burn ESDT/NFT',
  ESDTNFTAddURI = 'Add ESDT/NFT URI',
  ESDTNFTUpdateAttributes = 'Update ESDT/NFT Attributes',
  MultiESDTNFTTransfer = 'Multiple ESDT/NFT Transfer',
  SetGuardian = 'Register Guardian',
  GuardAccount = 'Activate Guardian',
  UnGuardAccount = 'Deactivate Guardian'
}
