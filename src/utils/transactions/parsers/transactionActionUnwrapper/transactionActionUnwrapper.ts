import { esdtNftUnwrapper, mexUnwrapper, stakeUnwrapper } from './helpers';
import {
  TransactionActionCategoryEnum,
  TransactionActionType,
  UnwrapperType
} from '../../../../types';

export function transactionActionUnwrapper(
  action: TransactionActionType
): Array<string | UnwrapperType> {
  if (!action.arguments) {
    return action.description ? [action.description] : [action.name];
  }

  switch (action.category) {
    case TransactionActionCategoryEnum.esdtNft:
      return esdtNftUnwrapper(action);
    case TransactionActionCategoryEnum.mex:
      return mexUnwrapper(action);
    case TransactionActionCategoryEnum.stake:
      return stakeUnwrapper(action);
    default:
      return action.description ? [action.description] : [];
  }
}
