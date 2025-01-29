import { getTokenDetails } from 'apiCalls';
import { addressIsValid } from '../validation';

interface GetLockedAccountNameParamsType {
  receiver: string;
  sender: string;
  tokenId?: string;
}

export const getLockedAccountName = async ({
  receiver,
  sender,
  tokenId
}: GetLockedAccountNameParamsType) => {
  let senderLockedAccount = null,
    receiverLockedAccount = null;

  if (!tokenId) {
    return {
      senderLockedAccount,
      receiverLockedAccount
    };
  }

  const tokenDetails = await getTokenDetails({ tokenId });

  const lockedAccounts = tokenDetails?.assets?.lockedAccounts;

  if (!lockedAccounts) {
    return {
      senderLockedAccount,
      receiverLockedAccount
    };
  }

  for (let account in lockedAccounts) {
    if (addressIsValid(account)) {
      if (sender === account) {
        senderLockedAccount = account;
      }

      if (receiver === account) {
        receiverLockedAccount = account;
      }
    }

    if (addressIsValid(lockedAccounts[account])) {
      if (sender === lockedAccounts[account]) {
        senderLockedAccount = lockedAccounts[account];
      }

      if (receiver === lockedAccounts[account]) {
        receiverLockedAccount = lockedAccounts[account];
      }
    }

    if (senderLockedAccount && receiverLockedAccount) {
      return {
        senderLockedAccount,
        receiverLockedAccount
      };
    }
  }

  return {
    senderLockedAccount,
    receiverLockedAccount
  };
};
