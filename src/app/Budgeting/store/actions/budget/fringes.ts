import { simpleAction } from "store/actions";
import ActionType from "../ActionType";

export const requestFringesAction = simpleAction<null>(ActionType.Budget.Fringes.Request);
export const loadingFringesAction = simpleAction<boolean>(ActionType.Budget.Fringes.Loading);
export const responseFringesAction = simpleAction<Http.ListResponse<Model.Fringe>>(ActionType.Budget.Fringes.Response);
export const clearFringesPlaceholdersToStateAction = simpleAction<null>(ActionType.Budget.Fringes.Placeholders.Clear);
export const addFringesPlaceholdersToStateAction = simpleAction<number>(
  ActionType.Budget.Fringes.Placeholders.AddToState
);
export const tableChangedAction = simpleAction<Table.Change<BudgetTable.FringeRow>>(
  ActionType.Budget.Fringes.TableChanged
);
export const removeFringeAction = simpleAction<number>(ActionType.Budget.Fringes.Delete);
export const deletingFringeAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Budget.Fringes.Deleting);
export const updatingFringeAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Budget.Fringes.Updating);
export const creatingFringeAction = simpleAction<boolean>(ActionType.Budget.Fringes.Creating);
export const setFringesSearchAction = simpleAction<string>(ActionType.Budget.Fringes.SetSearch);
export const selectFringeAction = simpleAction<number>(ActionType.Budget.Fringes.Select);
export const deselectFringeAction = simpleAction<number>(ActionType.Budget.Fringes.Deselect);
export const selectAllFringesAction = simpleAction<null>(ActionType.Budget.Fringes.SelectAll);
export const activatePlaceholderAction = simpleAction<Table.ActivatePlaceholderPayload<Model.Fringe>>(
  ActionType.Budget.Fringes.Placeholders.Activate
);
export const removePlaceholderFromStateAction = simpleAction<number>(
  ActionType.Budget.Fringes.Placeholders.RemoveFromState
);
export const updatePlaceholderInStateAction = simpleAction<Redux.UpdateModelActionPayload<BudgetTable.FringeRow>>(
  ActionType.Budget.Fringes.Placeholders.UpdateInState
);
export const updateFringeInStateAction = simpleAction<Redux.UpdateModelActionPayload<Model.Fringe>>(
  ActionType.Budget.Fringes.UpdateInState
);
export const removeFringeFromStateAction = simpleAction<number>(ActionType.Budget.Fringes.RemoveFromState);
// Not currently used, because the reducer handles the logic, but we may need to use in the near future.
export const addFringeToStateAction = simpleAction<Model.Fringe>(ActionType.Budget.Fringes.AddToState);
