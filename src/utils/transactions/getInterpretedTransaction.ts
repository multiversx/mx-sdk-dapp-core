import {
  InterpretedTransactionType,
  ServerTransactionType,
  TransactionAgeType,
  TransactionMethodType
} from 'types/serverTransactions.types';
import { TokenArgumentType } from 'types/serverTransactions.types';
import { explorerUrlBuilder } from './explorerUrlBuilder';
import { getExplorerLink } from './getExplorerLink';
import { getHumanReadableTimeFormat } from './getHumanReadableTimeFormat';
import { getTokenFromData } from './getTokenFromData';
import { getTransactionIconInfo } from './getTransactionIconInfo';
import { getTransactionMethod } from './getTransactionMethod';
import { getTransactionReceiver } from './getTransactionReceiver';
import { getTransactionReceiverAssets } from './getTransactionReceiverAssets';
import { getTransactionTokens } from './getTransactionTokens';
import { getTransactionTransferType } from './getTransactionTransferType';
import { timeAgo } from '../operations/timeRemaining';
import { isContract } from '../validation';

export interface GetInterpretedTransactionType {
  address: string;
  explorerAddress: string;
  transaction: ServerTransactionType;
}

export function getInterpretedTransaction({
  transaction,
  address,
  explorerAddress
}: GetInterpretedTransactionType): InterpretedTransactionType {
  const tokenIdentifier =
    transaction.tokenIdentifier ?? getTokenFromData(transaction.data).tokenId;

  const receiver = getTransactionReceiver(transaction);
  const receiverAssets = getTransactionReceiverAssets(transaction);
  const age: TransactionAgeType = {
    age: timeAgo(transaction.timestamp * 1000, true),
    tooltip: getHumanReadableTimeFormat({
      value: transaction.timestamp,
      noSeconds: false,
      utc: true
    })
  };

  const direction = getTransactionTransferType(address, transaction, receiver);
  const method: TransactionMethodType = {
    transactionActionDescription: transaction.action?.description,
    method: getTransactionMethod(transaction)
  };

  const transactionTokens: TokenArgumentType[] =
    getTransactionTokens(transaction);

  const senderLink = getExplorerLink({
    explorerAddress,
    to: explorerUrlBuilder.accountDetails(transaction.sender)
  });

  const receiverLink = getExplorerLink({
    explorerAddress,
    to: explorerUrlBuilder.accountDetails(receiver)
  });

  const senderShardLink = getExplorerLink({
    explorerAddress,
    to: explorerUrlBuilder.senderShard(transaction.senderShard)
  });

  const receiverShardLink = getExplorerLink({
    explorerAddress,
    to: explorerUrlBuilder.receiverShard(transaction.receiverShard)
  });

  const transactionHash = transaction.originalTxHash || transaction.txHash;

  const transactionLink = getExplorerLink({
    explorerAddress,
    to: explorerUrlBuilder.transactionDetails(transactionHash)
  });

  return {
    ...transaction,
    txHash: transactionHash,
    tokenIdentifier,
    receiver,
    receiverAssets,
    transactionDetails: {
      age,
      direction,
      method,
      iconInfo: getTransactionIconInfo(transaction),
      transactionTokens,
      isContract: isContract(transaction.sender)
    },
    links: {
      senderLink,
      receiverLink,
      senderShardLink,
      receiverShardLink,
      transactionLink
    }
  };
}
