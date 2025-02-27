import { TransactionServerStatusesEnum } from 'types/enums.types';
import { SignedTransactionType } from 'types/transactions.types';

/**
 * Simplified mock type for ToastList
 */
export class MockToastList extends HTMLElement {
  getEventBus() {
    return {
      publish: jest.fn(),
      subscribe: jest.fn()
    };
  }
}

/**
 * Simplified mock for ToastsSliceType
 */
export interface MockToastsSlice {
  transactionToasts: {
    toastId: string;
    startTime: number;
    endTime: number;
  }[];
  customToasts: any[];
}

/**
 * Create a mock signed transaction object
 */
export const createMockTransaction = (
  hash: string,
  status: TransactionServerStatusesEnum = TransactionServerStatusesEnum.pending,
  sender: string = 'mock-sender'
): SignedTransactionType => ({
  chainID: 'D',
  version: 1,
  hash,
  status,
  sender,
  nonce: 1,
  value: '0',
  receiver: 'mock-receiver',
  gasPrice: 1000000000,
  gasLimit: 50000,
  data: ''
});

/**
 * Create a mock toast slice
 */
export const createMockToastSlice = (
  toastIds: string[] = []
): MockToastsSlice => ({
  transactionToasts: toastIds.map((id) => ({
    toastId: id,
    startTime: Date.now() - 1000,
    endTime: Date.now() + 1000
  })),
  customToasts: []
});

/**
 * Create a mock sessions object
 */
export const createMockSessions = (
  toastIds: string[] = [],
  status: string = 'pending',
  transactions: SignedTransactionType[] = []
) => {
  const result: Record<string, any> = {};

  toastIds.forEach((id, index) => {
    result[id] = {
      status,
      transactions:
        transactions.length > 0
          ? transactions
          : [createMockTransaction(`tx-${index}`)],
      transactionsDisplayInfo: { title: `Transaction ${index + 1}` }
    };
  });

  return result;
};
