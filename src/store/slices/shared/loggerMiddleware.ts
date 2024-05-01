import { StateCreator, StoreApi } from 'zustand';

/**
 * Creates a logger middleware that logs the state before and after each action
 * @example
 * // Create a custom event named "myEvent" with an object as data
 * const store = createStore<SharedType>()(
    devtools(
      persist(
        immer(
          loggerMiddleware((...a) => ({
            ...definition(...a),
            ...createSharedSlice(...a)
          }))
        ),
        {
          name: 'accountStore',
          storage: createJSONStorage(() => sessionStorage)
        }
      )
    )
  );
 */
export const loggerMiddleware =
  <S>(config: StateCreator<S>) =>
  (
    set: StoreApi<S>['setState'],
    get: StoreApi<S>['getState'],
    api: StoreApi<S>
  ): S =>
    config(
      (...args) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [_state, _shouldReplace, ...rest] = args;

        const [{ type }] = rest as any;

        console.log('running', type, 'and applying', args);
        set(...args);
        console.log('  new state', get());
      },
      get,
      api
    );
