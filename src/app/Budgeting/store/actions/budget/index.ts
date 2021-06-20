import { simpleAction } from "store/actions";
import ActionType from "../ActionType";

export const wipeStateAction = simpleAction<null>(ActionType.Budget.WipeState);
export const setBudgetIdAction = simpleAction<number>(ActionType.Budget.SetId);
export const setBudgetAutoIndex = simpleAction<boolean>(ActionType.Budget.SetAutoIndex);
export const requestBudgetAction = simpleAction<null>(ActionType.Budget.Request);
export const loadingBudgetAction = simpleAction<boolean>(ActionType.Budget.Loading);
export const responseBudgetAction = simpleAction<Model.Budget | undefined>(ActionType.Budget.Response);
export const setCommentsHistoryDrawerVisibilityAction = simpleAction<boolean>(
  ActionType.Budget.SetCommentsHistoryDrawerVisibility
);
