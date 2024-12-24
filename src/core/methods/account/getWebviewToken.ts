import { getWindowLocation } from 'utils/window/getWindowLocation';

// TODO: also get from store
// TODO: is this still needed? Maybe drop support and use postMessage
export function getWebviewToken() {
  const { search } = getWindowLocation();
  const urlSearchParams = new URLSearchParams(search) as any;
  const searchParams = Object.fromEntries(urlSearchParams);

  return searchParams?.accessToken;
}
