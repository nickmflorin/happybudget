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
export const tableChangedAction = simpleAction<Table.Change<BudgetTable.ActualRow>>(
  ActionType.Budget.Actuals.TableChanged
);
export const bulkCreateActualsAction = simpleAction<Table.RowAddPayload<BudgetTable.ActualRow>>(
  ActionType.Budget.Actuals.BulkCreate
);
export const setSubAccountsTreeSearchAction = simpleAction<string>(ActionType.Budget.SubAccountsTree.SetSearch);
export const removeActualAction = simpleAction<number>(ActionType.Budget.Actuals.Delete);
export const deletingActualAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Budget.Actuals.Deleting);
export const updatingActualAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Budget.Actuals.Updating);
export const creatingActualAction = simpleAction<boolean>(ActionType.Budget.Actuals.Creating);
export const requestActualsAction = simpleAction<null>(ActionType.Budget.Actuals.Request);
export const loadingActualsAction = simpleAction<boolean>(ActionType.Budget.Actuals.Loading);
export const responseActualsAction = simpleAction<Http.ListResponse<Model.Actual>>(ActionType.Budget.Actuals.Response);
export const setActualsSearchAction = simpleAction<string>(ActionType.Budget.Actuals.SetSearch);
export const selectActualAction = simpleAction<number>(ActionType.Budget.Actuals.Select);
export const deselectActualAction = simpleAction<number>(ActionType.Budget.Actuals.Deselect);
export const selectAllActualsAction = simpleAction<null>(ActionType.Budget.Actuals.SelectAll);
export const updateActualInStateAction = simpleAction<Redux.UpdateModelActionPayload<Model.Actual>>(
  ActionType.Budget.Actuals.UpdateInState
);
export const removeActualFromStateAction = simpleAction<number>(ActionType.Budget.Actuals.RemoveFromState);
// Not currently used, because the reducer handles the logic, but we may need to use in the near future.
export const addActualToStateAction = simpleAction<Model.Actual>(ActionType.Budget.Actuals.AddToState);
