import { tabling } from "lib";

type M = Model.Actual;
type R = Tables.ActualRowData;
type C = ActualsTableActionContext;
type S = Tables.ActualTableStore;

export const createAuthenticatedActualsTableReducer = (
  config: Table.AuthenticatedReducerConfig<R, M, S, C> & {
    readonly owners: Redux.Reducer<Redux.AuthenticatedModelListStore<Model.ActualOwner>, C>;
  }
): Redux.Reducer<S, C> => {
  const generic = tabling.reducers.createAuthenticatedTableReducer<R, M, S, C>(config);

  return (state: S | undefined = config.initialState, action: Redux.AnyPayloadAction<C>): S => {
    const newState = generic(state, action);
    return { ...newState, owners: config.owners(newState.owners, action) };
  };
};
