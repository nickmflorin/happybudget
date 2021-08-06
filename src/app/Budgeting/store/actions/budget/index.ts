import { redux } from "lib";
import ActionType from "../ActionType";

export const wipeStateAction = redux.actions.simpleAction<null>(ActionType.Budget.WipeState);
export const setBudgetIdAction = redux.actions.simpleAction<number>(ActionType.Budget.SetId);
export const setBudgetAutoIndex = redux.actions.simpleAction<boolean>(ActionType.Budget.SetAutoIndex);
export const requestBudgetAction = redux.actions.simpleAction<null>(ActionType.Budget.Request);
export const loadingBudgetAction = redux.actions.simpleAction<boolean>(ActionType.Budget.Loading);
export const responseBudgetAction = redux.actions.simpleAction<Model.Budget | undefined>(ActionType.Budget.Response);
export const setCommentsHistoryDrawerVisibilityAction = redux.actions.simpleAction<boolean>(
  ActionType.Budget.SetCommentsHistoryDrawerVisibility
);
export const updateBudgetInStateAction = redux.actions.simpleAction<Partial<Model.Budget>>(
  ActionType.Budget.UpdateInState
);
