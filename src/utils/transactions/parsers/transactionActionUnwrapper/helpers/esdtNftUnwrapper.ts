import {
  TransactionActionType,
  UnwrapperType,
  TransactionActionsEnum
} from 'types';

export function esdtNftUnwrapper(
  action: TransactionActionType
): Array<string | UnwrapperType> {
  switch (action.name) {
    case TransactionActionsEnum.transfer:
      return [
        'Transfer',
        { token: action.arguments?.transfers },
        'to',
        { address: action.arguments?.receiver }
      ];

    default:
      return [];
  }
}
