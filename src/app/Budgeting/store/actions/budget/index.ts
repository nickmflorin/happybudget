import { simpleAction } from "store/actions";
import ActionType from "../ActionType";

export const setBudgetIdAction = simpleAction<number>(ActionType.Budget.SetId);
export const setInstanceAction = simpleAction<Model.BudgetAccount | Model.BudgetSubAccount | null>(
  ActionType.Budget.SetInstance
);
export const requestBudgetAction = simpleAction<null>(ActionType.Budget.Request);
export const loadingBudgetAction = simpleAction<boolean>(ActionType.Budget.Loading);
export const responseBudgetAction = simpleAction<Model.Budget | undefined>(ActionType.Budget.Response);
export const setCommentsHistoryDrawerVisibilityAction = simpleAction<boolean>(
  ActionType.Budget.SetCommentsHistoryDrawerVisibility
);

export const loadingBudgetItemsAction = simpleAction<boolean>(ActionType.Budget.BudgetItems.Loading);
export const responseBudgetItemsAction = simpleAction<Http.ListResponse<Model.BudgetLineItem>>(
  ActionType.Budget.BudgetItems.Response
);

export const loadingBudgetItemsTreeAction = simpleAction<boolean>(ActionType.Budget.BudgetItemsTree.Loading);
export const responseBudgetItemsTreeAction = simpleAction<Http.ListResponse<Model.AccountTreeNode>>(
  ActionType.Budget.BudgetItemsTree.Response
);

export const loadingFringesAction = simpleAction<boolean>(ActionType.Budget.Fringes.Loading);
export const responseFringesAction = simpleAction<Http.ListResponse<Model.Fringe>>(ActionType.Budget.Fringes.Response);
export const clearFringesPlaceholdersToStateAction = simpleAction<null>(ActionType.Budget.Fringes.Placeholders.Clear);
export const addFringesPlaceholdersToStateAction = simpleAction<number>(
  ActionType.Budget.Fringes.Placeholders.AddToState
);
