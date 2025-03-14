import BigNumber from 'bignumber.js';
import { getPersistedTokenDetails } from 'apiCalls/tokens/getPersistedTokenDetails';
import { MULTI_TRANSFER_EGLD_TOKEN } from 'constants/mvx.constants';
import {
  FungibleTransactionType,
  ISignTransactionsModalCommonData
} from 'core/managers/internal/SignTransactionsStateManager/types';
import { formatAmount } from 'lib/sdkDappUtils';
import { NetworkType } from 'types/network.types';
import { NftEnumType } from 'types/tokens.types';
import {
  MultiSignTransactionType,
  TransactionDataTokenType
} from 'types/transactions.types';
import { getExtractTransactionsInfo } from './getExtractTransactionsInfo';
import { getFeeData } from './getFeeData';
import { getHighlight } from './getHighlight';
import { getScCall } from './getScCall';
import { getTokenType } from './getTokenType';
import { getUsdValue } from './getUsdValue';

const DEFAULT_GAS_PRICE_MULTIPLIER = 1;

export async function getCommonData({
  allTransactions,
  currentScreenIndex,
  egldLabel,
  network,
  gasPriceData,
  price,
  address,
  signedIndexes = [],
  parsedTransactionsByDataField
}: {
  allTransactions: MultiSignTransactionType[];
  currentScreenIndex: number;
  price?: number;
  network: NetworkType;
  signedIndexes: number[];
  egldLabel: string;
  address: string;
  parsedTransactionsByDataField: Record<string, TransactionDataTokenType>;
  gasPriceData: {
    initialGasPrice: number;
    gasPriceMultiplier: ISignTransactionsModalCommonData['gasPriceMultiplier'];
  };
}) {
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

  const getGasPrice = (currentNonce: number) => {
    if (!gasPriceData) {
      throw new Error('Gas price not found for nonce: ' + currentNonce);
    }

    const { initialGasPrice, gasPriceMultiplier } = gasPriceData;

    const newGasPrice = new BigNumber(initialGasPrice)
      .times(gasPriceMultiplier ?? DEFAULT_GAS_PRICE_MULTIPLIER)
      .toNumber();

    return newGasPrice;
  };

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

  const currentNonce = currentTransaction.transaction?.getNonce().valueOf();

  const commonData: ISignTransactionsModalCommonData = {
    receiver: plainTransaction.receiver.toString(),
    data: currentTransaction.transaction.getData().toString(),
    gasPrice: getGasPrice(currentNonce).toString(),
    gasLimit: plainTransaction.gasLimit.toString(),
    gasPriceMultiplier:
      gasPriceData.gasPriceMultiplier ?? DEFAULT_GAS_PRICE_MULTIPLIER,
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
