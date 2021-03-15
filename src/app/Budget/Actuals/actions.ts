import { simpleAction } from "store/actions";

export const ActionType = {
  Deleting: "actuals.Deleting",
  Creating: "actuals.Creating",
  Updating: "actuals.Updating",
  Update: "actuals.Update",
  Remove: "actuals.Remove",
  BudgetItems: {
    Loading: "actuals.budgetitems.Loading",
    Response: "actuals.budgetitems.Response",
    Request: "actuals.budgetitems.Request"
  },
  BudgetItemsTree: {
    Loading: "actuals.budgetitemstree.Loading",
    Response: "actuals.budgetitemstree.Response",
    Request: "actuals.budgetitemstree.Request"
  },
  ActualsTable: {
    AddPlaceholders: "actuals.table.AddPlaceholders",
    UpdateRow: "actuals.table.UpdateRow",
    ActivatePlaceholder: "actuals.table.ActivatePlaceholder",
    RemoveRow: "actuals.table.RemoveRow",
    SelectRow: "actuals.table.SelectRow",
    SelectAllRows: "actuals.table.SelectAllRows",
    DeselectRow: "actuals.table.DeselectRow",
    Loading: "actuals.table.Loading",
    SetSearch: "actuals.table.SetSearch",
    Response: "actuals.table.Response",
    Request: "actuals.table.Request",
    AddErrors: "actuals.table.AddErrors"
  }
};

export const addActualsTablePlaceholdersAction = simpleAction<number>(ActionType.ActualsTable.AddPlaceholders);
export const updateActualAction = simpleAction<{
  id: number;
  data: Partial<Http.IActualPayload>;
}>(ActionType.Update);
export const updateActualsTableRowAction = simpleAction<{ id: number; data: Partial<Table.IActualRow> }>(
  ActionType.ActualsTable.UpdateRow
);
export const activateActualsPlaceholderAction = simpleAction<Table.IActivatePlaceholderPayload>(
  ActionType.ActualsTable.ActivatePlaceholder
);
export const selectActualsTableRowAction = simpleAction<number>(ActionType.ActualsTable.SelectRow);
export const selectAllActualsTableRowsAction = simpleAction<null>(ActionType.ActualsTable.SelectAllRows);
export const deselectActualsTableRowAction = simpleAction<number>(ActionType.ActualsTable.DeselectRow);
export const removeActualsTableRowAction = simpleAction<Table.IActualRow>(ActionType.ActualsTable.RemoveRow);
export const removeActualAction = simpleAction<Table.IActualRow>(ActionType.Remove);
export const deletingActualAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Deleting);
export const updatingActualAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Updating);
export const creatingActualAction = simpleAction<boolean>(ActionType.Creating);
export const requestActualsAction = simpleAction<null>(ActionType.ActualsTable.Request);
export const loadingActualsAction = simpleAction<boolean>(ActionType.ActualsTable.Loading);
export const responseActualsAction = simpleAction<Http.IListResponse<IActual>>(ActionType.ActualsTable.Response);
export const setActualsSearchAction = simpleAction<string>(ActionType.ActualsTable.SetSearch);
export const addErrorsToActualsTableAction = simpleAction<Table.ICellError | Table.ICellError[]>(
  ActionType.ActualsTable.AddErrors
);

export const requestBudgetItemsAction = simpleAction<null>(ActionType.BudgetItems.Request);
export const loadingBudgetItemsAction = simpleAction<boolean>(ActionType.BudgetItems.Loading);
export const responseBudgetItemsAction = simpleAction<Http.IListResponse<IBudgetItem>>(ActionType.BudgetItems.Response);

export const requestBudgetItemsTreeAction = simpleAction<null>(ActionType.BudgetItemsTree.Request);
export const loadingBudgetItemsTreeAction = simpleAction<boolean>(ActionType.BudgetItemsTree.Loading);
export const responseBudgetItemsTreeAction = simpleAction<Http.IListResponse<IBudgetItemNode>>(
  ActionType.BudgetItemsTree.Response
);
