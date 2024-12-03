import { Address, Transaction } from '@multiversx/sdk-core';

import { GAS_PRICE } from 'constants/index';
import { SendSimpleTransactionParamsType } from 'types';

import { getAccount } from 'utils/account/getAccount';
import { computeTransactionNonce } from './computeTransactionNonce';
import { calculateGasLimit } from './calculateGasLimit';
import { newTransaction } from './newTransaction';
import { addressSelector, chainIdSelector } from 'store/selectors';
import { getState } from 'store/store';
import { getLatestNonce } from 'core/methods/account/getLatestNonce';

enum ErrorCodesEnum {
  'invalidReceiver' = 'Invalid Receiver address',
  'unknownError' = 'Unknown Error. Please check the transactions and try again'
}

export async function transformTransactionsForSigning({
  transactions
}: SendSimpleTransactionParamsType): Promise<Transaction[]> {
  const state = getState();
  const address = addressSelector(state);
  const account = await getAccount(address);
  const accountNonce = getLatestNonce(account);
  return transactions.map((tx) => {
    const {
      value,
      receiver,
      data = '',
      chainID,
      version = 1,
      options,
      gasPrice = GAS_PRICE,
      gasLimit = calculateGasLimit({
        data: tx.data,
        isGuarded: account?.isGuarded
      }),
      guardian,
      guardianSignature,
      nonce: transactionNonce = 0
    } = tx;
    let validatedReceiver = receiver;

    try {
      const addr = new Address(receiver);
      validatedReceiver = addr.hex();
    } catch (err) {
      throw ErrorCodesEnum.invalidReceiver;
    }

    const computedNonce = computeTransactionNonce({
      accountNonce,
      transactionNonce
    });

    const storeChainId = chainIdSelector(state).valueOf().toString();
    const transactionsChainId = chainID || storeChainId;

    return newTransaction({
      value,
      receiver: validatedReceiver,
      data,
      gasPrice,
      gasLimit: Number(gasLimit),
      nonce: Number(computedNonce.valueOf().toString()),
      sender: new Address(address).hex(),
      chainID: transactionsChainId,
      version,
      options,
      guardian,
      guardianSignature
    });
  });
}
