import { getWindowLocation } from './getWindowLocation';

export function clearNavigationHistory(remainingParams: any) {
  const newUrlParams = new URLSearchParams(remainingParams).toString();
  const { pathname, hash } = getWindowLocation();
  const newSearch = newUrlParams ? `?${newUrlParams}` : '';
  const fullPath = pathname ? `${pathname}${newSearch}${hash}` : './';

  setTimeout(() => {
    window?.history.replaceState({}, document?.title, fullPath);
  });
}
