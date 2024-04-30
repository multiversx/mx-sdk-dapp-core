import { createStore, StateCreator, StoreApi } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { getKeys } from './helpers/getKeys';
import { getReactStore } from './helpers/getReactStore';
import { GetSetType } from './helpers/types';

const initialState = {
  ['address']: 'NO_ADDRESS',
  ['setAddress']: (_newAddress: string) => {}
};

type StateType = typeof initialState;

const keys = getKeys(initialState);

const definition = (
  set: GetSetType<StateType>,
  get: () => StateType
): StateType => ({
  address: initialState.address,
  setAddress: (newAddress) =>
    set(
      (state) => {
        console.log('\x1b[42m%s\x1b[0m', 'Before setting address:', get());

        state.address = newAddress;
      },
      false,
      { type: keys.setAddress }
    )
});

const initialSharedState = {
  ['logout']: () => {}
};

type SharedSliceType = typeof initialSharedState;

const createSharedSlice: StateCreator<StateType, [], [], SharedSliceType> = (
  _set,
  get
) => ({
  logout: () => {
    // you can reuse previous methods
    get().setAddress('');
    // or do them from scratch
    // set((state) => ({ bears: state.bears + 1, fishes: state.fishes + 1 })
  }
});

type SharedType = StateType & SharedSliceType;

type Middleware<S extends SharedType> = (
  config: StateCreator<S>
) => (
  set: StoreApi<S>['setState'],
  get: StoreApi<S>['getState'],
  api: StoreApi<S>
) => S;

const log: Middleware<SharedType> = (config) => (set, get, api) =>
  config(
    (...args) => {
      console.log('  applying', args);
      set(...args);
      console.log('  new state', get());
    },
    get,
    api
  );

const store = createStore<SharedType>()(
  devtools(
    persist(
      immer(
        log((...a) => ({
          // @ts-ignore
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

// react store
export const useStore = getReactStore({
  initialState: {
    ...initialState,
    ...initialSharedState
  },
  store
});
