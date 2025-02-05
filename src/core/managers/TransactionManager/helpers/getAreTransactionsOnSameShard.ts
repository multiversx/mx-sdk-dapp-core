import { getAddressFromDataField } from 'utils';
import { isCrossShardTransaction } from '../../TransactionManager/helpers/isCrossShardTransaction';
import { SignedTransactionType } from 'types/transactions.types';

export const getAreTransactionsOnSameShard = (
  transactions?: SignedTransactionType[],
  accountShard = 1
): boolean => {
  if (!transactions?.length) {
    return true;
  }

  return transactions.reduce(
    (prevTxIsSameShard: boolean, { receiver, data }: SignedTransactionType) => {
      const receiverAddress = getAddressFromDataField({
        receiver,
        data: data ?? ''
      });
      if (receiverAddress == null) {
        return prevTxIsSameShard;
      }
      return (
        prevTxIsSameShard &&
        isCrossShardTransaction({
          receiverAddress,
          senderShard: accountShard
        })
      );
    },
    true
  );
};
