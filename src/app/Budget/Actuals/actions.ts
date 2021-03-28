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
    Select: "calculator.actuals.Select",
    Deselect: "calculator.actuals.Deselect",
    SelectAll: "calculator.actuals.SelectAll",
    Loading: "actuals.actuals.Loading",
    SetSearch: "actuals.actuals.SetSearch",
    Response: "actuals.actuals.Response",
    Request: "actuals.actuals.Request",
    UpdateInState: "calculator.actuals.UpdateInState",
    RemoveFromState: "calculator.actuals.RemoveFromState",
    AddToState: "calculator.actuals.AddToState",
    // Errors Functionality Needs to be Built Back In
    AddErrors: "actuals.actuals.AddErrors",
    Placeholders: {
      AddToState: "calculator.actuals.placeholders.AddToState",
      Activate: "calculator.actuals.placeholders.Activate",
      UpdateInState: "calculator.actuals.placeholders.UpdateInState",
      RemoveFromState: "calculator.actuals.placeholders.RemoveFromState"
    }
  }
};

export const updateActualAction = simpleAction<Table.RowChange>(ActionType.Actuals.Update);
export const removeActualAction = simpleAction<number>(ActionType.Actuals.Remove);
export const deletingActualAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Actuals.Deleting);
export const updatingActualAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Actuals.Updating);
export const creatingActualAction = simpleAction<boolean>(ActionType.Actuals.Creating);
export const requestActualsAction = simpleAction<null>(ActionType.Actuals.Request);
export const loadingActualsAction = simpleAction<boolean>(ActionType.Actuals.Loading);
export const responseActualsAction = simpleAction<Http.IListResponse<IActual>>(ActionType.Actuals.Response);
export const setActualsSearchAction = simpleAction<string>(ActionType.Actuals.SetSearch);
export const selectActualAction = simpleAction<number>(ActionType.Actuals.Select);
export const deselectActualAction = simpleAction<number>(ActionType.Actuals.Deselect);
export const selectAllActualsAction = simpleAction<null>(ActionType.Actuals.SelectAll);

// Errors Functionality Needs to be Built Back In
export const addErrorsToStateAction = simpleAction<Table.CellError | Table.CellError[]>(ActionType.Actuals.AddErrors);

export const activatePlaceholderAction = simpleAction<Table.ActivatePlaceholderPayload<IActual>>(
  ActionType.Actuals.Placeholders.Activate
);
export const removePlaceholderFromStateAction = simpleAction<number>(ActionType.Actuals.Placeholders.RemoveFromState);
export const addPlaceholdersToStateAction = simpleAction<number>(ActionType.Actuals.Placeholders.AddToState);
export const updatePlaceholderInStateAction = simpleAction<Table.ActualRow>(
  ActionType.Actuals.Placeholders.UpdateInState
);

export const addActualToStateAction = simpleAction<IActual>(ActionType.Actuals.AddToState);
export const updateActualInStateAction = simpleAction<IActual>(ActionType.Actuals.UpdateInState);
export const removeActualFromStateAction = simpleAction<number>(ActionType.Actuals.RemoveFromState);

export const requestBudgetItemsAction = simpleAction<null>(ActionType.BudgetItems.Request);
export const loadingBudgetItemsAction = simpleAction<boolean>(ActionType.BudgetItems.Loading);
export const responseBudgetItemsAction = simpleAction<Http.IListResponse<IBudgetItem>>(ActionType.BudgetItems.Response);

export const requestBudgetItemsTreeAction = simpleAction<null>(ActionType.BudgetItemsTree.Request);
export const loadingBudgetItemsTreeAction = simpleAction<boolean>(ActionType.BudgetItemsTree.Loading);
export const responseBudgetItemsTreeAction = simpleAction<Http.IListResponse<IBudgetItemNode>>(
  ActionType.BudgetItemsTree.Response
);
