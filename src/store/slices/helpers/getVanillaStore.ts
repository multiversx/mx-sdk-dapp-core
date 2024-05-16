import { storage } from 'constants/storage';
import { createStore } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { GetSetType } from './../helpers/types';

const getStore = <T>({
  definitionFunc,
  name
}: {
  definitionFunc: (...a: Parameters<GetSetType<T>>) => T;
  name: string;
}) =>
  createStore<T>()(
    devtools(
      persist(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore:next-line
        immer((...a) => definitionFunc(...a)),
        {
          name,
          storage
        }
      )
    )
  );

type GetDefinitionType<T> = {
  definition: (set: GetSetType<T>) => T;
  middleware?: Array<(...args: any) => any>;
};

// Definition function combining definition and handleLogout
const getDefinition =
  <T>({ definition, middleware = [] }: GetDefinitionType<T>) =>
  (...a: Parameters<GetSetType<T>>) => {
    const appliedMiddleware = middleware.reduce((acc, current) => {
      acc = {
        ...acc,
        ...current(...a)
      };
      return acc;
    }, {});

    return {
      ...definition(...(a as Parameters<typeof definition>)),
      ...appliedMiddleware
    };
  };

export const getVanillaStore = <T>({
  name,
  definition,
  middleware = []
}: GetDefinitionType<T> & { name: string }) =>
  getStore({
    definitionFunc: getDefinition({ definition, middleware }),
    name
  });
