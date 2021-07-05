import { simpleAction } from "store/actions";
import ActionType from "../ActionType";

export const requestFringesAction = simpleAction<null>(ActionType.Template.Fringes.Request);
export const loadingFringesAction = simpleAction<boolean>(ActionType.Template.Fringes.Loading);
export const responseFringesAction = simpleAction<Http.ListResponse<Model.Fringe>>(
  ActionType.Template.Fringes.Response
);
export const handleTableChangeEventAction = simpleAction<Table.ChangeEvent<BudgetTable.FringeRow>>(
  ActionType.Template.Fringes.TableChanged
);
export const deletingFringeAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Template.Fringes.Deleting);
export const updatingFringeAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Template.Fringes.Updating);
export const creatingFringeAction = simpleAction<boolean>(ActionType.Template.Fringes.Creating);
export const setFringesSearchAction = simpleAction<string>(ActionType.Template.Fringes.SetSearch);
export const addFringeToStateAction = simpleAction<Model.Fringe>(ActionType.Template.Fringes.AddToState);
