import { getAccountFromApi } from 'apiCalls/account';
import { getScamAddressData } from 'apiCalls/utils/getScamAddressData';
import { SENDER_DIFFERENT_THAN_LOGGED_IN_ADDRESS } from 'constants/errorMessages.constants';

import { MultiSignTransactionType } from 'types/transactions.types';
import { checkIsValidSender } from './checkIsValidSender';
import { getMultiEsdtTransferData } from './getMultiEsdtTransferData/getMultiEsdtTransferData';
import { isTokenTransfer } from './isTokenTransfer';

interface VerifiedAddressesType {
  [address: string]: { type: string; info: string };
}
let verifiedAddresses: VerifiedAddressesType = {};

type ExtractTransactionsInfoType = {
  getTxInfoByDataField: ReturnType<
    typeof getMultiEsdtTransferData
  >['getTxInfoByDataField'];
  sender: string;
  address: string;
  egldLabel: string;
};

export function getExtractTransactionsInfo({
  getTxInfoByDataField,
  egldLabel,
  sender,
  address
}: ExtractTransactionsInfoType) {
  const extractTransactionsInfo = async (
    currentTx: MultiSignTransactionType
  ) => {
    if (currentTx == null) {
      return;
    }

    const senderAccount =
      !sender || sender === address ? null : await getAccountFromApi(sender);

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
        throw SENDER_DIFFERENT_THAN_LOGGED_IN_ADDRESS;
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
      tokenId && isTokenTransfer({ tokenId, egldLabel })
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
  return extractTransactionsInfo;
}
