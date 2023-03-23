import { isNil } from "lodash";

import { tabling, http } from "lib";

import createEventReducer from "./createEventReducer";

export const createPublicTableReducer =
  <
    R extends Table.RowData,
    M extends model.RowTypedApiModel = model.RowTypedApiModel,
    S extends Redux.TableStore<R> = Redux.TableStore<R>,
    C extends Redux.ActionContext = Redux.ActionContext,
  >(
    config: Table.ReducerConfig<R, M, S, C, Redux.TableActionCreatorMap<M, C>>,
  ): Redux.Reducer<S, C> =>
  (state: S | undefined = config.initialState, action: Redux.AnyPayloadAction<C>): S => {
    let newState = { ...state };
    if (action.type === config.actions.response.toString()) {
      const a: Redux.InferAction<typeof config.actions.response> = action;
      /*
			The response was received so the results will not be invalidated
      unless a subsequent action to invalidate them is received. */
      newState = { ...newState, responseWasReceived: true, invalidated: false };
      if (http.tableResponseFailed(a.payload)) {
        return {
          ...newState,
          error: a.payload,
          data: tabling.rows.generateTableData<R, M>({
            ...config,
            response: { models: [], groups: [], markups: [] },
          }),
        };
      } else {
        return {
          ...newState,
          error: null,
          data: tabling.rows.generateTableData<R, M>({
            ...config,
            response: a.payload,
          }),
        };
      }
    } else if (action.type === config.actions.setSearch.toString()) {
      const a: Redux.InferAction<typeof config.actions.setSearch> = action;
      return { ...newState, search: a.payload };
    } else if (
      !isNil(config.actions.invalidate) &&
      action.type === config.actions.invalidate.toString()
    ) {
      return { ...newState, invalidated: true };
    }
    return newState;
  };

export const createAuthenticatedTableReducer = <
  R extends Table.RowData,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
  C extends Redux.ActionContext = Redux.ActionContext,
>(
  config: Table.AuthenticatedReducerConfig<R, M, S, C> & {
    readonly getModelRowChildren?: (m: M) => number[];
  },
): Redux.DynamicReducer<S, Redux.RecalculateRowReducerCallback<S, R>, C> => {
  const tableEventReducer = createEventReducer<R, M, S, C>(config);
  const generic = createPublicTableReducer<R, M, S, C>(config);

  return (
    state: S | undefined = config.initialState,
    action: Redux.AnyPayloadAction<C>,
    recalculateRow?: Redux.RecalculateRowReducerCallback<S, R>,
  ): S => {
    const newState = generic(state, action);
    if (action.type === config.actions.handleEvent.toString()) {
      const a: Redux.Action<Table.Event<R, M, Table.EditableRow<R>>, C> = action;
      return tableEventReducer(newState, a.payload, recalculateRow);
    }
    return newState;
  };
};
