// import { GetSetType } from './types';

// export const getAction = <T, A extends Record<string, (...args: any) => any>>(
//   set: GetSetType<T>,
//   actions: A,
//   keys: Record<keyof A, string>
// ) => {
//   type CreateSetterReturnType<K extends keyof typeof actions> = {
//     [P in K]: (...args: Parameters<(typeof actions)[P]>) => void;
//   };

//   const wrapper = <K extends keyof typeof actions>(
//     name: K,
//     func: (state: T, ...args: Parameters<(typeof actions)[K]>) => void
//   ): CreateSetterReturnType<K> =>
//     ({
//       [name]: (...args: Parameters<(typeof actions)[K]>) =>
//         set((state) => func(state, ...args), false, { type: keys[name] })
//     }) as CreateSetterReturnType<K>;

//   return wrapper;
// };
import { GetSetType } from './types';

export const getAction = <T, A extends Record<string, (...args: any) => any>>(
  set: GetSetType<T>,
  actions: A,
  keys: Record<keyof A, string>
) => {
  type CreateSetterReturnType<K extends keyof typeof actions> = {
    [P in K]: (...args: Parameters<(typeof actions)[P]>) => void;
  };

  const wrapper = <K extends keyof typeof actions>(actionObj: {
    [P in K]: (state: T, ...args: Parameters<(typeof actions)[P]>) => void;
  }): CreateSetterReturnType<K> => {
    const name = Object.keys(actionObj)[0] as K;
    const func = Object.values(actionObj)[0] as (
      state: T,
      ...args: Parameters<(typeof actions)[K]>
    ) => void;

    return {
      [name]: (...args: Parameters<(typeof actions)[K]>) =>
        set((state) => func(state, ...args), false, { type: keys[name] })
    } as CreateSetterReturnType<K>;
  };

  return wrapper;
};
