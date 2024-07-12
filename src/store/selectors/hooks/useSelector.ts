import { getStoreHook, StoreType } from '../../store';

type ExtractState<S> = S extends { getState: () => infer X } ? X : StoreType;

export function useSelector<T>(selector: (state: ExtractState<StoreType>) => T) {
  const useStore = getStoreHook();
  return useStore(selector);
}