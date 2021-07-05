import { simpleAction } from "store/actions";
import ActionType from "../ActionType";

export const requestFringesAction = simpleAction<null>(ActionType.Budget.Fringes.Request);
export const loadingFringesAction = simpleAction<boolean>(ActionType.Budget.Fringes.Loading);
export const responseFringesAction = simpleAction<Http.ListResponse<Model.Fringe>>(ActionType.Budget.Fringes.Response);
export const handleTableChangeEventAction = simpleAction<Table.ChangeEvent<BudgetTable.FringeRow>>(
  ActionType.Budget.Fringes.TableChanged
);
export const deletingFringeAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Budget.Fringes.Deleting);
export const updatingFringeAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Budget.Fringes.Updating);
export const creatingFringeAction = simpleAction<boolean>(ActionType.Budget.Fringes.Creating);
export const setFringesSearchAction = simpleAction<string>(ActionType.Budget.Fringes.SetSearch);
export const addFringeToStateAction = simpleAction<Model.Fringe>(ActionType.Budget.Fringes.AddToState);
