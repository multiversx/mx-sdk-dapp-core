import { Transaction } from '@multiversx/sdk-core/out';
import BigNumber from 'bignumber.js';
import { getEconomics } from 'apiCalls/economics/getEconomics';
import { getPersistedTokenDetails } from 'apiCalls/tokens/getPersistedTokenDetails';
import { MULTI_TRANSFER_EGLD_TOKEN } from 'constants/mvx.constants';
import { UITagsEnum } from 'constants/UITags.enum';
import { SignTransactionsStateManager } from 'core/managers/internal/SignTransactionsStateManager/SignTransactionsStateManager';
import {
  ISignTransactionsModalCommonData,
  SignEventsEnum
} from 'core/managers/internal/SignTransactionsStateManager/types';
import { getAddress } from 'core/methods/account/getAddress';
import { getEgldLabel } from 'core/methods/network/getEgldLabel';
import { cancelCrossWindowAction } from 'core/providers/helpers/cancelCrossWindowAction';
import { IProvider } from 'core/providers/types/providerFactory.types';
import { SignTransactionsModal } from 'lib/sdkDappCoreUi';
import { formatAmount } from 'lib/sdkDappUtils';
import { networkSelector } from 'store/selectors/networkSelectors';
import { getState } from 'store/store';
import { NftEnumType } from 'types/tokens.types';
import { createUIElement } from 'utils/createUIElement';
import { getExtractTransactionsInfo } from './helpers/getExtractTransactionsInfo';
import { getFeeData } from './helpers/getFeeData';
import { getHighlight } from './helpers/getHighlight';
import { getMultiEsdtTransferData } from './helpers/getMultiEsdtTransferData/getMultiEsdtTransferData';
import { getScCall } from './helpers/getScCall';
import { getTokenType } from './helpers/getTokenType';
import { getUsdValue } from './helpers/getUsdValue';
import { guardTransactions as getGuardedTransactions } from './helpers/guardTransactions/guardTransactions';

type SignTransactionsParamsType = {
  transactions?: Transaction[];
  handleSign: IProvider['signTransactions'];
  guardTransactions?: typeof getGuardedTransactions;
};

const DEFAULT_GAS_PRICE_MULTIPLIER = 1;

