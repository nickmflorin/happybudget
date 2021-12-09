import { modelListActionReducer } from "lib/redux/reducers";

export * from "./util";
export * from "./detail";
export * from "./list";

export const createSimplePayloadReducer = <P>(config: Redux.ReducerConfig<P, { set: P }>): Redux.Reducer<P> => {
  const reducer: Redux.Reducer<P> = (state: P = config.initialState, action: Redux.Action<P>): P => {
    if (config.actions.set.toString() === action.type) {
      return action.payload;
    }
    return state;
  };
  return reducer;
};

export const createSimpleBooleanReducer = (
  config: Omit<Redux.ReducerConfig<boolean, { set: boolean }>, "initialState">
): Redux.Reducer<boolean> => createSimplePayloadReducer<boolean>({ ...config, initialState: false });

/**
 * A reducer factory that creates a generic reducer to handle the state of a
 * list of primary keys that indicate that certain behavior is taking place for
 * the models corresponding to the primary keys of the list.  For instance, if
 * we wanted to keep track of the Accounts that are actively being updated, the
 * reducer would handle the state of a list of primary keys corresponding to the
 * Accounts that are being updated.
 *
 * The reducer has default behavior that is mapped to the action types via
 * the mappings parameter.
 *
 * @param mappings  Mappings of the standard actions to the specific actions that
 *                  the reducer should listen for.
 * @param options   Additional options supplied to the reducer factory.
 */
export const createModelListActionReducer =
  (
    config: Omit<
      Redux.ReducerConfig<Redux.ModelListActionStore, { change: Redux.ModelListActionPayload }>,
      "initialState"
    >
  ) =>
  /* eslint-disable indent */
  (st: Redux.ModelListActionStore = [], action: Redux.Action<Redux.ModelListActionPayload>) => {
    if (config.actions.change.toString() === action.type) {
      return modelListActionReducer(st, action);
    }
    return st;
  };
