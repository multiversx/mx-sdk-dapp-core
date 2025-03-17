import { Transaction } from '@multiversx/sdk-core/out';
import { getEconomics } from 'apiCalls/economics/getEconomics';
import { getPersistedTokenDetails } from 'apiCalls/tokens/getPersistedTokenDetails';
import {
  GAS_PER_DATA_BYTE,
  GAS_PRICE_MODIFIER,
  MULTI_TRANSFER_EGLD_TOKEN
} from 'constants/mvx.constants';
import {
  SignEventsEnum,
  ISignTransactionsPanelData
} from 'core/managers/internal/SignTransactionsStateManager/types';
import { getAddress } from 'core/methods/account/getAddress';
import { getEgldLabel } from 'core/methods/network/getEgldLabel';
import { cancelCrossWindowAction } from 'core/providers/helpers/cancelCrossWindowAction';
import { getSignTransactionsHandlers } from 'core/providers/strategies/helpers';
import { IProvider } from 'core/providers/types/providerFactory.types';
import { formatAmount } from 'lib/sdkDappUtils';
import { networkSelector } from 'store/selectors/networkSelectors';
import { getState } from 'store/store';
import { NftEnumType } from 'types/tokens.types';
import { calculateFeeInFiat } from './helpers/calculateFeeInFiat';
import { calculateFeeLimit } from './helpers/calculateFeeLimit';
import { getExtractTransactionsInfo } from './helpers/getExtractTransactionsInfo';
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

  const { allTransactions, getTxInfoByDataField } =
    getMultiEsdtTransferData(transactions);

  const { eventBus, manager } = await getSignTransactionsHandlers({
    cancelAction: cancelCrossWindowAction
  });

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

      const commonData: ISignTransactionsPanelData['commonData'] = {
        receiver: plainTransaction.receiver.toString(),
        data: currentTransaction.transaction.getData().toString(),
        egldLabel,
        tokenType: getTokenType(type),
        feeLimit: feeLimitFormatted,
        feeInFiatLimit,
        transactionsCount: allTransactions.length,
        currentIndex: currentTransactionIndex,
        highlight: getHighlight(txInfo?.transactionTokenInfo),
        scCall: getScCall(txInfo?.transactionTokenInfo)
      };

      manager.updateCommonData(commonData);
      manager.updateConfirmedTransactions();

      const onPreviousTransaction = async () => {
        const data = manager.confirmedScreens[manager.currentScreenIndex - 1];
        manager.updateData(data);
      };

      const onNextTransaction = async () => {
        const data = manager.confirmedScreens[manager.currentScreenIndex + 1];
        manager.updateData(data);
      };

      const onCancel = async () => {
        reject(new Error('Transaction signing cancelled by user'));
        await cancelCrossWindowAction();
        manager.closeAndReset();
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
          eventBus.unsubscribe(
            SignEventsEnum.CLOSE_SIGN_TRANSACTIONS_PANEL,
            onCancel
          );
          eventBus.unsubscribe(
            SignEventsEnum.PREV_TRANSACTION,
            onPreviousTransaction
          );
          eventBus.unsubscribe(
            SignEventsEnum.NEXT_TRANSACTION,
            onNextTransaction
          );
        };

        if (shouldContinueWithoutSigning) {
          currentTransactionIndex++;
          removeEvents();
          manager.setNextUnsignedTxIndex(currentTransactionIndex);
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

          const areAllSigned = signedTransactions.length == transactions.length;

          if (areAllSigned) {
            const optionallyGuardedTransactions =
              await guardTransactions(signedTransactions);
            manager.closeAndReset();

            return resolve(optionallyGuardedTransactions);
          }

          currentTransactionIndex++;
          manager.setNextUnsignedTxIndex(currentTransactionIndex);
          signNextTransaction();
        } catch (error) {
          removeEvents();
          manager.closeAndReset();
          reject(error);
        }
      };

      eventBus.subscribe(SignEventsEnum.SIGN_TRANSACTION, onSign);
      eventBus.subscribe(
        SignEventsEnum.CLOSE_SIGN_TRANSACTIONS_PANEL,
        onCancel
      );
      eventBus.subscribe(
        SignEventsEnum.PREV_TRANSACTION,
        onPreviousTransaction
      );
      eventBus.subscribe(SignEventsEnum.NEXT_TRANSACTION, onNextTransaction);
    };

    signNextTransaction();
  });
}
