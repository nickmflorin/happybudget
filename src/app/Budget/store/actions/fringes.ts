import { simpleAction } from "store/actions";
import ActionType from "./ActionType";

export const bulkUpdateBudgetFringesAction = simpleAction<Table.RowChange<Table.FringeRow>[]>(
  ActionType.Budget.BulkUpdateFringes
);

export const updateFringeAction = simpleAction<Table.RowChange<Table.FringeRow>>(ActionType.Budget.Fringes.Update);
export const removeFringeAction = simpleAction<number>(ActionType.Budget.Fringes.Remove);
export const deletingFringeAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Budget.Fringes.Deleting);
export const updatingFringeAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Budget.Fringes.Updating);
export const creatingFringeAction = simpleAction<boolean>(ActionType.Budget.Fringes.Creating);
export const setFringesSearchAction = simpleAction<string>(ActionType.Budget.Fringes.SetSearch);
export const selectFringeAction = simpleAction<number>(ActionType.Budget.Fringes.Select);
export const deselectFringeAction = simpleAction<number>(ActionType.Budget.Fringes.Deselect);
export const selectAllFringesAction = simpleAction<null>(ActionType.Budget.Fringes.SelectAll);

// Errors Functionality Needs to be Built Back In
export const addErrorsToStateAction = simpleAction<Table.CellError | Table.CellError[]>(
  ActionType.Budget.Fringes.AddErrors
);

export const activatePlaceholderAction = simpleAction<Table.ActivatePlaceholderPayload<IFringe>>(
  ActionType.Budget.Fringes.Placeholders.Activate
);
export const removePlaceholderFromStateAction = simpleAction<number>(
  ActionType.Budget.Fringes.Placeholders.RemoveFromState
);
export const updatePlaceholderInStateAction = simpleAction<Table.FringeRow>(
  ActionType.Budget.Fringes.Placeholders.UpdateInState
);

export const updateFringeInStateAction = simpleAction<IFringe>(ActionType.Budget.Fringes.UpdateInState);
export const removeFringeFromStateAction = simpleAction<number>(ActionType.Budget.Fringes.RemoveFromState);
// Not currently used, because the reducer handles the logic, but we may need to use in the near future.
export const addFringeToStateAction = simpleAction<IFringe>(ActionType.Budget.Fringes.AddToState);
