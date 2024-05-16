import { getKeys } from './getKeys';
import { GetSetType } from './types';

// Define a function getActions that takes a set function and a set of actions, and returns a function to create wrapped actions
export const getActions = <T, A extends Record<string, (...args: any) => any>>({
  set,
  actions,
  shouldReplace = false
}: {
  set: GetSetType<T>;
  actions: A;
  shouldReplace?: boolean;
}) => {
  type ActionType = typeof actions;

  // Define the return type for the wrapped actions
  type CreateSetterReturnType<K extends keyof ActionType> = {
    [P in K]: (...args: Parameters<ActionType[P]>) => void;
  };

  const keys = getKeys(actions); // Generate a mapping of action names to keys using the getKeys helper function

  // Define a wrapper function that takes an object with action implementations and returns wrapped actions
  const actionsCreator = <K extends keyof ActionType>(actionObj: {
    [P in K]: (state: T, ...args: Parameters<ActionType[P]>) => void;
  }): CreateSetterReturnType<K> => {
    // Initialize the result object to store the wrapped actions
    const result = {} as CreateSetterReturnType<K>;

    // Iterate over each action in the provided action object
    for (const name in actionObj) {
      const func = actionObj[name]; // Get the action implementation function

      // Create a wrapped function for each action that sets the state and dispatches an action type
      result[name] = (...args: Parameters<ActionType[K]>) =>
        set((state) => func(state, ...args), shouldReplace, {
          type: keys[name]
        });
    }

    return result;
  };

  // Return the wrapper function from getActions
  return actionsCreator;
};
