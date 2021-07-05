import { simpleAction } from "store/actions";
import ActionType from "../ActionType";

export const requestSubAccountsTreeAction = simpleAction<null>(ActionType.Budget.SubAccountsTree.Request);
export const loadingSubAccountsTreeAction = simpleAction<boolean>(ActionType.Budget.SubAccountsTree.Loading);
export const responseSubAccountsTreeAction = simpleAction<Http.ListResponse<Model.SubAccountTreeNode>>(
  ActionType.Budget.SubAccountsTree.Response
);
export const restoreSubAccountsTreeSearchCacheAction = simpleAction<null>(
  ActionType.Budget.SubAccountsTree.RestoreSearchCache
);
export const handleTableChangeEventAction = simpleAction<Table.ChangeEvent<BudgetTable.ActualRow>>(
  ActionType.Budget.Actuals.TableChanged
);
export const setSubAccountsTreeSearchAction = simpleAction<string>(ActionType.Budget.SubAccountsTree.SetSearch);
export const deletingActualAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Budget.Actuals.Deleting);
export const updatingActualAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Budget.Actuals.Updating);
export const creatingActualAction = simpleAction<boolean>(ActionType.Budget.Actuals.Creating);
export const requestActualsAction = simpleAction<null>(ActionType.Budget.Actuals.Request);
export const loadingActualsAction = simpleAction<boolean>(ActionType.Budget.Actuals.Loading);
export const responseActualsAction = simpleAction<Http.ListResponse<Model.Actual>>(ActionType.Budget.Actuals.Response);
export const setActualsSearchAction = simpleAction<string>(ActionType.Budget.Actuals.SetSearch);
export const addActualToStateAction = simpleAction<Model.Actual>(ActionType.Budget.Actuals.AddToState);
