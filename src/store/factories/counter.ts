import { isNil } from "lodash";
import { createSimpleReducerFromTransformers, mergeOptionsWithDefaults } from "./util";

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
  mappings: Partial<ReducerFactory.ICounterActionMap>,
  options: Partial<ReducerFactory.IOptions<number>> = { initialState: 0, referenceEntity: "entity" }
) => {
  const Options = mergeOptionsWithDefaults<number, A>(options, 0);

  const transformers: ReducerFactory.Transformers<ReducerFactory.ICounterActionMap, number, A> = {
    Clear: () => 0,
    Increment: (payload: number | undefined, st: number) => (!isNil(payload) ? st + payload : st + 1),
    Decrement: (payload: number | undefined, st: number) =>
      !isNil(payload) ? Math.max(st - payload, 0) : Math.max(st - 1, 0),
    Set: (payload: number) => payload
  };
  return createSimpleReducerFromTransformers<ReducerFactory.ICounterActionMap, number, A>(
    mappings,
    transformers,
    Options
  );
};
