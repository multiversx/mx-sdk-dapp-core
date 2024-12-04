import { isWindowAvailable } from './isWindowAvailable';

type GetWindowLocationType = {
  pathname: string;
  hash: string;
  origin: string;
  href: string;
  search: string;
};

export function getWindowLocation(): GetWindowLocationType {
  const isAvailable = isWindowAvailable();

  if (!isAvailable) {
    return {
      pathname: '',
      hash: '',
      origin: '',
      href: '',
      search: ''
    };
  }

  const {
    location: { pathname, hash, origin, href, search }
  } = window;

  return {
    pathname,
    hash,
    origin,
    href,
    search
  };
}
