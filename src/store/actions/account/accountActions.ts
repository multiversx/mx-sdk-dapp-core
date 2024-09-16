import { getStore } from 'store/store';
import { AccountType } from 'types/account.types';
import { emptyAccount } from 'store/slices/account/emptyAccount';
import {
  BatchTransactionsWSResponseType,
  LedgerAccountType
} from 'store/slices/account/account.types';

export const setAddress = (address: string) =>
  getStore().setState(({ account: state }) => {
    state.address = address;
  });

export const setAccount = (account: AccountType) => {
  getStore().setState(({ account: state }) => {
    const isSameAddress = state.address === account.address;
    state.accounts = {
      [state.address]: isSameAddress ? account : emptyAccount
    };
  });
};

// TODO: check if needed
export const setLedgerAccount = (ledgerAccount: LedgerAccountType | null) =>
  getStore().setState(({ account: state }) => {
    state.ledgerAccount = ledgerAccount;
  });

// TODO: check if needed
export const updateLedgerAccount = ({
  index,
  address
}: {
  index: LedgerAccountType['index'];
  address: LedgerAccountType['address'];
}) =>
  getStore().setState(({ account: state }) => {
    if (state.ledgerAccount) {
      state.ledgerAccount.address = address;
      state.ledgerAccount.index = index;
    }
  });

export const setWalletConnectAccount = (walletConnectAccount: string | null) =>
  getStore().setState(({ account: state }) => {
    state.walletConnectAccount = walletConnectAccount;
  });

export const setWebsocketEvent = (message: string) =>
  getStore().setState(({ account: state }) => {
    state.websocketEvent = {
      timestamp: Date.now(),
      message
    };
  });

export const setWebsocketBatchEvent = (data: BatchTransactionsWSResponseType) =>
  getStore().setState(({ account: state }) => {
    state.websocketBatchEvent = {
      timestamp: Date.now(),
      data
    };
  });
