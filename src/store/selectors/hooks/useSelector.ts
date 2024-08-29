import { StoreType } from 'store/store.types';
import { getStoreHook } from '../../store';

type ExtractState<S> = S extends { getState: () => infer T } ? T : StoreType;

export function useSelector<T>(
  selector: (state: ExtractState<StoreType>) => T
) {
  const useStore = getStoreHook();
  return useStore(selector);
}
