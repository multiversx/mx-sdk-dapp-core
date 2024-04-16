interface IAccountState {
  address: string;
}

interface IAccountModifiers {
  setAddress: (newAddress: string) => void;
}

export type AccountStoreType = IAccountState & IAccountModifiers;

const initialState = {
  address: ''
};

export const account = (
  set: (
    partial:
      | AccountStoreType
      | Partial<AccountStoreType>
      | ((
          state: AccountStoreType
        ) => AccountStoreType | Partial<AccountStoreType>),
    replace?: boolean | undefined
  ) => void
): AccountStoreType => ({
  ...initialState,
  setAddress: (newAddress: string) =>
    set((state) => ({ ...state, address: newAddress }))
});
