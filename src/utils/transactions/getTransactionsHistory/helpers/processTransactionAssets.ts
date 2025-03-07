import { DECIMALS } from 'lib/sdkDappUtils';
import { ServerTransactionType } from 'types/serverTransactions.types';

import { getAssetAmount } from './getAssetAmount';
import { getAssetPrice } from './getAssetPrice';

interface IProcessTransactionAssetsParams {
  transaction: ServerTransactionType;
  userIsReceiver: boolean;
  egldLabel?: string;
}

export interface IProcessedTransactionAsset {
  assetPrefix: string;
  assetTicker: string;
  assetAmount: string;
  assetImage?: string;
  assetPrice?: string;
  type: string;
}

export const processTransactionAssets = ({
  transaction,
  userIsReceiver,
  egldLabel
}: IProcessTransactionAssetsParams): IProcessedTransactionAsset[] => {
  const transactionAction = transaction.action;
  const transactionArguments = transactionAction && transactionAction.arguments;

  const transactionTransfers: Record<string, string>[] =
    transactionArguments && Array.isArray(transactionArguments.transfers)
      ? transactionArguments.transfers
      : [];

  const isEgldTransfer = transactionTransfers.length === 0;
  const processedEgldLabel = egldLabel ?? 'EGLD';
  const assetPrefix = userIsReceiver ? '+' : '-';

  const egldTransferAsset: IProcessedTransactionAsset = {
    assetPrefix,
    type: processedEgldLabel,
    assetTicker: processedEgldLabel,
    assetAmount: getAssetAmount({
      value: transaction.value,
      decimals: String(DECIMALS)
    })
  };

  const transfersAssets = transactionTransfers.map(
    (transactionTransfer): IProcessedTransactionAsset => ({
      assetPrefix,
      type: transactionTransfer.type,
      assetTicker: transactionTransfer.ticker,
      assetImage: transactionTransfer.svgUrl,
      assetAmount: getAssetAmount(transactionTransfer),
      assetPrice: getAssetPrice(transactionTransfer)
    })
  );

  if (isEgldTransfer) {
    return [egldTransferAsset];
  }

  return transfersAssets;
};
