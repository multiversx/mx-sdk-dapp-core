import { CrossWindowProvider } from 'lib/sdkWebWalletCrossWindowProvider';

export async function getCrossWindowProvider({
  address,
  walletUrl
}: {
  address: string;
  walletUrl: string;
}) {
  try {
    const success = await CrossWindowProvider.getInstance().init();
    const provider = CrossWindowProvider.getInstance()
      .setAddress(address)
      .setWalletUrl(walletUrl);

    if (success) {
      return provider;
    } else {
      console.error('Could not initialize CrossWindowWallet Provider');
    }
  } catch (err) {
    console.error('Unable to login to CrossWindowWallet Provider', err);
  }
  return null;
}
