import { ServerTransactionType } from 'types/serverTransactions.types';
import { getTransactionTokens } from 'utils/transactions/getTransactionTokens';
import type { TransactionAssetsType } from '../types/transaction.types';

export const mapTransactionAssets = (
  transaction: ServerTransactionType
): TransactionAssetsType => {
  const tokens = getTransactionTokens(transaction);
  const hasMultipleTokens = tokens.length > 1;

  return {
    mainIconUrl: hasMultipleTokens ? undefined : tokens[0]?.svgUrl,
    rightIcons: tokens.map((token) => token.svgUrl!).filter(Boolean),
    initiatorIconUrl: ''
  };
};
