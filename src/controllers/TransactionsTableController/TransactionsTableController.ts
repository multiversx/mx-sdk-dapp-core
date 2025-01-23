import {
  InterpretedTransactionType,
  ServerTransactionType
} from 'types/serverTransactions.types';
import { getInterpretedTransaction } from 'utils/transactions/getInterpretedTransaction';
import { useGetAccount } from 'store/selectors/hooks/account/useGetAccount';
import { useGetNetworkConfig } from 'store/selectors/hooks/network/useGetNetworkConfig';

export class TransactionsTableController {
  public static processTransactions(
    transactions: ServerTransactionType[]
  ): InterpretedTransactionType[] {
    const { address } = useGetAccount();
    const { network } = useGetNetworkConfig();

    return transactions.map((transaction) =>
      getInterpretedTransaction({
        address,
        explorerAddress: network.explorerAddress,
        transaction
      })
    );
  }
}
