import {
  NotificationTypesEnum,
  SendTransactionReturnType,
  SignTransactionsParamsType
} from 'types';
import { isGuardianTx } from 'utils/transactions/validation/isGuardianTx';
import { chainIdSelector } from '../../../store/selectors';
import { getState } from '../../../store/store';

export async function signTransactions({
  transactions,
  callbackRoute,
  customTransactionInformation,
  transactionsDisplayInfo
}: SignTransactionsParamsType): Promise<SendTransactionReturnType> {
  const appState = getState();
  const sessionId = Date.now().toString();
  const storeChainId = chainIdSelector(appState);

  const transactionsPayload = Array.isArray(transactions)
    ? transactions
    : [transactions];

  const hasValidChainId = transactionsPayload?.every(
    (tx) => tx.getChainID().valueOf() === storeChainId.valueOf()
  );
  if (!hasValidChainId) {
    const notificationPayload = {
      type: NotificationTypesEnum.warning,
      iconClassName: 'text-warning',
      title: 'Network change detected',
      description: 'The application tried to change the transaction network'
    };
    store.dispatch(setNotificationModal(notificationPayload));
    return { error: 'Invalid ChainID', sessionId: null };
  }

  const signTransactionsPayload = {
    sessionId,
    callbackRoute,
    customTransactionInformation: {
      ...(customTransactionInformation ?? {}),
      signWithoutSending:
        customTransactionInformation?.signWithoutSending ?? true
    },
    transactions: transactionsPayload.map((tx) => {
      const transaction = tx.toPlainObject();

      // TODO: Remove when the protocol supports usernames for guardian transactions
      if (isGuardianTx({ data: transaction.data, onlySetGuardian: true })) {
        return transaction;
      }

      return {
        ...transaction,
        senderUsername: tx.getSenderUsername().valueOf(),
        receiverUsername: tx.getReceiverUsername().valueOf()
      };
    })
  };
  store.dispatch(setSignTransactionsCancelMessage(null));
  store.dispatch(setTransactionsToSign(signTransactionsPayload));
  store.dispatch(
    setTransactionsDisplayInfo({ sessionId, transactionsDisplayInfo })
  );
  return { sessionId };
}
