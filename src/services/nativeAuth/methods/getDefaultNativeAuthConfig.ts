import { getWindowLocation } from 'utils/window/getWindowLocation';

export const getDefaultNativeAuthConfig = () => {
  return {
    origin: getWindowLocation().origin,
    apiAddress: 'https://api.multiversx.com',
    expirySeconds: 60 * 60 * 24, // one day
    tokenExpirationToastWarningSeconds: 5 * 60 // five minutes
  };
};
