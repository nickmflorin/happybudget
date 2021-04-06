import { isNil } from "lodash";
import { createSimpleReducerFromMap, mergeOptionsWithDefaults } from "./util";
import { MappedReducers, FactoryOptions } from ".";

export type ICounterActionMap = {
  Set: string;
  Increment: string;
  Decrement: string;
  Clear: string;
};

/**
 * A reducer factory that creates a generic reducer to handle the state of a
 * counter.
 *
 * The reducer has default behavior that is mapped to the action types via
 * the mappings parameter.
 *
 * @param mappings            Mappings of the standard actions to the specific actions that
 *                            the reducer should listen for.
 * @param options             Additional options supplied to the reducer factory.
 */
export const createCounterReducer = <A extends Redux.IAction<any> = Redux.IAction<any>>(
  mappings: Partial<ICounterActionMap>,
  options: Partial<FactoryOptions<number>>
) => {
  const Options = mergeOptionsWithDefaults<number, A>(options, 0);

  const transformers: MappedReducers<ICounterActionMap, number, A> = {
    Clear: () => 0,
    Increment: (st: number = 0, action: Redux.IAction<number | null>) =>
      !isNil(action.payload) ? st + action.payload : st + 1,
    Decrement: (st: number = 0, action: Redux.IAction<number | null>) =>
      !isNil(action.payload) ? Math.max(st - action.payload, 0) : Math.max(st - 1, 0),
    Set: (st: number = 0, action: Redux.IAction<number>) => action.payload
  };
  return createSimpleReducerFromMap<ICounterActionMap, number, A>(mappings, transformers, Options);
};
