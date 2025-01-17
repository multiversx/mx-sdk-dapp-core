import { TransactionDataTokenType } from 'types/transactions.types';
import { decodePart } from 'utils/decoders/decodePart';

type HighlightDataType = {
  highlight: string | null;
  scCall: string | null;
};

export const getHighlightInfo = (txInfoToken?: TransactionDataTokenType) => {
  const data: HighlightDataType = {
    highlight: null,
    scCall: null
  };

  if (!txInfoToken?.multiTxData) {
    return data;
  }

  const { multiTxData, tokenId } = txInfoToken;

  if (multiTxData) {
    data.highlight = multiTxData;
  }

  if (!tokenId) {
    const scCall = decodePart(multiTxData);
    data.scCall = scCall;
  }

  return data;
};
