import { redux } from "lib";
import ActionType from "../ActionType";

export const requestSubAccountsTreeAction = redux.actions.simpleAction<null>(ActionType.Budget.SubAccountsTree.Request);
export const loadingSubAccountsTreeAction = redux.actions.simpleAction<boolean>(
  ActionType.Budget.SubAccountsTree.Loading
);
export const responseSubAccountsTreeAction = redux.actions.simpleAction<Http.ListResponse<Model.SubAccountTreeNode>>(
  ActionType.Budget.SubAccountsTree.Response
);
export const restoreSubAccountsTreeSearchCacheAction = redux.actions.simpleAction<null>(
  ActionType.Budget.SubAccountsTree.RestoreSearchCache
);
export const handleTableChangeEventAction = redux.actions.simpleAction<
  Table.ChangeEvent<Tables.ActualRow, Model.Actual>
>(ActionType.Budget.Actuals.TableChanged);
export const setSubAccountsTreeSearchAction = redux.actions.simpleAction<string>(
  ActionType.Budget.SubAccountsTree.SetSearch
);
export const deletingActualAction = redux.actions.simpleAction<Redux.ModelListActionPayload>(
  ActionType.Budget.Actuals.Deleting
);
export const updatingActualAction = redux.actions.simpleAction<Redux.ModelListActionPayload>(
  ActionType.Budget.Actuals.Updating
);
export const creatingActualAction = redux.actions.simpleAction<boolean>(ActionType.Budget.Actuals.Creating);
export const requestActualsAction = redux.actions.simpleAction<null>(ActionType.Budget.Actuals.Request);
export const loadingActualsAction = redux.actions.simpleAction<boolean>(ActionType.Budget.Actuals.Loading);
export const responseActualsAction = redux.actions.simpleAction<Http.ListResponse<Model.Actual>>(
  ActionType.Budget.Actuals.Response
);
export const setActualsSearchAction = redux.actions.simpleAction<string>(ActionType.Budget.Actuals.SetSearch);
export const addActualToStateAction = redux.actions.simpleAction<Model.Actual>(ActionType.Budget.Actuals.AddToState);
