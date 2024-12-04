import { explorerAddressSelector } from 'store/selectors';
import { getState } from 'store/store';

export function getTransactionLink(
  transactionHash: string,
  explorerAddress: string = explorerAddressSelector(getState())
) {
  return `${explorerAddress}/transactions/${transactionHash}`;
}
