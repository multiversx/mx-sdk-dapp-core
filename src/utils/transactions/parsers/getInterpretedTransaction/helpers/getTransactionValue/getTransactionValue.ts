import { DECIMALS } from 'constants/index';

import {
  ACTIONS_WITH_EGLD_VALUE,
  ACTIONS_WITH_MANDATORY_OPERATIONS,
  ACTIONS_WITH_VALUE_IN_ACTION_FIELD,
  ACTIONS_WITH_VALUE_IN_DATA_FIELD
} from '../../constants';

import {
  getValueFromActions,
  getValueFromDataField,
  getValueFromOperations,
  getEgldValueData,
  getTitleText
} from './helpers';
import {
  EgldValueDataType,
  NFTValueDataType,
  TokenValueDataType
} from '../types';
import { NftEnumType, InterpretedTransactionType } from 'types';
import { getTransactionTokens } from '../getTransactionTokens';
import { getTransactionActionNftText } from '../../../getTransactionActionNftText';
import { getTransactionActionTokenText } from '../../../getTransactionActionTokenText';

export interface GetTransactionValueReturnType {
  egldValueData?: EgldValueDataType;
  tokenValueData?: TokenValueDataType;
  nftValueData?: NFTValueDataType;
}

export interface GetTransactionValueType {
  hideMultipleBadge?: boolean;
  transaction: InterpretedTransactionType;
}

export function getTransactionValue({
  transaction,
  hideMultipleBadge
}: GetTransactionValueType): GetTransactionValueReturnType {
  if (transaction.action) {
    if (ACTIONS_WITH_EGLD_VALUE.includes(transaction.action.name)) {
      return getEgldValueData(transaction.value);
    }

    if (ACTIONS_WITH_VALUE_IN_DATA_FIELD.includes(transaction.action.name)) {
      return getValueFromDataField(transaction);
    }

    if (ACTIONS_WITH_MANDATORY_OPERATIONS.includes(transaction.action.name)) {
      return getValueFromOperations(transaction);
    }

    if (ACTIONS_WITH_VALUE_IN_ACTION_FIELD.includes(transaction.action.name)) {
      return getValueFromActions(transaction);
    }

    const transactionTokens = getTransactionTokens(transaction);

    if (transactionTokens.length) {
      const txToken = transactionTokens[0];
      const isNft = Object.values(NftEnumType).includes(
        txToken.type as NftEnumType
      );

      const hasTitleText = !hideMultipleBadge && transactionTokens.length > 1;
      const titleText = hasTitleText ? getTitleText(transactionTokens) : '';

      if (isNft) {
        const {
          badgeText,
          tokenFormattedAmount,
          tokenExplorerLink,
          tokenLinkText
        } = getTransactionActionNftText({ token: txToken });

        return {
          nftValueData: {
            badgeText,
            tokenFormattedAmount,
            tokenExplorerLink,
            tokenLinkText,
            transactionTokens,
            token: txToken,
            value: tokenFormattedAmount != null ? txToken.value : null,
            decimals: tokenFormattedAmount != null ? txToken.decimals : null,
            titleText
          }
        };
      }

      const {
        tokenExplorerLink,
        showFormattedAmount,
        tokenFormattedAmount,
        tokenLinkText,
        token
      } = getTransactionActionTokenText({
        token: txToken
      });

      return {
        tokenValueData: {
          tokenExplorerLink,
          showFormattedAmount,
          tokenFormattedAmount,
          tokenLinkText,
          transactionTokens,
          token,
          value: txToken.value,
          decimals: txToken.decimals ?? DECIMALS,
          titleText
        }
      };
    }
  }

  return getEgldValueData(transaction.value);
}
