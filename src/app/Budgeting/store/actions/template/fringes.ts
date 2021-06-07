import { simpleAction } from "store/actions";
import ActionType from "../ActionType";

export const requestFringesAction = simpleAction<null>(ActionType.Template.Fringes.Request);
export const loadingFringesAction = simpleAction<boolean>(ActionType.Template.Fringes.Loading);
export const responseFringesAction = simpleAction<Http.ListResponse<Model.Fringe>>(
  ActionType.Template.Fringes.Response
);
export const clearFringesPlaceholdersToStateAction = simpleAction<null>(ActionType.Template.Fringes.Placeholders.Clear);
export const addFringesPlaceholdersToStateAction = simpleAction<number>(
  ActionType.Template.Fringes.Placeholders.AddToState
);
export const tableChangedAction = simpleAction<Table.Change<Table.FringeRow>>(ActionType.Template.Fringes.TableChanged);
export const removeFringeAction = simpleAction<number>(ActionType.Template.Fringes.Delete);
export const deletingFringeAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Template.Fringes.Deleting);
export const updatingFringeAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Template.Fringes.Updating);
export const creatingFringeAction = simpleAction<boolean>(ActionType.Template.Fringes.Creating);
export const setFringesSearchAction = simpleAction<string>(ActionType.Template.Fringes.SetSearch);
export const selectFringeAction = simpleAction<number>(ActionType.Template.Fringes.Select);
export const deselectFringeAction = simpleAction<number>(ActionType.Template.Fringes.Deselect);
export const selectAllFringesAction = simpleAction<null>(ActionType.Template.Fringes.SelectAll);

// Errors Functionality Needs to be Built Back In
export const addErrorsToStateAction = simpleAction<Table.CellError | Table.CellError[]>(
  ActionType.Template.Fringes.AddErrors
);

export const activatePlaceholderAction = simpleAction<Table.ActivatePlaceholderPayload<Model.Fringe>>(
  ActionType.Template.Fringes.Placeholders.Activate
);
export const removePlaceholderFromStateAction = simpleAction<number>(
  ActionType.Template.Fringes.Placeholders.RemoveFromState
);
export const updatePlaceholderInStateAction = simpleAction<Redux.UpdateModelActionPayload<Table.FringeRow>>(
  ActionType.Template.Fringes.Placeholders.UpdateInState
);

export const updateFringeInStateAction = simpleAction<Redux.UpdateModelActionPayload<Model.Fringe>>(
  ActionType.Template.Fringes.UpdateInState
);
export const removeFringeFromStateAction = simpleAction<number>(ActionType.Template.Fringes.RemoveFromState);
// Not currently used, because the reducer handles the logic, but we may need to use in the near future.
export const addFringeToStateAction = simpleAction<Model.Fringe>(ActionType.Template.Fringes.AddToState);
