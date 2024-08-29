import { getWindowLocation } from 'utils/window/getWindowLocation';

export function getCallbackUrl() {
  const { origin, pathname } = getWindowLocation();
  return encodeURIComponent(`${origin}${pathname}`);
}
