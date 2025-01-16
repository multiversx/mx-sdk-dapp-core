import { Transaction } from '@multiversx/sdk-core/out';
import { getEconomics } from 'apiCalls/economics/getEconomics';
import { getPersistedTokenDetails } from 'apiCalls/tokens/getPersistedTokenDetails';
import {
  GAS_PER_DATA_BYTE,
  GAS_PRICE_MODIFIER,
  MULTI_TRANSFER_EGLD_TOKEN
} from 'constants/mvx.constants';
import { SignTransactionsStateManager } from 'core/managers/SignTransactionsStateManager/SignTransactionsStateManager';
import {
  ISignTransactionsModalData,
  SignEventsEnum
} from 'core/managers/SignTransactionsStateManager/types';
import { getAddress } from 'core/methods/account/getAddress';
import { getEgldLabel } from 'core/methods/network/getEgldLabel';
import { IProvider } from 'core/providers/types/providerFactory.types';
import { SignTransactionsModal } from 'lib/sdkDappCoreUi';
import { formatAmount } from 'lib/sdkDappUtils';
import { networkSelector } from 'store/selectors/networkSelectors';
import { getState } from 'store/store';
import { EsdtEnumType, NftEnumType } from 'types/tokens.types';
import { createModalElement } from 'utils/createModalElement';
import { decodePart } from 'utils/decoders/decodePart';
import { calculateFeeInFiat } from './helpers/calculateFeeInFiat';
import { calculateFeeLimit } from './helpers/calculateFeeLimit';
import { getExtractTransactionsInfo } from './helpers/getExtractTransactionsInfo';
import { getMultiEsdtTransferData } from './helpers/getMultiEsdtTransferData/getMultiEsdtTransferData';
import { getUsdValue } from './helpers/getUsdValue';

export async function signTransactions({
  transactions = [],
  handleSign
}: {
  transactions?: Transaction[];
  handleSign: IProvider['signTransactions'];
}) {
  const address = getAddress();
  const network = networkSelector(getState());

  const egldLabel = getEgldLabel();
  const signModalElement = await createModalElement<SignTransactionsModal>(
    'sign-transactions-modal'
  );

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

    const signNextTransaction = async () => {
      const currentTransaction = allTransactions[currentTransactionIndex];
      const sender = currentTransaction?.transaction?.getSender().toString();
      const transaction = currentTransaction?.transaction;
      const price = economics?.price;

      const feeLimit = calculateFeeLimit({
        gasPerDataByte: String(GAS_PER_DATA_BYTE),
        gasPriceModifier: String(GAS_PRICE_MODIFIER),
        gasLimit: transaction.getGasLimit().valueOf().toString(),
        gasPrice: transaction.getGasPrice().valueOf().toString(),
        data: transaction.getData().toString(),
        chainId: transaction.getChainID().valueOf()
      });

      const feeLimitFormatted = formatAmount({
        input: feeLimit,
        showLastNonZeroDecimal: true
      });

      const feeInFiatLimit = price
        ? calculateFeeInFiat({
            feeLimit,
            egldPriceInUsd: price,
            hideEqualSign: true
          })
        : null;

      const extractTransactionsInfo = getExtractTransactionsInfo({
        getTxInfoByDataField,
        egldLabel,
        sender,
        address
      });

      const plainTransaction = currentTransaction.transaction.toPlainObject();

      const txInfo = await extractTransactionsInfo(currentTransaction);

      let tokenIdForTokenDetails = txInfo?.transactionTokenInfo?.tokenId;
      const isEgld = !tokenIdForTokenDetails;
      let tokenAmount = '';

      if (txInfo?.transactionTokenInfo) {
        const { tokenId, nonce, amount } = txInfo.transactionTokenInfo;
        const isNftOrSft = nonce && nonce.length > 0;
        tokenIdForTokenDetails = isNftOrSft ? `${tokenId}-${nonce}` : tokenId;
        tokenAmount = amount;
      }

      const tokenDetails = await getPersistedTokenDetails({
        tokenId: tokenIdForTokenDetails
      });

      const { esdtPrice, tokenDecimals, type, identifier, tokenImageUrl } =
        tokenDetails;

      const isNft =
        type === NftEnumType.SemiFungibleESDT ||
        type === NftEnumType.NonFungibleESDT;

      if (isNft) {
        manager.updateFungibleTransaction(type, {
          identifier,
          amount: tokenAmount,
          imageURL: tokenImageUrl
        });
      } else {
        const getFormattedAmount = ({ addCommas }: { addCommas: boolean }) =>
          formatAmount({
            input: isEgld
              ? currentTransaction.transaction.getValue().toString()
              : tokenAmount,
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

      const commonData: ISignTransactionsModalData['commonData'] = {
        receiver: plainTransaction.receiver.toString(),
        data: currentTransaction.transaction.getData().toString(),
        egldLabel,
        tokenType: isNft ? type : EsdtEnumType.FungibleESDT,
        feeLimit: feeLimitFormatted,
        feeInFiatLimit,
        transactionsCount: allTransactions.length,
        currentIndex: currentTransactionIndex
      };

      if (txInfo?.transactionTokenInfo?.multiTxData) {
        commonData.highlight = txInfo.transactionTokenInfo?.multiTxData;

        if (!txInfo.transactionTokenInfo.tokenId) {
          const scCall = decodePart(txInfo.transactionTokenInfo.multiTxData);
          commonData.scCall = scCall;
        }
      }

      manager.updateCommonData(commonData);
      manager.updateConfirmedTransactions();

      const onPreviousPageChanged = async () => {
        const data = manager.confirmedTransactions[manager.currentIndex - 1];
        manager.updateData(data);
      };

      const onNextPageChanged = async () => {
        const data = manager.confirmedTransactions[manager.currentIndex + 1];
        manager.updateData(data);
      };

      const onCancel = () => {
        reject(new Error('Transaction signing cancelled by user'));
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
            onPreviousPageChanged
          );
          eventBus.unsubscribe(
            SignEventsEnum.NEXT_TRANSACTION,
            onNextPageChanged
          );
        };

        if (shouldContinueWithoutSigning) {
          currentTransactionIndex++;
          removeEvents();
          manager.updateNextUnsignedTxIndex(currentTransactionIndex);
          return signNextTransaction();
        }

        try {
          const signedTransaction = await handleSign([
            currentTransaction.transaction
          ]);

          if (signedTransaction) {
            signedTransactions.push(signedTransaction[0]);
          }

          removeEvents();

          if (signedTransactions.length == transactions.length) {
            signModalElement.remove();
            resolve(signedTransactions);
          } else {
            currentTransactionIndex++;
            manager.updateNextUnsignedTxIndex(currentTransactionIndex);
            signNextTransaction();
          }
        } catch (error) {
          reject('Error signing transactions: ' + error);
          signModalElement.remove();
        }
      };

      eventBus.subscribe(SignEventsEnum.SIGN_TRANSACTION, onSign);
      eventBus.subscribe(SignEventsEnum.CLOSE, onCancel);
      eventBus.subscribe(
        SignEventsEnum.PREV_TRANSACTION,
        onPreviousPageChanged
      );
      eventBus.subscribe(SignEventsEnum.NEXT_TRANSACTION, onNextPageChanged);
    };

    signNextTransaction();
  });
}
