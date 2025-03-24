import { ITransactionListItem } from 'lib/sdkDappCoreUi';
import { ServerTransactionType } from 'types/serverTransactions.types';

export const TRANSACTION_CACHE_KEY_PREFIX = 'tx_cache_';
export const TRANSACTION_CACHE_EXPIRY = 24 * 60 * 60 * 1000;

export interface CachedTransaction {
  transaction: ITransactionListItem;
  timestamp: number;
}

export const getCachedTransaction = (
  hash: string
): ITransactionListItem | null => {
  const cacheKey = `${TRANSACTION_CACHE_KEY_PREFIX}${hash}`;

  try {
    const cachedData = localStorage.getItem(cacheKey);
    if (!cachedData) {
      return null;
    }

    const { transaction, timestamp }: CachedTransaction =
      JSON.parse(cachedData);

    if (Date.now() - timestamp > TRANSACTION_CACHE_EXPIRY) {
      localStorage.removeItem(cacheKey);
      return null;
    }

    return transaction;
  } catch (_error) {
    return null;
  }
};

export const cacheTransaction = (
  hash: string,
  transaction: ITransactionListItem
): void => {
  try {
    const cacheData: CachedTransaction = {
      transaction,
      timestamp: Date.now()
    };
    localStorage.setItem(
      `${TRANSACTION_CACHE_KEY_PREFIX}${hash}`,
      JSON.stringify(cacheData)
    );
  } catch (_error) {
    return;
  }
};
