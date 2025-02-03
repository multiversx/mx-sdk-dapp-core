import {
  InterpretedTransactionType,
  ServerTransactionType,
  TransactionAgeType,
  TransactionDirectionEnum
} from 'types/serverTransactions.types';
import { getInterpretedTransaction } from '../getInterpretedTransaction';
import { transactionMock } from './extended-transaction-mock';
import { timeAgo } from '../../operations/timeRemaining';
import { isContract } from '../../validation';
import { explorerUrlBuilder } from '../explorerUrlBuilder';
import { getHumanReadableTimeFormat } from '../getHumanReadableTimeFormat';
import { getTransactionIconInfo } from '../getTransactionIconInfo';
import { getTransactionMethod } from '../getTransactionMethod';

const explorerAddress = 'https://testing.devnet.com';

describe('getInterpretedTransaction', () => {
  it('creates an extended model of the existing transaction with all necessary information', () => {
    const transaction: ServerTransactionType = {
      ...transactionMock,
      tokenIdentifier: 'token-id'
    };

    const address = 'erd1-my-address-hash';

    const result = getInterpretedTransaction({
      transaction,
      address,
      explorerAddress
    });

    const expectedAge: TransactionAgeType = {
      timeAgo: timeAgo(transaction.timestamp * 1000, true),
      tooltip: getHumanReadableTimeFormat({
        value: transaction.timestamp,
        noSeconds: false,
        utc: true
      })
    };

    const expectedOutput: InterpretedTransactionType = {
      ...transaction,
      tokenIdentifier: 'token-id',
      receiver: transaction.receiver, // Assuming getTransactionReceiver returns this for this case
      receiverAssets: {
        description: 'description',
        iconPng: 'icon.png',
        iconSvg: 'icon.svg',
        name: 'john doe',
        tags: ['@tag1', '@tag2']
      },
      transactionDetails: {
        age: expectedAge,
        direction: TransactionDirectionEnum.OUT, // Assuming this is the correct direction for this case
        method: {
          actionDescription: transaction.action?.description,
          name: getTransactionMethod(transaction)
        },
        iconInfo: getTransactionIconInfo(transaction),
        transactionTokens: [
          transaction?.action?.arguments?.token,
          transaction?.action?.arguments?.token1,
          transaction?.action?.arguments?.token2,
          transaction?.action?.arguments?.transfers
        ].filter((x) => x != null),
        isContract: isContract(transaction.sender)
      },
      links: {
        senderLink: `${explorerAddress}${explorerUrlBuilder.accountDetails(transaction.sender)}`,
        receiverLink: `${explorerAddress}${explorerUrlBuilder.accountDetails(transaction.receiver)}`,
        senderShardLink: `${explorerAddress}${explorerUrlBuilder.senderShard(transaction.senderShard)}`,
        receiverShardLink: `${explorerAddress}${explorerUrlBuilder.receiverShard(transaction.receiverShard)}`,
        transactionLink: `${explorerAddress}${explorerUrlBuilder.transactionDetails(transaction.txHash)}`
      }
    };

    expect(result).toEqual(expectedOutput);
  });
});
