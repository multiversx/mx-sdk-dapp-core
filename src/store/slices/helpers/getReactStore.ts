import { StoreApi, UseBoundStore, create } from 'zustand';
import { getKeys } from './getKeys';

// eslint-disable-next-line @typescript-eslint/ban-types
function callSetFunction<T extends Function, F extends Function>(
  originalFunction: T,
  set: F
) {
  return function (this: any, ...args: any[]) {
    set.apply(this, args);
    return originalFunction.apply(this, args);
  };
}

export function getReactStore<T, S extends StoreApi<T>>({
  initialState,
  store
}: {
  store: S;
  initialState: T;
}) {
  const keys = getKeys(initialState);
  const useStore = create<T>((set) => {
    const returnObj: any = {};

    for (const key in keys) {
      const currentKey = keys[key as keyof typeof keys];
      const currentValue = (store as any).getState()[currentKey];

      returnObj[currentKey] =
        typeof currentValue === 'function'
          ? callSetFunction(currentValue, set)
          : currentValue;
    }

    return returnObj as T;
  });

  store.subscribe((newState) => {
    useStore.setState(newState);
  });

  return useStore as UseBoundStore<StoreApi<T>>;
}
