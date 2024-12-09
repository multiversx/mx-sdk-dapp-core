import { Transaction } from '@multiversx/sdk-core/out';
import { IProvider } from 'core/providers-strategy/models/Provider';

interface ISignWithUIProps {
  transactions: Transaction[];
  provider: IProvider;
}

export const getSignedTransactions = async ({
  transactions,
  provider
}: ISignWithUIProps): Promise<Transaction[]> => {
  if (!provider.mountSignUI) {
    const signedTransactions = await provider.signTransactions(transactions);
    return signedTransactions ?? [];
  }

  provider.mountSignUI();

  return transactions;
};
