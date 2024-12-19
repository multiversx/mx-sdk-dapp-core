export interface ITransactionData {
  receiver?: string;
  data?: string;
  value?: string;
}

export interface ISignTransactionsModalData {
  transaction: ITransactionData | null;
  total: number;
  egldLabel: string;
  usdValue?: string;
  feeLimit?: string;
  feeInFiatLimit?: string | null;
  currentIndex: number;
  shouldClose?: true;
}

export enum SignEventsEnum {
  'SIGN_TRANSACTION' = 'SIGN_TRANSACTION',
  'NEXT_PAGE' = 'NEXT_PAGE',
  'PREV_PAGE' = 'PREV_PAGE',
  'CLOSE' = 'CLOSE',
  'DATA_UPDATE' = 'DATA_UPDATE'
}
