import { accountNonceSelector } from 'store/selectors/accountSelectors';
import { getState } from 'store/store';
import { AccountType } from 'types/account.types';

export function getLatestNonce(account: AccountType | null) {
  const currentAccountNonce = accountNonceSelector(getState());
  if (!account) {
    return currentAccountNonce;
  }
  return currentAccountNonce && !isNaN(currentAccountNonce)
    ? Math.max(currentAccountNonce, account.nonce)
    : account.nonce;
}
