import { TransactionBatchStatusesEnum } from 'types';
import {
  GetToastsOptionsDataPropsType,
  IToastDataState,
  TransactionsDefaultTitles
} from '../types';

export const getToastDataStateByStatus = ({
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
