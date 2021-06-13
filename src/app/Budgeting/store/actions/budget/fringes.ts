import { simpleAction } from "store/actions";
import ActionType from "../ActionType";

export const requestFringesAction = simpleAction<null>(ActionType.Budget.Fringes.Request);
export const loadingFringesAction = simpleAction<boolean>(ActionType.Budget.Fringes.Loading);
export const responseFringesAction = simpleAction<Http.ListResponse<Model.Fringe>>(ActionType.Budget.Fringes.Response);
export const tableChangedAction = simpleAction<Table.Change<BudgetTable.FringeRow>>(
  ActionType.Budget.Fringes.TableChanged
);
export const bulkCreateFringesAction = simpleAction<number>(ActionType.Budget.Fringes.BulkCreate);
export const removeFringeAction = simpleAction<number>(ActionType.Budget.Fringes.Delete);
export const deletingFringeAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Budget.Fringes.Deleting);
export const updatingFringeAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Budget.Fringes.Updating);
export const creatingFringeAction = simpleAction<boolean>(ActionType.Budget.Fringes.Creating);
export const setFringesSearchAction = simpleAction<string>(ActionType.Budget.Fringes.SetSearch);
export const selectFringeAction = simpleAction<number>(ActionType.Budget.Fringes.Select);
export const deselectFringeAction = simpleAction<number>(ActionType.Budget.Fringes.Deselect);
export const selectAllFringesAction = simpleAction<null>(ActionType.Budget.Fringes.SelectAll);
export const updateFringeInStateAction = simpleAction<Redux.UpdateModelActionPayload<Model.Fringe>>(
  ActionType.Budget.Fringes.UpdateInState
);
export const removeFringeFromStateAction = simpleAction<number>(ActionType.Budget.Fringes.RemoveFromState);
// Not currently used, because the reducer handles the logic, but we may need to use in the near future.
export const addFringeToStateAction = simpleAction<Model.Fringe>(ActionType.Budget.Fringes.AddToState);
