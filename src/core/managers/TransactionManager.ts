import { Transaction } from '@multiversx/sdk-core/out';
import axios, { AxiosError } from 'axios';
import { BATCH_TRANSACTIONS_ID_SEPARATOR } from 'constants/transactions.constants';
import { getAccount } from 'core/methods/account/getAccount';
import { networkSelector } from 'store/selectors';
import { getState } from 'store/store';
import { GuardianActionsEnum } from 'types';
import { BatchTransactionsResponseType } from 'types/serverTransactions.types';
import { SignedTransactionType } from 'types/transactions.types';

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
  ): Promise<string[]> => {
    if (signedTransactions.length === 0) {
      throw new Error('No transactions to send');
    }

    try {
      if (this.isBatchTransaction(signedTransactions)) {
        const sentTransactions =
          await this.sendSignedBatchTransactions(signedTransactions);

        if (!sentTransactions.data || sentTransactions.data.error) {
          throw new Error(
            sentTransactions.data?.error || 'Failed to send transactions'
          );
        }

        const flatSentTransactions = this.sequentialToFlatArray(
          sentTransactions.data.transactions
        );

        return flatSentTransactions.map((transaction) => transaction.hash);
      }

      const hashes = await this.sendSignedTransactions(signedTransactions);
      return hashes;
    } catch (error) {
      const responseData = <{ message: string }>(
        (error as AxiosError).response?.data
      );
      throw responseData?.message ?? (error as any).message;
    }
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

  private isBatchTransaction = (
    transactions: Transaction[] | Transaction[][]
  ): transactions is Transaction[][] => {
    return Array.isArray(transactions[0]);
  };

  private parseSignedTransaction = (signedTransaction: Transaction) => {
    const parsedTransaction = {
      ...signedTransaction.toPlainObject(),
      hash: signedTransaction.getHash().hex()
    };

    // TODO: Remove when the protocol supports usernames for guardian transactions
    if (this.isGuardianTx(parsedTransaction.data)) {
      delete parsedTransaction.senderUsername;
      delete parsedTransaction.receiverUsername;
    }

    return parsedTransaction;
  };

  private isGuardianTx = (transactionData?: string) =>
    transactionData &&
    transactionData.startsWith(GuardianActionsEnum.SetGuardian);
}
