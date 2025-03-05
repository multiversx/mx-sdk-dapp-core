import { formatAmount, DECIMALS } from 'lib/sdkDappUtils';
import { TransactionDirectionEnum } from 'types/serverTransactions.types';
import { getInterpretedTransaction } from 'utils/transactions/getInterpretedTransaction';
import { getTransactionReceiver } from 'utils/transactions/getTransactionReceiver';
import { getTransactionTransferType } from 'utils/transactions/getTransactionTransferType';
import { mapTransactionAssets } from './mapTransactionAssets';
import type {
  MapTransactionToListItemParamsType,
  TransactionListItem
} from '../types/transaction.types';

export const mapTransactionToListItem = ({
  transaction,
  address,
  explorerAddress,
  egldLabel
}: MapTransactionToListItemParamsType): TransactionListItem => {
  const interpretedTx = getInterpretedTransaction({
    transaction,
    address,
    explorerAddress
  });

  const receiver = getTransactionReceiver(transaction);
  const direction = getTransactionTransferType({
    address,
    transaction,
    receiver
  });

  const assets = mapTransactionAssets(transaction);
  const amountPrefix = direction === TransactionDirectionEnum.IN ? '+' : '-';
  const isIncoming = direction === TransactionDirectionEnum.IN;
  const formattedAmount = formatAmount({
    input: transaction.value,
    // TODO: Check for token decimals
    decimals: DECIMALS
  });

  const amount = transaction.value
    ? `${amountPrefix}${formattedAmount} ${transaction.tokenIdentifier || egldLabel}`
    : '';

  return {
    title: interpretedTx.transactionDetails.method.name,
    amount,
    mainIconUrl: assets.mainIconUrl,
    details: {
      directionLabel: isIncoming ? 'From' : 'To',
      initiator: isIncoming ? transaction.sender : receiver,
      iconUrl: assets.initiatorIconUrl
    },
    rightIcons: assets.rightIcons
  };
};
