import * as tabling from "../../tabling";

type M = Model.Actual;
type R = Tables.ActualRowData;
type ACTION = Redux.TableAction<Redux.ActionPayload, Tables.ActualTableContext>;

export type ActualTableActionMap = Redux.AuthenticatedTableActionMap<R, M, Tables.ActualTableContext> & {
  readonly responseActualTypes: Redux.ActionCreator<Http.ListResponse<Model.Tag>>;
};

export const createAuthenticatedActualsTableReducer = (
  config: Table.ReducerConfig<R, M, Tables.ActualTableStore, Tables.ActualTableContext, ActualTableActionMap> & {
    readonly owners: Redux.Reducer<Redux.AuthenticatedModelListResponseStore<Model.ActualOwner>, ACTION>;
  }
): Redux.Reducer<Tables.ActualTableStore, ACTION> => {
  type S = Tables.ActualTableStore;

  const generic = tabling.reducers.createAuthenticatedTableReducer<
    R,
    M,
    Tables.ActualTableStore,
    Tables.ActualTableContext,
    ActualTableActionMap,
    ACTION
  >(config);

  return (state: S | undefined = config.initialState, action: ACTION): S => {
    let newState = generic(state, action);
    if (action.type === config.actions.responseActualTypes.toString()) {
      const payload: Http.ListResponse<Model.Tag> = action.payload;
      newState = { ...newState, types: payload.data };
    }
    return { ...newState, owners: config.owners(newState.owners, action) };
  };
};
