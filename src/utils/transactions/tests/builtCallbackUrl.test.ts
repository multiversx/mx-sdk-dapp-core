import { buildCallbackUrl } from '../url/buildCallbackUrl';

describe('builtCallbackUrl tests', () => {
  const url = 'https://wallet.multiversx.com';

  test('returns callbackUrl unmodified if urlParams is empty', () => {
    expect(buildCallbackUrl({ callbackUrl: url })).toBe(url);
  });

  test('adds urlParams', () => {
    expect(
      buildCallbackUrl({
        callbackUrl: url,
        urlParams: { status: 'success' }
      })
    ).toBe(
      'https://wallet.multiversx.com/?status=success&sdk-dapp-version=__sdkDappVersion'
    );
  });

  test('adds urlParams and keeps existing hash', () => {
    expect(
      buildCallbackUrl({
        callbackUrl: url + '#test',
        urlParams: { status: 'success' }
      })
    ).toBe(
      'https://wallet.multiversx.com/?status=success&sdk-dapp-version=__sdkDappVersion#test'
    );
  });

  test('keeps existing urlParams', () => {
    expect(
      buildCallbackUrl({
        callbackUrl: url + '?page=1',
        urlParams: { status: 'success' }
      })
    ).toBe(
      'https://wallet.multiversx.com/?page=1&status=success&sdk-dapp-version=__sdkDappVersion'
    );
  });

  test('keeps existing hash', () => {
    expect(
      buildCallbackUrl({
        callbackUrl: url + '?page=1#logs',
        urlParams: { status: 'success' }
      })
    ).toBe(
      'https://wallet.multiversx.com/?page=1&status=success&sdk-dapp-version=__sdkDappVersion#logs'
    );
  });

  test('throws error if callbackUrl is invalid and urlParams are defined', () => {
    expect(
      buildCallbackUrl({
        callbackUrl: '',
        urlParams: { status: 'success' }
      })
    ).toBe('');
  });
});
