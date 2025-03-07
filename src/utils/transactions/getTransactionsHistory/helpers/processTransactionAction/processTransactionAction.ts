import startCase from 'lodash/startCase';
import uniq from 'lodash/uniq';

import {
  TransactionListItemActionType,
  TransactionActionMethodTypeEnum
} from 'types/transaction-list-item.types';
import {
  ProcessTransactionActionParamsType,
  TransactionActionCategoryTypeEnum
} from './processTransactionAction.types';
import { getTransactionActionDirectionLabel } from '../getTransactionActionDirectionLabel';
import { getTransactionActionTransferLabel } from '../getTransactionActionTransferLabel';

export const processTransactionAction = ({
  currentUserAddress,
  transaction,
  egldLabel,
  isPending = false
}: ProcessTransactionActionParamsType): TransactionListItemActionType => {
  if (isPending) {
    return {
      name: 'Pending...'
    };
  }

  const defaultTransactionObject: Record<
    string,
    TransactionActionMethodTypeEnum
  > = {};

  const transactionMethodsEntries = Object.entries(
    TransactionActionMethodTypeEnum
  );

  const transactionMethods = transactionMethodsEntries.reduce(
    (transactionMethodsObject, [methodValue, methodLabel]) =>
      Object.assign(transactionMethodsObject, { [methodValue]: methodLabel }),
    defaultTransactionObject
  );

  const transactionAction = transaction.action;
  const transactionArguments = transactionAction && transactionAction.arguments;

  const transactionActionCategory =
    transactionAction && transactionAction.category
      ? (transactionAction.category as TransactionActionCategoryTypeEnum)
      : null;

  const isTransfer =
    transactionArguments && transactionAction.name === 'transfer';

  const transactionTransfers: Record<string, string>[] =
    transactionArguments && Array.isArray(transactionArguments.transfers)
      ? transactionArguments.transfers
      : [];

  const allTransferTypes = transactionTransfers.map(
    (transfer): string => transfer.type
  );

  const [transferType] = uniq(allTransferTypes);
  const processedEgldLabel = egldLabel ?? 'EGLD';
  const directionLabel = getTransactionActionDirectionLabel({
    transaction,
    transferType,
    currentUserAddress
  });

  const transferLabel = getTransactionActionTransferLabel({
    allTransferTypes,
    transferType,
    transactionTransfers
  });

  const transactionActionDescriptionCategories = [
    TransactionActionCategoryTypeEnum.mex,
    TransactionActionCategoryTypeEnum.stake
  ];

  const showTransactionActionDescription =
    transactionActionCategory &&
    transactionActionDescriptionCategories.includes(transactionActionCategory);

  const transactionActionDescription =
    transactionAction && showTransactionActionDescription
      ? transactionAction.description
      : undefined;

  const defaultTransactionActionLabel =
    transaction.function && transaction.function !== 'transfer'
      ? transactionMethods[transaction.function] ??
        startCase(transaction.function)
      : null;

  if (isTransfer && transactionArguments) {
    return {
      name: `${directionLabel} ${transferLabel}`,
      description: transactionActionDescription
    };
  }

  if (defaultTransactionActionLabel) {
    return {
      name: defaultTransactionActionLabel,
      description: transactionActionDescription
    };
  }

  return {
    name: `${directionLabel} ${processedEgldLabel}`,
    description: transactionActionDescription
  };
};
