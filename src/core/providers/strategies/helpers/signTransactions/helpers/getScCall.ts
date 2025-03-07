import { ITransactionDataToken } from 'types/transactions.types';
import { decodePart } from 'utils/decoders/decodePart';

export const getScCall = (txInfoToken?: ITransactionDataToken) => {
  if (!txInfoToken?.multiTxData) {
    return null;
  }

  const { multiTxData, tokenId } = txInfoToken;

  if (tokenId) {
    return null;
  }

  const scCall = decodePart(multiTxData);
  return scCall;
};
