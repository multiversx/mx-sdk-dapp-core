import { Transaction } from '@multiversx/sdk-core/out';
import axios, { AxiosError } from 'axios';
import { BATCH_TRANSACTIONS_ID_SEPARATOR } from 'constants/transactions.constants';
import { getAccount } from 'core/methods/account/getAccount';
import { addTransactionToast } from 'store/actions/toasts/toastsActions';
import { createTransactionsSession } from 'store/actions/transactions/transactionsActions';
import { networkSelector } from 'store/selectors';
import { getState } from 'store/store';
import {
  TransactionBatchStatusesEnum,
  TransactionServerStatusesEnum
} from 'types/enums.types';
import { BatchTransactionsResponseType } from 'types/serverTransactions.types';
import {
  ISentTransactions,
  ITransactionsDisplayInfo,
  SignedTransactionType
} from 'types/transactions.types';
import { isGuardianTx } from 'utils/transactions/isGuardianTx';
import { isBatchTransaction } from './helpers/isBatchTransaction';
import { getToastDuration } from './helpers/getToastDuration';
import { getBatchStatus } from './helpers/getBatchStatus';

export class TransactionManager {
  private static instance: TransactionManager | null = null;

  private constructor() {}

  public static getInstance(): TransactionManager {
    if (!TransactionManager.instance) {
      TransactionManager.instance = new TransactionManager();
    }
    return TransactionManager.instance;
  }

  public send = async (
    signedTransactions: Transaction[] | Transaction[][]
  ): Promise<ISentTransactions> => {
    if (signedTransactions.length === 0) {
      throw new Error('No transactions to send');
    }

    try {
      if (!isBatchTransaction(signedTransactions)) {
        const flatTransactions =
          await this.sendSignedTransactions(signedTransactions);

        return {
          status: TransactionBatchStatusesEnum.sent,
          transactions: flatTransactions
        };
      }

      const sentTransactions =
        await this.sendSignedBatchTransactions(signedTransactions);

      if (!sentTransactions.data || sentTransactions.data.error) {
        throw new Error(
          sentTransactions.data?.error || 'Failed to send transactions'
        );
      }

      return {
        status: getBatchStatus(sentTransactions.data.status),
        transactions: sentTransactions.data.transactions
      };
    } catch (error) {
      const responseData = <{ message: string }>(
        (error as AxiosError).response?.data
      );
      throw responseData?.message ?? (error as any).message;
    }
  };

  public track = async (
    sentTransactions: ISentTransactions,
    options: {
      disableToasts?: boolean;
      transactionsDisplayInfo?: ITransactionsDisplayInfo;
    } = { disableToasts: false }
  ) => {
    const { status, transactions } = sentTransactions;
    const flatTransactions = this.sequentialToFlatArray(transactions);
    const sessionId = createTransactionsSession({
      transactions: flatTransactions,
      transactionsDisplayInfo: options.transactionsDisplayInfo,
      status
    });

    if (options.disableToasts === true) {
      return;
    }

    const totalDuration = getToastDuration(transactions);
    addTransactionToast({ toastId: sessionId, totalDuration });
  };

  private sendSignedTransactions = async (
    signedTransactions: Transaction[]
  ): Promise<SignedTransactionType[]> => {
    const { apiAddress, apiTimeout } = networkSelector(getState());

    const promises = signedTransactions.map((transaction) =>
      axios.post(`${apiAddress}/transactions`, transaction.toPlainObject(), {
        timeout: Number(apiTimeout)
      })
    );

    const response = await Promise.all(promises);

    return response.map(({ data }) => ({
      ...data,
      status: TransactionServerStatusesEnum.pending,
      hash: data.txHash
    }));
  };

  private sendSignedBatchTransactions = async (
    signedTransactions: Transaction[][]
  ) => {
    const { address } = getAccount();
    const { apiAddress, apiTimeout } = networkSelector(getState());

    if (!address) {
      return {
        error:
          'Invalid address provided. You need to be logged in to send transactions'
      };
    }

    const batchId = this.buildBatchId(address);
    const parsedTransactions = signedTransactions.map((transactions) =>
      transactions.map((transaction) =>
        this.parseSignedTransaction(transaction)
      )
    );

    const payload = {
      transactions: parsedTransactions,
      id: batchId
    };

    const { data } = await axios.post<BatchTransactionsResponseType>(
      `${apiAddress}/batch`,
      payload,
      {
        timeout: Number(apiTimeout)
      }
    );

    return { data };
  };

  private buildBatchId = (address: string) => {
    const sessionId = Date.now().toString();
    return `${sessionId}${BATCH_TRANSACTIONS_ID_SEPARATOR}${address}`;
  };
  private sequentialToFlatArray = (
    transactions: SignedTransactionType[] | SignedTransactionType[][] = []
  ) =>
    this.getIsSequential(transactions)
      ? transactions.flat()
      : (transactions as SignedTransactionType[]);

  private getIsSequential = (
    transactions?: SignedTransactionType[] | SignedTransactionType[][]
  ) => transactions?.every((transaction) => Array.isArray(transaction));

  private parseSignedTransaction = (
    signedTransaction: Transaction
  ): SignedTransactionType => {
    const parsedTransaction = {
      ...signedTransaction.toPlainObject(),
      hash: signedTransaction.getHash().hex(),
      status: TransactionServerStatusesEnum.pending
    };

    // TODO: Remove when the protocol supports usernames for guardian transactions
    if (isGuardianTx({ data: parsedTransaction.data })) {
      delete parsedTransaction.senderUsername;
      delete parsedTransaction.receiverUsername;
    }

    return parsedTransaction;
  };
}
