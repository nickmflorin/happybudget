import { simpleAction } from "store/actions";

export const ActionType = {
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
  Actuals: {
    Deleting: "actuals.actuals.Deleting",
    Creating: "actuals.actuals.Creating",
    Updating: "actuals.actuals.Updating",
    Update: "actuals.actuals.Update",
    Remove: "actuals.actuals.Remove",
    AddPlaceholders: "actuals.actuals.AddPlaceholders",
    UpdateRow: "actuals.actuals.UpdateRow",
    ActivatePlaceholder: "actuals.actuals.ActivatePlaceholder",
    RemoveRow: "actuals.actuals.RemoveRow",
    SelectRow: "actuals.actuals.SelectRow",
    SelectAllRows: "actuals.actuals.SelectAllRows",
    DeselectRow: "actuals.actuals.DeselectRow",
    Loading: "actuals.actuals.Loading",
    SetSearch: "actuals.actuals.SetSearch",
    Response: "actuals.actuals.Response",
    Request: "actuals.actuals.Request",
    AddErrors: "actuals.actuals.AddErrors"
  }
};

export const addPlaceholdersAction = simpleAction<number>(ActionType.Actuals.AddPlaceholders);
export const updateActualAction = simpleAction<Table.RowChange>(ActionType.Actuals.Update);
export const updateTableRowAction = simpleAction<{ id: number; data: Partial<Table.ActualRow> }>(
  ActionType.Actuals.UpdateRow
);
export const activatePlaceholderAction = simpleAction<Table.IActivatePlaceholderPayload>(
  ActionType.Actuals.ActivatePlaceholder
);
export const selectRowAction = simpleAction<number>(ActionType.Actuals.SelectRow);
export const selectAllRowsAction = simpleAction<null>(ActionType.Actuals.SelectAllRows);
export const deselectRowAction = simpleAction<number>(ActionType.Actuals.DeselectRow);
export const removeTableRowAction = simpleAction<Table.ActualRow>(ActionType.Actuals.RemoveRow);
export const removeActualAction = simpleAction<Table.ActualRow>(ActionType.Actuals.Remove);
export const deletingActualAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Actuals.Deleting);
export const updatingActualAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Actuals.Updating);
export const creatingActualAction = simpleAction<boolean>(ActionType.Actuals.Creating);
export const requestActualsAction = simpleAction<null>(ActionType.Actuals.Request);
export const loadingActualsAction = simpleAction<boolean>(ActionType.Actuals.Loading);
export const responseActualsAction = simpleAction<Http.IListResponse<IActual>>(ActionType.Actuals.Response);
export const setSearchAction = simpleAction<string>(ActionType.Actuals.SetSearch);
export const addErrorsToTableAction = simpleAction<Table.CellError | Table.CellError[]>(ActionType.Actuals.AddErrors);

export const requestBudgetItemsAction = simpleAction<null>(ActionType.BudgetItems.Request);
export const loadingBudgetItemsAction = simpleAction<boolean>(ActionType.BudgetItems.Loading);
export const responseBudgetItemsAction = simpleAction<Http.IListResponse<IBudgetItem>>(ActionType.BudgetItems.Response);

export const requestBudgetItemsTreeAction = simpleAction<null>(ActionType.BudgetItemsTree.Request);
export const loadingBudgetItemsTreeAction = simpleAction<boolean>(ActionType.BudgetItemsTree.Loading);
export const responseBudgetItemsTreeAction = simpleAction<Http.IListResponse<IBudgetItemNode>>(
  ActionType.BudgetItemsTree.Response
);
