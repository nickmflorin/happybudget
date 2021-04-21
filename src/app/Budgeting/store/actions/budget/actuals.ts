import { simpleAction } from "store/actions";
import ActionType from "../ActionType";

export const bulkUpdateBudgetActualsAction = simpleAction<Table.RowChange<Table.ActualRow>[]>(
  ActionType.Budget.BulkUpdateActuals
);

export const updateActualAction = simpleAction<Table.RowChange<Table.ActualRow>>(ActionType.Budget.Actuals.Update);
export const removeActualAction = simpleAction<number>(ActionType.Budget.Actuals.Remove);
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

// Errors Functionality Needs to be Built Back In
export const addErrorsToStateAction = simpleAction<Table.CellError | Table.CellError[]>(
  ActionType.Budget.Actuals.AddErrors
);

export const activatePlaceholderAction = simpleAction<Table.ActivatePlaceholderPayload<Model.Actual>>(
  ActionType.Budget.Actuals.Placeholders.Activate
);
export const removePlaceholderFromStateAction = simpleAction<number>(
  ActionType.Budget.Actuals.Placeholders.RemoveFromState
);
export const addPlaceholdersToStateAction = simpleAction<number>(ActionType.Budget.Actuals.Placeholders.AddToState);
export const updatePlaceholderInStateAction = simpleAction<Redux.UpdateModelActionPayload<Table.ActualRow>>(
  ActionType.Budget.Actuals.Placeholders.UpdateInState
);

export const updateActualInStateAction = simpleAction<Redux.UpdateModelActionPayload<Model.Actual>>(
  ActionType.Budget.Actuals.UpdateInState
);
export const removeActualFromStateAction = simpleAction<number>(ActionType.Budget.Actuals.RemoveFromState);
// Not currently used, because the reducer handles the logic, but we may need to use in the near future.
export const addActualToStateAction = simpleAction<Model.Actual>(ActionType.Budget.Actuals.AddToState);
