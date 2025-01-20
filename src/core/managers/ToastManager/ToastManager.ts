import { TransactionToastList } from 'lib/sdkDappCoreUi';
import { removeTransactionToast } from 'store/actions/toasts/toastsActions';
import { isServerTransactionPending } from 'store/actions/trackedTransactions/transactionStateByStatus';
import { ToastsSliceState } from 'store/slices/toast/toastSlice.types';
import { getStore } from 'store/store';
import {
  ProviderErrorsEnum,
  TransactionBatchStatusesEnum,
  TransactionServerStatusesEnum
} from 'types';
import { SignedTransactionType } from 'types/transactions.types';
import { createUIElement } from 'utils/createUIElement';
import {
  GetToastsOptionsDataPropsType,
  ITransactionToast,
  TransactionsDefaultTitles,
  TransactionToastEventsEnum,
  IToastDataState
} from './types';

export class ToastManager {
  private transactionToastsList: TransactionToastList | undefined;
  private unsubscribe: () => void = () => null;
  store = getStore();

  constructor() {}

  public init() {
    const { toasts, trackedTransactions } = this.store.getState();
    this.onToastListChange(toasts);

    let previousToasts = toasts;
    let previousTrackedTransactions = trackedTransactions;
    this.unsubscribe = this.store.subscribe(() => {
      const { toasts, trackedTransactions } = this.store.getState();
      const currentToasts = toasts;

      const currentTrackedTransactions = trackedTransactions;

      if (
        previousToasts !== currentToasts ||
        previousTrackedTransactions !== currentTrackedTransactions
      ) {
        previousToasts = currentToasts;
        previousTrackedTransactions = currentTrackedTransactions;
        this.onToastListChange(currentToasts);
      }
    });
  }

  private async onToastListChange(toastList: ToastsSliceState) {
    const { trackedTransactions, account } = this.store.getState();
    const transactionToasts: ITransactionToast[] = [];

    toastList.transactionToasts.forEach(async (toast) => {
      const sessionTransactions = trackedTransactions[toast.toastId];
      if (!sessionTransactions) {
        return;
      }

      const transaction: ITransactionToast = {
        toastDataState: this.getToastDataStateByStatus({
          address: account.address,
          sender: sessionTransactions.transactions[0].sender,
          toastId: toast.toastId,
          status: sessionTransactions.status
        }),
        processedTransactionsStatus: this.getToastProceededStatus(
          sessionTransactions.transactions
        ),
        toastId: toast.toastId,
        transactions: sessionTransactions.transactions.map((transaction) => ({
          hash: transaction.hash,
          status: transaction.status
        }))
      };

      transactionToasts.push(transaction);
    });
    await this.renderUIToasts(transactionToasts);
  }

  private async renderUIToasts(transactionsToasts: ITransactionToast[]) {
    if (!this.transactionToastsList) {
      this.transactionToastsList = await createUIElement<TransactionToastList>(
        'transaction-toast-list'
      );
    }

    const eventBus = await this.transactionToastsList.getEventBus();

    if (!eventBus) {
      throw new Error(ProviderErrorsEnum.eventBusError);
    }

    eventBus.publish(
      TransactionToastEventsEnum.TRANSACTION_TOAST_DATA_UPDATE,
      transactionsToasts
    );
    eventBus.subscribe(
      TransactionToastEventsEnum.CLOSE_TOAST,
      (toastId: string) => {
        removeTransactionToast(toastId);
      }
    );
    return this.transactionToastsList;
  }

  private getToastDataStateByStatus = ({
    address,
    sender,
    status,
    toastId
  }: GetToastsOptionsDataPropsType) => {
    const successToastData: IToastDataState = {
      id: toastId,
      icon: 'check',
      hasCloseButton: true,
      title: TransactionsDefaultTitles.success,
      iconClassName: 'success'
    };

    const receivedToastData: IToastDataState = {
      id: toastId,
      icon: 'check',
      hasCloseButton: true,
      title: TransactionsDefaultTitles.received,
      iconClassName: 'success'
    };

    const pendingToastData: IToastDataState = {
      id: toastId,
      icon: 'hourglass',
      hasCloseButton: false,
      title: TransactionsDefaultTitles.pending,
      iconClassName: 'warning'
    };

    const failToastData: IToastDataState = {
      id: toastId,
      icon: 'times',
      title: TransactionsDefaultTitles.failed,
      hasCloseButton: true,
      iconClassName: 'danger'
    };

    const invalidToastData: IToastDataState = {
      id: toastId,
      icon: 'ban',
      title: TransactionsDefaultTitles.invalid,
      hasCloseButton: true,
      iconClassName: 'warning'
    };

    const timedOutToastData = {
      id: toastId,
      icon: 'times',
      title: TransactionsDefaultTitles.timedOut,
      hasCloseButton: true,
      iconClassName: 'warning'
    };

    switch (status) {
      case TransactionBatchStatusesEnum.signed:
      case TransactionBatchStatusesEnum.sent:
        return pendingToastData;
      case TransactionBatchStatusesEnum.success:
        return sender !== address ? receivedToastData : successToastData;
      case TransactionBatchStatusesEnum.cancelled:
      case TransactionBatchStatusesEnum.fail:
        return failToastData;
      case TransactionBatchStatusesEnum.timedOut:
        return timedOutToastData;
      case TransactionBatchStatusesEnum.invalid:
        return invalidToastData;
      default:
        return pendingToastData;
    }
  };

  private getToastProceededStatus = (transactions: SignedTransactionType[]) => {
    const processedTransactions = transactions.filter(
      (tx) =>
        !isServerTransactionPending(tx.status as TransactionServerStatusesEnum)
    ).length;

    const totalTransactions = transactions.length;

    if (totalTransactions === 1 && processedTransactions === 1) {
      return isServerTransactionPending(
        transactions[0].status as TransactionServerStatusesEnum
      )
        ? 'Processing transaction'
        : 'Transaction processed';
    }

    return `${processedTransactions} / ${totalTransactions} transactions processed`;
  };

  public destroy() {
    this.unsubscribe();
  }
}
