import { ELLIPSIS, ZERO } from 'constants/placeholders.constants';
import { AccountType } from 'types/account.types';

export const emptyAccount: AccountType = {
  balance: ELLIPSIS,
  address: '',
  isGuarded: false,
  nonce: 0,
  txCount: 0,
  scrCount: 0,
  claimableRewards: ZERO
};