export async function signTransactions({
  transactions = [],
  handleSign,
  guardTransactions = getGuardedTransactions
}: SignTransactionsParamsType): Promise<Transaction[]> {
  const address = getAddress();
  const network = networkSelector(getState());

  const egldLabel = getEgldLabel();
  const signModalElement = await createUIElement<SignTransactionsModal>({
    name: UITagsEnum.SIGN_TRANSACTIONS_MODAL
  });

  const { allTransactions, getTxInfoByDataField } =
    getMultiEsdtTransferData(transactions);

  let signedIndexes: number[] = [];

  const eventBus = await signModalElement.getEventBus();

  if (!eventBus) {
    throw new Error('Event bus not provided for Ledger provider');
  }

  const manager = new SignTransactionsStateManager(eventBus);
  if (!manager) {
    throw new Error('Unable to establish connection with sign screens');
  }

  const getGasPrice = (currentNonce: number) => {
    const currentValues = manager.gasPriceMap[currentNonce];

    if (!currentValues) {
      throw new Error('Gas price not found for nonce: ' + currentNonce);
    }

    const { initialGasPrice, gasPriceMultiplier } = currentValues;

    const newGasPrice = new BigNumber(initialGasPrice)
      .times(gasPriceMultiplier ?? DEFAULT_GAS_PRICE_MULTIPLIER)
      .toNumber();

    return newGasPrice;
  };

  return new Promise<Transaction[]>(async (resolve, reject) => {
    const signedTransactions: Transaction[] = [];
    const economics = await getEconomics();

    allTransactions
      .filter((tx) => tx.transaction != null)
      .forEach(({ transaction }) => {
        const initialGasPrice = transaction
          ? transaction?.getGasPrice().valueOf()
          : 0;
        const gasPriceMultiplier = DEFAULT_GAS_PRICE_MULTIPLIER;

        manager.updateGasPriceMap({
          nonce: transaction?.getNonce().valueOf(),
          gasPriceMultiplier,
          initialGasPrice
        });
      });

    const showNextScreen = async (currentScreenIndex: number) => {
      const currentTransaction = allTransactions[currentScreenIndex];
      const sender = currentTransaction?.transaction?.getSender().toString();
      const transaction = currentTransaction?.transaction;
      const price = economics?.price;

      const extractTransactionsInfo = getExtractTransactionsInfo({
        getTxInfoByDataField,
        egldLabel,
        sender,
        address
      });

      const plainTransaction = currentTransaction.transaction.toPlainObject();

      const txInfo = await extractTransactionsInfo(currentTransaction);

      const isEgld = !txInfo?.transactionTokenInfo?.tokenId;
      const {
        tokenId,
        nonce,
        amount = ''
      } = txInfo?.transactionTokenInfo ?? {};

      const isNftOrSft = tokenId && nonce && nonce.length > 0;
      const tokenIdForTokenDetails = isNftOrSft
        ? `${tokenId}-${nonce}`
        : tokenId;

      const tokenDetails = await getPersistedTokenDetails({
        tokenId: tokenIdForTokenDetails
      });

      const { esdtPrice, tokenDecimals, type, identifier, tokenImageUrl } =
        tokenDetails;

      const isNft =
        type === NftEnumType.SemiFungibleESDT ||
        type === NftEnumType.NonFungibleESDT;

      if (isNft) {
        manager.updateNonFungibleTransaction(type, {
          identifier,
          amount,
          imageURL: tokenImageUrl
        });
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
        manager.updateTokenTransaction({
          identifier: esdtIdentifier ?? egldLabel,
          amount: formattedAmount,
          usdValue
        });
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
          manager.gasPriceMap[currentNonce].gasPriceMultiplier ??
          DEFAULT_GAS_PRICE_MULTIPLIER,
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

      manager.updateCommonData(commonData);

      const onBack = () => {
        removeEvents();
        showNextScreen(currentScreenIndex - 1);
      };

      const onSetGasPriceMultiplier = (
        gasPriceMultiplier: ISignTransactionsModalCommonData['gasPriceMultiplier'] = DEFAULT_GAS_PRICE_MULTIPLIER
      ) => {
        manager.updateGasPriceMap({
          nonce: currentNonce,
          gasPriceMultiplier
        });

        const newGasPrice = getGasPrice(currentNonce);

        const newTransaction = Transaction.fromPlainObject({
          ...transaction.toPlainObject(),
          gasPrice: newGasPrice
        });

        const feeData = getFeeData({
          transaction: newTransaction,
          price
        });

        manager.updateCommonData({
          feeLimit: feeData.feeLimitFormatted,
          feeInFiatLimit: feeData.feeInFiatLimit,
          gasPrice: newGasPrice.toString(),
          gasPriceMultiplier
        });

        manager.updateCommonData({ gasPriceMultiplier });
      };

      const onCancel = async () => {
        reject(new Error('Transaction signing cancelled by user'));
        await cancelCrossWindowAction();
        signModalElement.remove();
      };

      function removeEvents() {
        eventBus.unsubscribe(SignEventsEnum.CONFIRM, onSign);
        eventBus.unsubscribe(SignEventsEnum.CLOSE, onCancel);
        eventBus.unsubscribe(SignEventsEnum.BACK, onBack);
        eventBus.unsubscribe(
          SignEventsEnum.SET_GAS_PRICE_MULTIPLIER,
          onSetGasPriceMultiplier
        );
      }

      async function onSign() {
        const shouldContinueWithoutSigning = !txInfo?.needsSigning;

        removeEvents();

        if (shouldContinueWithoutSigning) {
          return showNextScreen(currentScreenIndex + 1);
        }

        const currentEditedTransaction = currentTransaction.transaction;

        const txNonce = currentEditedTransaction.getNonce().valueOf();

        if (!currentNonce) {
          throw new Error('Current nonce not found');
        }

        const { initialGasPrice, gasPriceMultiplier } =
          manager.gasPriceMap[txNonce];

        const newGasPrice = new BigNumber(initialGasPrice)
          .times(gasPriceMultiplier ?? DEFAULT_GAS_PRICE_MULTIPLIER)
          .toNumber();

        const transactionToSign = Transaction.fromPlainObject({
          ...currentEditedTransaction.toPlainObject(),
          gasPrice: newGasPrice
        });

        try {
          const signedTransaction = await handleSign([transactionToSign]);

          if (signedTransaction) {
            signedIndexes.push(currentScreenIndex);
            signedTransactions.push(signedTransaction[0]);
          }

          const areAllSigned =
            currentScreenIndex === allTransactions.length &&
            signedTransactions.length == transactions.length;

          if (areAllSigned) {
            const optionallyGuardedTransactions =
              await guardTransactions(signedTransactions);
            signModalElement.remove();

            return resolve(optionallyGuardedTransactions);
          }

          showNextScreen(currentScreenIndex + 1);
        } catch (error) {
          reject('Error signing transactions: ' + error);
          signModalElement.remove();
        }
      }

      eventBus.subscribe(SignEventsEnum.CONFIRM, onSign);
      eventBus.subscribe(SignEventsEnum.CLOSE, onCancel);
      eventBus.subscribe(SignEventsEnum.BACK, onBack);
      eventBus.subscribe(
        SignEventsEnum.SET_GAS_PRICE_MULTIPLIER,
        onSetGasPriceMultiplier
      );
    };

    showNextScreen(0);
  });
}
