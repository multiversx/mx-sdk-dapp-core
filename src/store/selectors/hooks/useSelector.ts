import { StoreType, useStore } from '../../store';

type ExtractState<S> = S extends { getState: () => infer X } ? X : StoreType;

export const useSelector = <T>(
  selector: (state: ExtractState<StoreType>) => T
) => {
  return useStore(selector);
};
