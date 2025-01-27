import { ServerTransactionType } from 'types/serverTransactions.types';
import { getInterpretedTransaction } from 'utils/transactions/getInterpretedTransaction';
import { useGetAccount } from 'store/selectors/hooks/account/useGetAccount';
import { useGetNetworkConfig } from 'store/selectors/hooks/network/useGetNetworkConfig';

export class TransactionsTableController {
  public static processTransactions(transactions: ServerTransactionType[]) {
    const { address } = useGetAccount();
    const { network } = useGetNetworkConfig();

    const interpretedTransactions = transactions.map((transaction) =>
      getInterpretedTransaction({
        address,
        explorerAddress: network.explorerAddress,
        transaction
      })
    );

    return interpretedTransactions.map((transaction) => ({
      age: transaction.transactionDetails.age,
      method: transaction.transactionDetails.method,
      iconInfo: transaction.transactionDetails.iconInfo,
      link: transaction.links.transactionLink,
      txHash: transaction.txHash
    }));
  }
}
