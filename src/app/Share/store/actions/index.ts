import { redux } from "lib";
import ActionType from "./ActionType";

export * as account from "./account";
export * as accounts from "./accounts";
export * as subAccount from "./subAccount";

export const wipeStateAction = redux.actions.simpleAction<null>(ActionType.Budget.WipeState);
export const setBudgetIdAction = redux.actions.simpleAction<number>(ActionType.Budget.SetId);
export const requestBudgetAction = redux.actions.simpleAction<null>(ActionType.Budget.Request);
export const loadingBudgetAction = redux.actions.simpleAction<boolean>(ActionType.Budget.Loading);
export const responseBudgetAction = redux.actions.simpleAction<Model.Budget | undefined>(ActionType.Budget.Response);
export const responseSubAccountUnitsAction = redux.actions.simpleAction<Http.ListResponse<Model.Tag>>(
  ActionType.SubAccountUnits.Response
);
export const loadingSubAccountUnitsAction = redux.actions.simpleAction<boolean>(ActionType.SubAccountUnits.Loading);

export default ActionType;
