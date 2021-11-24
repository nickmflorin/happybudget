import { tabling } from "lib";

type M = Model.Actual;
type R = Tables.ActualRowData;

export type ActualTableActionMap = Redux.AuthenticatedTableActionMap<R, M> & {
  readonly responseActualTypes: Http.ListResponse<Model.Tag>;
};

/* eslint-disable indent */
export const createAuthenticatedActualsTableReducer = (
  config: Table.ReducerConfig<R, M, Tables.ActualTableStore, ActualTableActionMap> & {
    readonly owners: Redux.Reducer<Redux.AuthenticatedModelListResponseStore<Model.ActualOwner>>;
  }
): Redux.Reducer<Tables.ActualTableStore> => {
  type S = Tables.ActualTableStore;

  const generic = tabling.reducers.createAuthenticatedTableReducer<R, M, Tables.ActualTableStore>(config);

  return (state: S | undefined = config.initialState, action: Redux.Action<any>): S => {
    let newState = generic(state, action);
    if (action.type === config.actions.responseActualTypes.toString()) {
      const payload: Http.ListResponse<Model.Tag> = action.payload;
      newState = { ...newState, types: payload.data };
    }
    return { ...newState, owners: config.owners(newState.owners, action) };
  };
};
