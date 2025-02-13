import { safeWindow } from 'constants/window.constants';

export const redirect = (to: string) => {
  if (!safeWindow.location) {
    return;
  }

  const url = new URL(safeWindow.location.href);

  const isBrowser = url.protocol.startsWith('http');

  if (!isBrowser) {
    return safeWindow.location.reload();
  }

  safeWindow.location.assign(to);
};
