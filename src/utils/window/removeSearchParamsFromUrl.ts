import qs from 'qs';
import { clearNavigationHistory } from './clearNavigationHistory';
import { isWindowAvailable } from './isWindowAvailable';
import { parseNavigationParams } from './parseNavigationParams';

interface RemoveSearchParamsFromUrlParamsType {
  removeParams: string[];
  search?: string;
}

export const removeSearchParamsFromUrl = ({
  removeParams,
  search
}: RemoveSearchParamsFromUrlParamsType) => {
  const windowSearch = isWindowAvailable() ? window.location.search : '';
  const defaultSearch = search ?? windowSearch;

  if (!defaultSearch) {
    return {};
  }

  const searchData = qs.parse(defaultSearch.replace('?', ''));

  const preserveParams = Object.keys(searchData).filter(
    (key) => !removeParams.includes(key)
  );

  const { remainingParams } = parseNavigationParams(preserveParams, {
    search,
    removeParams
  });

  clearNavigationHistory(remainingParams);

  return remainingParams;
};
