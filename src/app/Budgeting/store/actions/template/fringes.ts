import { simpleAction } from "store/actions";
import ActionType from "../ActionType";

export const requestFringesAction = simpleAction<null>(ActionType.Template.Fringes.Request);
export const loadingFringesAction = simpleAction<boolean>(ActionType.Template.Fringes.Loading);
export const responseFringesAction = simpleAction<Http.ListResponse<Model.Fringe>>(
  ActionType.Template.Fringes.Response
);
export const tableChangedAction = simpleAction<Table.Change<BudgetTable.FringeRow>>(
  ActionType.Template.Fringes.TableChanged
);
export const bulkCreateFringesAction = simpleAction<number>(ActionType.Template.Fringes.BulkCreate);
export const removeFringeAction = simpleAction<number>(ActionType.Template.Fringes.Delete);
export const deletingFringeAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Template.Fringes.Deleting);
export const updatingFringeAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Template.Fringes.Updating);
export const creatingFringeAction = simpleAction<boolean>(ActionType.Template.Fringes.Creating);
export const setFringesSearchAction = simpleAction<string>(ActionType.Template.Fringes.SetSearch);
export const selectFringeAction = simpleAction<number>(ActionType.Template.Fringes.Select);
export const deselectFringeAction = simpleAction<number>(ActionType.Template.Fringes.Deselect);
export const selectAllFringesAction = simpleAction<null>(ActionType.Template.Fringes.SelectAll);
export const updateFringeInStateAction = simpleAction<Redux.UpdateModelActionPayload<Model.Fringe>>(
  ActionType.Template.Fringes.UpdateInState
);
export const removeFringeFromStateAction = simpleAction<number>(ActionType.Template.Fringes.RemoveFromState);
// Not currently used, because the reducer handles the logic, but we may need to use in the near future.
export const addFringeToStateAction = simpleAction<Model.Fringe>(ActionType.Template.Fringes.AddToState);
