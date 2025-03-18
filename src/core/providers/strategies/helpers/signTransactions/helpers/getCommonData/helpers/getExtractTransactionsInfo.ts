import { getAccountFromApi } from 'apiCalls/account';
import { getScamAddressData } from 'apiCalls/account/getScamAddressData';
import { SigningErrorsEnum } from 'types/enums.types';

import {
  MultiSignTransactionType,
  TransactionDataTokenType
} from 'types/transactions.types';
import { checkIsValidSender } from './checkIsValidSender';
import { getTxInfoByDataField } from './getTxInfoByDataField';
import { isTokenTransfer } from '../../isTokenTransfer';

interface VerifiedAddressesType {
  [address: string]: { type: string; info: string };
}
let verifiedAddresses: VerifiedAddressesType = {};

type ExtractTransactionsInfoType = {
  sender: string;
  address: string;
  apiAddress: string;
  egldLabel: string;
  parsedTransactionsByDataField: Record<string, TransactionDataTokenType>;
};

export function getExtractTransactionsInfo({
  egldLabel,
  apiAddress,
  sender,
  address,
  parsedTransactionsByDataField
}: ExtractTransactionsInfoType) {
  const extractTransactionsInfo = async (
    currentTx: MultiSignTransactionType
  ) => {
    if (currentTx == null) {
      return;
    }

    const senderAccount =
      !sender || sender === address
        ? null
        : await getAccountFromApi({
            address: sender,
            baseURL: apiAddress
          });

    const { transaction, multiTxData, transactionIndex } = currentTx;
    const dataField = transaction.getData().toString();
    const transactionTokenInfo = getTxInfoByDataField({
      data: transaction.getData().toString(),
      multiTransactionData: multiTxData,
      parsedTransactionsByDataField
    });

    const { tokenId } = transactionTokenInfo;
    const receiver = transaction.getReceiver().toString();

    if (sender && sender !== address) {
      const isValidSender = checkIsValidSender(senderAccount, address);

      if (!isValidSender) {
        console.error(SigningErrorsEnum.senderDifferentThanLoggedInAddress);
        throw SigningErrorsEnum.senderDifferentThanLoggedInAddress;
      }
    }

    const notSender = address !== receiver;
    const verified = receiver in verifiedAddresses;

    if (receiver && notSender && !verified) {
      const data = await getScamAddressData({
        addressToVerify: receiver,
        baseURL: apiAddress
      });
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
      transactionIndex,
      needsSigning: currentTx.needsSigning
    };
  };
  return extractTransactionsInfo;
}
