import { getPersistedTokenDetails } from 'apiCalls/tokens/getPersistedTokenDetails';
import { MULTI_TRANSFER_EGLD_TOKEN } from 'constants/mvx.constants';
import {
  FungibleTransactionType,
  ISignTransactionsPanelCommonData
} from 'core/managers/internal/SignTransactionsStateManager/types';
import { formatAmount } from 'lib/sdkDappUtils';
import { NetworkType } from 'types/network.types';
import { NftEnumType } from 'types/tokens.types';
import {
  MultiSignTransactionType,
  TransactionDataTokenType
} from 'types/transactions.types';
import { getUsdValue } from 'utils/operations/getUsdValue';
import { getFeeData } from '../getFeeData';
import { getExtractTransactionsInfo } from './helpers/getExtractTransactionsInfo';
import { getHighlight } from './helpers/getHighlight';
import { getPpuOptions } from './helpers/getPpuOptions';
import { getRecommendedGasPrice } from './helpers/getRecommendedGasPrice';
import { getScCall } from './helpers/getScCall';
import { getTokenType } from './helpers/getTokenType';

export type GetCommonDataPropsType = {
  allTransactions: MultiSignTransactionType[];
  currentScreenIndex: number;
  price?: number;
  network: NetworkType;
  signedIndexes: number[];
  egldLabel: string;
  address: string;
  shard?: number;
  parsedTransactionsByDataField: Record<string, TransactionDataTokenType>;
  gasPriceData: {
    initialGasPrice: number;
    ppu: ISignTransactionsPanelCommonData['ppu'];
  };
};

export async function getCommonData({
  allTransactions,
  currentScreenIndex,
  egldLabel,
  network,
  gasPriceData,
  price,
  address,
  shard,
  signedIndexes = [],
  parsedTransactionsByDataField
}: GetCommonDataPropsType) {
  const currentTransaction = allTransactions[currentScreenIndex];
  const sender = currentTransaction?.transaction?.getSender().toString();
  const transaction = currentTransaction?.transaction;

  let tokenTransaction: {
    identifier?: string;
    amount: string;
    usdValue: string;
  } | null = null;

  let fungibleTransaction:
    | (FungibleTransactionType & {
        type: NftEnumType.NonFungibleESDT | NftEnumType.SemiFungibleESDT;
      })
    | null = null;

  const extractTransactionsInfo = getExtractTransactionsInfo({
    egldLabel,
    sender,
    apiAddress: network.apiAddress,
    address,
    parsedTransactionsByDataField
  });

  const plainTransaction = currentTransaction.transaction.toPlainObject();

  const txInfo = await extractTransactionsInfo(currentTransaction);

  const isEgld = !txInfo?.transactionTokenInfo?.tokenId;
  const { tokenId, nonce, amount = '' } = txInfo?.transactionTokenInfo ?? {};

  const isNftOrSft = tokenId && nonce && nonce.length > 0;
  const tokenIdForTokenDetails = isNftOrSft ? `${tokenId}-${nonce}` : tokenId;

  const tokenDetails = await getPersistedTokenDetails({
    tokenId: tokenIdForTokenDetails
  });

  const { esdtPrice, tokenDecimals, type, identifier, tokenImageUrl } =
    tokenDetails;

  const isNft =
    type === NftEnumType.SemiFungibleESDT ||
    type === NftEnumType.NonFungibleESDT;

  if (isNft) {
    fungibleTransaction = {
      type,
      identifier,
      amount,
      imageURL: tokenImageUrl
    };
  } else {
    const getFormattedAmount = ({ addCommas }: { addCommas: boolean }) =>
      formatAmount({
        input: isEgld
          ? currentTransaction.transaction.getValue().toString()
          : amount,
        decimals: isEgld ? Number(network.decimals) : tokenDecimals,
        digits: Number(network.digits),
        showLastNonZeroDecimal: false,
        addCommas
      });

    const formattedAmount = getFormattedAmount({ addCommas: true });
    const rawAmount = getFormattedAmount({ addCommas: false });
    const tokenPrice = Number(isEgld ? price : esdtPrice);
    const usdValue = getUsdValue({
      amount: rawAmount,
      usd: tokenPrice,
      addEqualSign: true
    });

    const esdtIdentifier =
      identifier === MULTI_TRANSFER_EGLD_TOKEN ? egldLabel : identifier;
    tokenTransaction = {
      identifier: esdtIdentifier ?? egldLabel,
      amount: formattedAmount,
      usdValue
    };
  }

  const { feeLimitFormatted, feeInFiatLimit } = getFeeData({
    transaction,
    price
  });

  const ppuOptions = getPpuOptions({
    shard,
    initialGasPrice: gasPriceData.initialGasPrice,
    transaction: plainTransaction,
    gasStationMetadata: network.gasStationMetadata
  });

  const gasPrice = getRecommendedGasPrice({
    transaction: plainTransaction,
    gasPriceData
  }).toString();

  const commonData: ISignTransactionsPanelCommonData = {
    receiver: plainTransaction.receiver.toString(),
    data: currentTransaction.transaction.getData().toString(),
    gasPrice,
    gasLimit: plainTransaction.gasLimit.toString(),
    ppu: gasPriceData.ppu,
    ppuOptions,
    egldLabel,
    tokenType: getTokenType(type),
    feeLimit: feeLimitFormatted,
    feeInFiatLimit,
    transactionsCount: allTransactions.length,
    currentIndex: currentScreenIndex,
    highlight: getHighlight(txInfo?.transactionTokenInfo),
    scCall: getScCall(txInfo?.transactionTokenInfo),
    needsSigning:
      txInfo?.needsSigning && !signedIndexes.includes(currentScreenIndex),
    isEditable: txInfo?.needsSigning
  };

  return { commonData, tokenTransaction, fungibleTransaction };
}
