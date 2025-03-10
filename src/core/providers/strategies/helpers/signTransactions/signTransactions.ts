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

  const eventBus = await signModalElement.getEventBus();

  if (!eventBus) {
    throw new Error('Event bus not provided for Ledger provider');
  }

  const manager = new SignTransactionsStateManager(eventBus);
  if (!manager) {
    throw new Error('Unable to establish connection with sign screens');
  }

  return new Promise<Transaction[]>(async (resolve, reject) => {
    const signedTransactions: Transaction[] = [];
    let currentTransactionIndex = 0;
    const economics = await getEconomics();

    const gasPriceMap: typeof manager.gasPriceMap = allTransactions.map(
      (transaction) => ({
        initialGasPrice: transaction.transaction.getGasPrice().valueOf(),
        gasPriceMultiplier: 1
      })
    );

    manager.updateGasPriceMap(gasPriceMap);

    const signNextTransaction = async () => {
      const currentTransaction = allTransactions[currentTransactionIndex];
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

      const commonData: ISignTransactionsModalCommonData = {
        receiver: plainTransaction.receiver.toString(),
        data: currentTransaction.transaction.getData().toString(),
        gasPrice: plainTransaction.gasPrice.toString(),
        gasLimit: plainTransaction.gasLimit.toString(),
        gasPriceMultiplier: 1,
        egldLabel,
        tokenType: getTokenType(type),
        feeLimit: feeLimitFormatted,
        feeInFiatLimit,
        transactionsCount: allTransactions.length,
        currentTransactionIndex: currentTransactionIndex,
        highlight: getHighlight(txInfo?.transactionTokenInfo),
        scCall: getScCall(txInfo?.transactionTokenInfo)
      };

      manager.updateCommonData(commonData);
      manager.updateConfirmedTransactions();

      const onPreviousTransaction = () => {
        const data = manager.confirmedScreens[manager.currentScreenIndex - 1];
        manager.updateData(data);
      };

      const onNextTransaction = () => {
        const data = manager.confirmedScreens[manager.currentScreenIndex + 1];
        manager.updateData(data);
      };

      const onSetGasPriceMultiplier = (gasPriceMultiplier: 1 | 2 | 3) => {
        const newGasPriceMap = [...manager.gasPriceMap];
        newGasPriceMap[currentTransactionIndex] = {
          ...newGasPriceMap[currentTransactionIndex],
          gasPriceMultiplier
        };
        const initialGasPrice =
          manager.gasPriceMap[currentTransactionIndex].initialGasPrice;

        const newGasPrice = new BigNumber(initialGasPrice)
          .times(gasPriceMultiplier)
          .toNumber();

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

        manager.updateGasPriceMap(newGasPriceMap);

        manager.updateConfirmedTransactions();
      };

      const onCancel = async () => {
        reject(new Error('Transaction signing cancelled by user'));
        await cancelCrossWindowAction();
        signModalElement.remove();
      };

      const onSign = async () => {
        const shouldContinueWithoutSigning = Boolean(
          txInfo?.transactionTokenInfo?.type &&
            txInfo?.transactionTokenInfo?.multiTxData &&
            !txInfo?.dataField.endsWith(
              txInfo?.transactionTokenInfo?.multiTxData
            )
        );

        const removeEvents = () => {
          eventBus.unsubscribe(SignEventsEnum.SIGN_TRANSACTION, onSign);
          eventBus.unsubscribe(SignEventsEnum.CLOSE, onCancel);
          eventBus.unsubscribe(
            SignEventsEnum.PREV_TRANSACTION,
            onPreviousTransaction
          );
          eventBus.unsubscribe(
            SignEventsEnum.NEXT_TRANSACTION,
            onNextTransaction
          );
          eventBus.unsubscribe(
            SignEventsEnum.SET_GAS_PRICE_MULTIPLIER,
            onSetGasPriceMultiplier
          );
        };

        if (shouldContinueWithoutSigning) {
          currentTransactionIndex++;
          removeEvents();
          manager.setNextUnsignedTxIndex(currentTransactionIndex);
          return signNextTransaction();
        }

        const { initialGasPrice, gasPriceMultiplier } =
          manager.gasPriceMap[currentTransactionIndex];

        const currentEditedTransaction = currentTransaction.transaction;

        const newGasPrice = new BigNumber(initialGasPrice)
          .times(gasPriceMultiplier ?? 1)
          .toNumber();

        const transactionToSign = Transaction.fromPlainObject({
          ...currentEditedTransaction.toPlainObject(),
          gasPrice: newGasPrice
        });

        try {
          const signedTransaction = await handleSign([transactionToSign]);

          if (signedTransaction) {
            signedTransactions.push(signedTransaction[0]);
          }

          removeEvents();

          const areAllSigned = signedTransactions.length == transactions.length;

          if (areAllSigned) {
            const optionallyGuardedTransactions =
              await guardTransactions(signedTransactions);
            signModalElement.remove();

            return resolve(optionallyGuardedTransactions);
          }

          currentTransactionIndex++;
          manager.setNextUnsignedTxIndex(currentTransactionIndex);
          signNextTransaction();
        } catch (error) {
          reject('Error signing transactions: ' + error);
          signModalElement.remove();
        }
      };

      eventBus.subscribe(SignEventsEnum.SIGN_TRANSACTION, onSign);
      eventBus.subscribe(SignEventsEnum.CLOSE, onCancel);
      eventBus.subscribe(
        SignEventsEnum.PREV_TRANSACTION,
        onPreviousTransaction
      );
      eventBus.subscribe(SignEventsEnum.NEXT_TRANSACTION, onNextTransaction);
      eventBus.subscribe(
        SignEventsEnum.SET_GAS_PRICE_MULTIPLIER,
        onSetGasPriceMultiplier
      );
    };

    signNextTransaction();
  });
}
