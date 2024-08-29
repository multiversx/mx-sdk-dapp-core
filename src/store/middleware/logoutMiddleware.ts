import { storage } from 'storage';
import { WritableDraft } from 'immer';
import { initialState as initialAccountState } from 'store/slices/account/accountSlice';
import { initialState as initialLoginInfoState } from 'store/slices/loginInfo/loginInfoSlice';
import { localStorageKeys } from 'storage/local';
import { isLoggedInSelector } from 'store/selectors';
import { StoreType } from '../store.types';

export const resetStore = (store: WritableDraft<StoreType>) => {
  store.account = initialAccountState;
  store.loginInfo = initialLoginInfoState;
};

export function getNewLoginExpiresTimestamp() {
  return new Date().setHours(new Date().getHours() + 24);
}

export function setLoginExpiresAt(expiresAt: number) {
  storage.local.setItem({
    key: localStorageKeys.loginExpiresAt,
    data: expiresAt,
    expires: expiresAt
  });
}

export const logoutMiddleware = (state: StoreType) => {
  const isLoggedIn = isLoggedInSelector(state);
  const loginTimestamp = storage.local.getItem(localStorageKeys.loginExpiresAt);

  if (!isLoggedIn) {
    return;
  }

  if (loginTimestamp == null) {
    setLoginExpiresAt(getNewLoginExpiresTimestamp());
    return;
  }

  const now = Date.now();
  const isExpired = loginTimestamp - now < 0;

  if (isExpired) {
    // logout
    resetStore(state);
  }
};
