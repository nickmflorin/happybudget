import * as tabling from "../../tabling";

/* eslint-disable indent */
export const createAuthenticatedActualsTableReducer = (
  config: Table.ReducerConfig<
    Tables.ActualRowData,
    Model.Actual,
    Tables.ActualTableStore,
    Redux.AuthenticatedTableActionMap<Tables.ActualRowData, Model.Actual>
  > & {
    readonly ownerTree: Redux.Reducer<Redux.ModelListResponseStore<Model.OwnerTreeNode>>;
  }
): Redux.Reducer<Tables.ActualTableStore> => {
  type S = Tables.ActualTableStore;

  const generic = tabling.reducers.createAuthenticatedTableReducer<
    Tables.ActualRowData,
    Model.Actual,
    Tables.ActualTableStore
  >(config);

  return (state: S | undefined = config.initialState, action: Redux.Action<any>): S => {
    let newState = generic(state, action);
    return { ...newState, ownerTree: config.ownerTree(newState.ownerTree, action) };
  };
};
