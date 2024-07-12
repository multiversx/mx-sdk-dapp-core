import { store } from '../../store';

export const setCustomWalletAddress = (customWalletAddress: string) =>
  store.setState(({ network: state }) => {
    state.network.customWalletAddress = customWalletAddress;
  });

export const loginInfoSlice = createSlice({
  name: 'loginInfoSlice',
  initialState: initialState,
  reducers: {
    setLoginMethod: (
      state: LoginInfoStateType,
      action: PayloadAction<LoginMethodsEnum>
    ) => {
      state.loginMethod = action.payload;
    },
    setTokenLogin: (
      state: LoginInfoStateType,
      action: PayloadAction<TokenLoginType | null>
    ) => {
      state.tokenLogin = action.payload;
    },
    setTokenLoginSignature: (
      state: LoginInfoStateType,
      action: PayloadAction<string>
    ) => {
      if (state?.tokenLogin != null) {
        state.tokenLogin.signature = action.payload;
      }
    },
    setWalletLogin: (
      state: LoginInfoStateType,
      action: PayloadAction<LoginInfoType | null>
    ) => {
      state.walletLogin = action.payload;
    },
    setWalletConnectLogin: (
      state: LoginInfoStateType,
      action: PayloadAction<WalletConnectLoginType | null>
    ) => {
      state.walletConnectLogin = action.payload;
    },
    setLedgerLogin: (
      state: LoginInfoStateType,
      action: PayloadAction<LedgerLoginType | null>
    ) => {
      state.ledgerLogin = action.payload;
    },
    invalidateLoginSession: (state: LoginInfoStateType) => {
      state.isLoginSessionInvalid = true;
    },
    setLogoutRoute: (
      state: LoginInfoStateType,
      action: PayloadAction<string | undefined>
    ) => {
      state.logoutRoute = action.payload;
    },
    setIsWalletConnectV2Initialized: (
      state: LoginInfoStateType,
      action: PayloadAction<boolean>
    ) => {
      state.isWalletConnectV2Initialized = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(logoutAction, () => {
      return initialState;
    });
    builder.addCase(
      loginAction,
      (
        state: LoginInfoStateType,
        action: PayloadAction<LoginActionPayloadType>
      ) => {
        state.isLoginSessionInvalid = false;
        state.loginMethod = action.payload.loginMethod;
        setLoginExpiresAt(getNewLoginExpiresTimestamp());
      }
    );
  }
});
