import { Transaction } from '@multiversx/sdk-core/out';
import BigNumber from 'bignumber.js';
import { getEconomics } from 'apiCalls/economics/getEconomics';
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
import { networkSelector } from 'store/selectors/networkSelectors';
import { getState } from 'store/store';
import { createUIElement } from 'utils/createUIElement';
import { getCommonData } from './helpers/getCommonData';
import { getFeeData } from './helpers/getFeeData';
import { getMultiEsdtTransferData } from './helpers/getMultiEsdtTransferData/getMultiEsdtTransferData';
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

  const { allTransactions, parsedTransactionsByDataField } =
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

    manager.initializeGasPriceMap(allTransactions.map((tx) => tx.transaction));

    const showNextScreen = async (currentScreenIndex: number) => {
      const currentTransaction = allTransactions[currentScreenIndex];
      const transaction = currentTransaction?.transaction;
      const price = economics?.price;
      const currentNonce = currentTransaction.transaction?.getNonce().valueOf();

      const { commonData, tokenTransaction, fungibleTransaction } =
        await getCommonData({
          allTransactions,
          currentScreenIndex,
          egldLabel,
          network,
          gasPriceData: manager.gasPriceMap[currentNonce],
          price,
          address,
          signedIndexes,
          parsedTransactionsByDataField
        });

      if (tokenTransaction) {
        manager.updateTokenTransaction(tokenTransaction);
      }

      if (fungibleTransaction) {
        manager.updateNonFungibleTransaction(
          fungibleTransaction.type,
          fungibleTransaction
        );
      }

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
        const shouldContinueWithoutSigning = !commonData.needsSigning;

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
