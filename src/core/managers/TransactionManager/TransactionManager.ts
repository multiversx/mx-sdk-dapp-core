import { Transaction } from '@multiversx/sdk-core/out';
import axios, { AxiosError } from 'axios';
import { BATCH_TRANSACTIONS_ID_SEPARATOR } from 'constants/transactions.constants';
import { getAccount } from 'core/methods/account/getAccount';
import { addTransactionToast } from 'store/actions/toasts/toastsActions';
import { createTrackedTransactionsSession } from 'store/actions/trackedTransactions/trackedTransactionsActions';
import { networkSelector } from 'store/selectors';
import { getState } from 'store/store';
import { TransactionServerStatusesEnum } from 'types/enums.types';
import { BatchTransactionsResponseType } from 'types/serverTransactions.types';
import {
  ITransactionsDisplayInfo,
  SignedTransactionType
} from 'types/transactions.types';
import { isGuardianTx } from 'utils/transactions/isGuardianTx';
import { isBatchTransaction } from './helpers/isBatchTransaction';
import { getToastDuration } from './helpers/getToastDuration';

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
  ): Promise<string[] | string[][]> => {
    if (signedTransactions.length === 0) {
      throw new Error('No transactions to send');
    }

    try {
      if (!isBatchTransaction(signedTransactions)) {
        const flatHases = await this.sendSignedTransactions(signedTransactions);
        return flatHases;
      }

      const sentTransactions =
        await this.sendSignedBatchTransactions(signedTransactions);

      if (!sentTransactions.data || sentTransactions.data.error) {
        throw new Error(
          sentTransactions.data?.error || 'Failed to send transactions'
        );
      }

      const groupedHashes = sentTransactions.data.transactions.map((txGroup) =>
        txGroup.map((tx) => tx.hash)
      );

      return groupedHashes;
    } catch (error) {
      const responseData = <{ message: string }>(
        (error as AxiosError).response?.data
      );
      throw responseData?.message ?? (error as any).message;
    }
  };

  public track = async (
    signedTransactions: Transaction[] | Transaction[][],
    options: {
      disableToasts?: boolean;
      transactionsDisplayInfo?: ITransactionsDisplayInfo;
    } = { disableToasts: false }
  ) => {
    const parsedTransactions =
      this.parsedSignedTransactions(signedTransactions);

    const flatTransactions = this.sequentialToFlatArray(parsedTransactions);
    const sessionId = createTrackedTransactionsSession({
      transactions: flatTransactions,
      transactionsDisplayInfo: options.transactionsDisplayInfo
    });

    if (options.disableToasts === true) {
      return;
    }

    const totalDuration = getToastDuration(parsedTransactions);
    addTransactionToast({ toastId: sessionId, totalDuration });
  };

  private parsedSignedTransactions = (
    signedTransactions: Transaction[] | Transaction[][]
  ): SignedTransactionType[] | SignedTransactionType[][] => {
    if (isBatchTransaction(signedTransactions)) {
      const parsedTransactions: SignedTransactionType[][] =
        signedTransactions.map((transactionsGroup) =>
          transactionsGroup.map((transaction) => {
            return this.parseSignedTransaction(transaction);
          })
        );
      return parsedTransactions;
    }
    const parsedTransactions: SignedTransactionType[] = signedTransactions.map(
      (transaction) => {
        return this.parseSignedTransaction(transaction);
      }
    );

    return parsedTransactions;
  };

  private sendSignedTransactions = async (
    signedTransactions: Transaction[]
  ): Promise<string[]> => {
    const { apiAddress, apiTimeout } = networkSelector(getState());

    const promises = signedTransactions.map((transaction) =>
      axios.post(`${apiAddress}/transactions`, transaction.toPlainObject(), {
        timeout: Number(apiTimeout)
      })
    );

    const response = await Promise.all(promises);

    return response.map(({ data }) => data.txHash);
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
