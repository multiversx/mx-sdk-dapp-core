import { getEconomics } from 'apiCalls/economics/getEconomics';
import { EMPTY_PPU } from 'constants/placeholders.constants';
import { SignTransactionsStateManager } from 'core/managers/internal/SignTransactionsStateManager/SignTransactionsStateManager';
import {
  ISignTransactionsPanelCommonData,
  SignEventsEnum
} from 'core/managers/internal/SignTransactionsStateManager/types';
import { getAccountInfo } from 'core/methods/account/getAccountInfo';
import { getEgldLabel } from 'core/methods/network/getEgldLabel';
import { cancelCrossWindowAction } from 'core/providers/helpers/cancelCrossWindowAction';
import { IProvider } from 'core/providers/types/providerFactory.types';
import { Transaction } from 'lib/sdkCore';
import { networkSelector } from 'store/selectors/networkSelectors';
import { getState } from 'store/store';
import { ProviderErrorsEnum } from 'types/provider.types';
import { getCommonData } from './helpers/getCommonData/getCommonData';
import { getRecommendedGasPrice } from './helpers/getCommonData/helpers/getRecommendedGasPrice';
import { getFeeData } from './helpers/getFeeData';
import { getMultiEsdtTransferData } from './helpers/getMultiEsdtTransferData/getMultiEsdtTransferData';
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
  const {
    account: { address, shard, username }
  } = getAccountInfo();
  const network = networkSelector(getState());

  const egldLabel = getEgldLabel();

  const { allTransactions, parsedTransactionsByDataField } =
    getMultiEsdtTransferData(transactions);

  let signedIndexes: number[] = [];

  const manager = SignTransactionsStateManager.getInstance();

  if (!manager) {
    throw new Error('Unable to establish connection with sign screens');
  }

  const eventBus = await manager.getEventBus();

  if (!eventBus) {
    throw new Error(ProviderErrorsEnum.eventBusError);
  }

  const handleCancel = async () => {
    await cancelCrossWindowAction();
    manager.closeAndReset();
  };

  eventBus.subscribe(
    SignEventsEnum.CLOSE_SIGN_TRANSACTIONS_PANEL,
    handleCancel
  );

  return new Promise<Transaction[]>(async (resolve, reject) => {
    const signedTransactions: Transaction[] = [];
    const economics = await getEconomics({ baseURL: network.apiAddress });
    await manager.openSignTransactions();
    manager.initializeGasPriceMap(allTransactions.map((tx) => tx.transaction));
    const price = economics?.price;

    let currentScreenIndex = 0;

    const updateScreen = async () => {
      const currentTransaction = allTransactions[currentScreenIndex];
      const transaction = currentTransaction?.transaction;

      const currentNonce = Number(transaction.nonce);

      manager.updateIsLoading(true);
      const { commonData, tokenTransaction, fungibleTransaction } =
        await getCommonData({
          allTransactions,
          currentScreenIndex,
          egldLabel,
          network,
          gasPriceData: manager.ppuMap[currentNonce],
          price,
          address,
          username,
          shard,
          signedIndexes,
          parsedTransactionsByDataField
        });

      manager.updateIsLoading(false);

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
    };

    const onBack = () => {
      if (currentScreenIndex > 0) {
        currentScreenIndex--;
        updateScreen();
      }
    };

    const onSetPpu = (
      ppu: ISignTransactionsPanelCommonData['ppu'] = EMPTY_PPU
    ) => {
      const currentTransaction = allTransactions[currentScreenIndex];
      const transaction = currentTransaction.transaction;
      const currentNonce = Number(transaction.nonce);

      manager.updateGasPriceMap({
        nonce: currentNonce,
        ppu
      });

      const plainTransaction = transaction.toPlainObject();
      const newGasPrice = getRecommendedGasPrice({
        transaction: plainTransaction,
        gasPriceData: manager.ppuMap[currentNonce]
      });

      const newTransaction = Transaction.newFromPlainObject({
        ...plainTransaction,
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
        ppu
      });
    };

    const onCancel = async () => {
      reject(new Error('Transaction signing cancelled by user'));
      await cancelCrossWindowAction();
      unsubscribeEvents();
      manager.closeAndReset();
    };

    const onNext = () => {
      if (currentScreenIndex < manager.transactionsCount - 1) {
        currentScreenIndex++;
        updateScreen();
      }
    };

    const onSign = async () => {
      const currentTransaction = allTransactions[currentScreenIndex];
      const transaction = currentTransaction.transaction;
      const currentNonce = Number(transaction.nonce);

      const { commonData } = await getCommonData({
        allTransactions,
        currentScreenIndex,
        egldLabel,
        network,
        gasPriceData: manager.ppuMap[currentNonce],
        price,
        address,
        username,
        shard,
        signedIndexes,
        parsedTransactionsByDataField
      });

      if (!commonData.needsSigning) {
        signedIndexes.push(currentScreenIndex);
        return onNext();
      }

      const plainTransaction = transaction.toPlainObject();
      const txNonce = plainTransaction.nonce;

      const newGasPrice = getRecommendedGasPrice({
        transaction: plainTransaction,
        gasPriceData: manager.ppuMap[txNonce]
      });

      const transactionToSign = Transaction.newFromPlainObject({
        ...plainTransaction,
        gasPrice: newGasPrice
      });

      try {
        const signedTxs = await handleSign([transactionToSign]);
        if (signedTxs) {
          signedIndexes.push(currentScreenIndex);
          signedTransactions.push(signedTxs[0]);
        }

        const isLastScreen = currentScreenIndex === allTransactions.length - 1;
        const allTransactionsWithSign = allTransactions.filter(
          (tx) => tx.needsSigning
        );

        const areAllTransactionsSigned =
          signedTransactions.length === allTransactionsWithSign.length;

        if (isLastScreen && areAllTransactionsSigned) {
          const optionallyGuardedTransactions =
            await guardTransactions(signedTransactions);
          unsubscribeEvents();
          manager.closeAndReset();
          return resolve(optionallyGuardedTransactions);
        }

        onNext();
      } catch (error) {
        unsubscribeEvents();
        manager.closeAndReset();
        reject(error);
      }
    };

    function subscribeEvents() {
      if (!eventBus) {
        return;
      }

      eventBus.subscribe(SignEventsEnum.NEXT, onNext);
      eventBus.subscribe(SignEventsEnum.CONFIRM, onSign);
      eventBus.subscribe(
        SignEventsEnum.CLOSE_SIGN_TRANSACTIONS_PANEL,
        onCancel
      );
      eventBus.subscribe(SignEventsEnum.BACK, onBack);
      eventBus.subscribe(SignEventsEnum.SET_PPU, onSetPpu);
    }

    function unsubscribeEvents() {
      if (!eventBus) {
        return;
      }

      eventBus.unsubscribe(SignEventsEnum.NEXT, onNext);
      eventBus.unsubscribe(SignEventsEnum.CONFIRM, onSign);
      eventBus.unsubscribe(
        SignEventsEnum.CLOSE_SIGN_TRANSACTIONS_PANEL,
        onCancel
      );
      eventBus.unsubscribe(SignEventsEnum.BACK, onBack);
      eventBus.unsubscribe(SignEventsEnum.SET_PPU, onSetPpu);
    }

    subscribeEvents();
    await updateScreen();
  });
}
