import { ITransactionDataToken } from 'types/transactions.types';

export const getHighlight = (txInfoToken?: ITransactionDataToken) => {
  if (!txInfoToken?.multiTxData) {
    return null;
  }

  return txInfoToken.multiTxData;
};
