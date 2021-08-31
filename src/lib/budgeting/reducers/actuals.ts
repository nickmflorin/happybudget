import * as tabling from "../../tabling";

/* eslint-disable indent */
export const createAuthenticatedActualsTableReducer = (
  config: Redux.TableReducerConfig<
    Tables.ActualRowData,
    Model.Actual,
    Model.Group,
    Tables.ActualTableStore,
    Redux.AuthenticatedTableActionMap<Tables.ActualRowData, Model.Actual>
  > & {
    readonly subAccountsTree: Redux.Reducer<Redux.ModelListResponseStore<Model.SubAccountTreeNode>>;
  }
): Redux.Reducer<Tables.ActualTableStore> => {
  type S = Tables.ActualTableStore;

  const generic = tabling.reducers.createAuthenticatedTableReducer<
    Tables.ActualRowData,
    Model.Actual,
    Model.Group,
    Tables.ActualTableStore
  >(config);

  return (state: S | undefined = config.initialState, action: Redux.Action<any>): S => {
    let newState = generic(state, action);
    return { ...newState, subAccountsTree: config.subAccountsTree(newState.subAccountsTree, action) };
  };
};
