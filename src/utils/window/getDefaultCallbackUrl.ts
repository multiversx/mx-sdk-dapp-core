import { getWindowLocation } from './index';

export function getDefaultCallbackUrl() {
  const { pathname, search, hash } = getWindowLocation();

  return `${pathname ?? ''}${search ?? ''}${hash ?? ''}`;
}
