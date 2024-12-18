import { Transaction } from '@multiversx/sdk-core/out';
import { getAccountFromApi } from 'apiCalls/account';
import { getScamAddressData } from 'apiCalls/utils/getScamAddressData';
import { SENDER_DIFFERENT_THAN_LOGGED_IN_ADDRESS } from 'constants/errorMessages.constants';
import { SignTransactionsStateManager } from 'core/managers/SignTransactionsStateManager/SignTransactionsStateManager';
import { SignEventsEnum } from 'core/managers/SignTransactionsStateManager/types';
import { getAddress } from 'core/methods/account/getAddress';
import { getEgldLabel } from 'core/methods/network/getEgldLabel';
import { IProvider } from 'core/providers/types/providerFactory.types';
import { SignTransactionsModal } from 'lib/sdkDappCoreUi';
import { MultiSignTransactionType } from 'types/transactions.types';
import { createModalElement } from 'utils/createModalElement';
import { checkIsValidSender } from './helpers/checkIsValidSender';
import { getMultiEsdtTransferData } from './helpers/getMultiEsdtTransferData/getMultiEsdtTransferData';
import { isTokenTransfer } from './helpers/isTokenTransfer';

interface VerifiedAddressesType {
  [address: string]: { type: string; info: string };
}
let verifiedAddresses: VerifiedAddressesType = {};

export async function signTransactions({
  transactions = [],
  handleSign
}: {
  transactions?: Transaction[];
  handleSign: IProvider['signTransactions'];
}) {
  const address = getAddress();
  const egldLabel = getEgldLabel();
  const { modalElement: signModalElement, eventBus } =
    await createModalElement<SignTransactionsModal>({
      name: 'sign-transactions-modal',
      withEventBus: true
    });

  const { allTransactions, getTxInfoByDataField } =
    getMultiEsdtTransferData(transactions);

  if (!eventBus) {
    throw new Error('Event bus not provided for Ledger provider');
  }

  const manager = SignTransactionsStateManager.getInstance(eventBus);
  if (!manager) {
    throw new Error('Unable to establish connection with sign screens');
  }

  return new Promise<Transaction[]>(async (resolve, reject) => {
    const signedTransactions: Transaction[] = [];
    let currentTransactionIndex = 0;

    const signNextTransaction = async () => {
      const currentTransaction = allTransactions[currentTransactionIndex];
      const sender = currentTransaction?.transaction?.getSender().toString();

      const senderAccount =
        !sender || sender === address ? null : await getAccountFromApi(sender);

      const extractTransactionsInfo = async (
        currentTx: MultiSignTransactionType
      ) => {
        if (currentTx == null) {
          return;
        }

        const { transaction, multiTxData, transactionIndex } = currentTx;
        const dataField = transaction.getData().toString();
        const transactionTokenInfo = getTxInfoByDataField(
          transaction.getData().toString(),
          multiTxData
        );

        const { tokenId } = transactionTokenInfo;
        const receiver = transaction.getReceiver().toString();

        if (sender && sender !== address) {
          const isValidSender = checkIsValidSender(senderAccount, address);

          if (!isValidSender) {
            console.error(SENDER_DIFFERENT_THAN_LOGGED_IN_ADDRESS);
            return reject(SENDER_DIFFERENT_THAN_LOGGED_IN_ADDRESS);
          }
        }

        const notSender = address !== receiver;
        const verified = receiver in verifiedAddresses;

        if (receiver && notSender && !verified) {
          const data = await getScamAddressData(receiver);
          verifiedAddresses = {
            ...verifiedAddresses,
            ...(data?.scamInfo ? { [receiver]: data.scamInfo } : {})
          };
        }

        const isTokenTransaction = Boolean(
          tokenId && isTokenTransfer({ tokenId, erdLabel: egldLabel })
        );

        return {
          transaction,
          receiverScamInfo: verifiedAddresses[receiver]?.info || null,
          transactionTokenInfo,
          isTokenTransaction,
          dataField,
          transactionIndex
        };
      };

      manager.updateTransaction({
        transaction: currentTransaction.transaction.toPlainObject(),
        total: allTransactions.length,
        currentIndex: currentTransactionIndex
      });

      const onCancel = () => {
        reject(new Error('Transaction signing cancelled by user'));
        signModalElement.remove();
      };

      const onSign = async () => {
        const txInfo = await extractTransactionsInfo(currentTransaction);
        const shouldContinueWithoutSigning = Boolean(
          txInfo?.transactionTokenInfo?.type &&
            txInfo?.transactionTokenInfo?.multiTxData &&
            !txInfo?.dataField.endsWith(
              txInfo?.transactionTokenInfo?.multiTxData
            )
        );

        if (shouldContinueWithoutSigning) {
          currentTransactionIndex++;
          return signNextTransaction();
        }

        try {
          const signedTransaction = await handleSign([
            currentTransaction.transaction
          ]);

          if (signedTransaction) {
            signedTransactions.push(signedTransaction[0]);
          }

          eventBus.unsubscribe(SignEventsEnum.SIGN_TRANSACTION, onSign);
          eventBus.unsubscribe(SignEventsEnum.CLOSE, onCancel);

          if (signedTransactions.length == transactions.length) {
            signModalElement.remove();
            resolve(signedTransactions);
          } else {
            currentTransactionIndex++;
            signNextTransaction();
          }
        } catch (error) {
          reject('Error signing transactions: ' + error);
          signModalElement.remove();
        }
      };

      eventBus.subscribe(SignEventsEnum.SIGN_TRANSACTION, onSign);
      eventBus.subscribe(SignEventsEnum.CLOSE, onCancel);
    };

    signNextTransaction();
  });
}
