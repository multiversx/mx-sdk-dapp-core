import { ITransactionListItem } from 'lib/sdkDappCoreUi';
import { TransactionServerStatusesEnum } from 'types/enums.types';
import { ServerTransactionType } from 'types/serverTransactions.types';
import { IBaseTransactionParams } from 'types/transaction-list-item.types';
import { getReceiverData } from 'utils/transactions/getTransactionsHistory/helpers/getReceiverData';
import { getTransactionAction } from './getTransactionAction';
import { getTransactionAmount } from './getTransactionAmount';
import { getTransactionAsset } from './getTransactionAsset';
import { getTransactionAssets } from './getTransactionAssets';

interface IMapTransactionToListItemParamsType extends IBaseTransactionParams {
  transaction: ServerTransactionType;
  isPending?: boolean;
  profileImages?: Record<string, string>;
}

export const mapTransactionToListItem = ({
  transaction,
  address,
  egldLabel,
  isPending = false
}: IMapTransactionToListItemParamsType): ITransactionListItem => {
  const { receiver, receiverAssets } = getReceiverData(transaction);
  const isIncomingTransaction = address === receiver;

  const action = getTransactionAction({
    transaction,
    currentUserAddress: address,
    egldLabel,
    isPending
  });

  const transactionAssets = getTransactionAssets({
    userIsReceiver: receiver === address,
    transaction,
    egldLabel
  });

  const transactionListItem: ITransactionListItem = {
    asset: getTransactionAsset({
      ...transaction,
      transactionAssets,
      showDefaultState: isPending,
      status: transaction.status as TransactionServerStatusesEnum
    }),
    details: {
      initiator: isIncomingTransaction ? transaction.sender : receiver,
      initiatorAsset: isIncomingTransaction
        ? transaction.senderAssets?.iconSvg ?? transaction.senderAssets?.iconPng
        : receiverAssets?.iconSvg ?? receiverAssets?.iconPng,
      directionLabel: isIncomingTransaction ? 'From' : 'To'
    },
    action,
    amount: getTransactionAmount({
      transactionAssets,
      isIncomingTransaction
    })
  };

  return transactionListItem;
};
