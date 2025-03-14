export interface ICommonData {
  receiver: string;
  data: string;
  gasPrice?: string;
  gasLimit?: string;
  transactionsCount: number;
  egldLabel: string;
  currentIndex: number;
  needsSigning?: boolean;
}
