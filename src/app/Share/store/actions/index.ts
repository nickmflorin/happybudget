import { createAction } from "@reduxjs/toolkit";
import ActionType from "./ActionType";

export * as account from "./account";
export * as accounts from "./accounts";
export * as subAccount from "./subAccount";

export { default as ActionType } from "./ActionType";

export const wipeStateAction = createAction<null>(ActionType.WipeState);
export const setBudgetIdAction = createAction<ID | null>(ActionType.SetId);
export const requestBudgetAction = createAction<null>(ActionType.Request);
export const loadingBudgetAction = createAction<boolean>(ActionType.Loading);
export const responseBudgetAction = createAction<Model.Budget | undefined>(ActionType.Response);

export const requestFringesAction = createAction<null>(ActionType.Fringes.Request);
export const loadingFringesAction = createAction<boolean>(ActionType.Fringes.Loading);
export const responseFringesAction = createAction<Http.TableResponse<Model.Fringe>>(ActionType.Fringes.Response);
export const setFringesSearchAction = createAction<string>(ActionType.Fringes.SetSearch);

export const responseSubAccountUnitsAction = createAction<Http.ListResponse<Model.Tag>>(
  ActionType.SubAccountUnits.Response
);

export const responseFringeColorsAction = createAction<Http.ListResponse<string>>(ActionType.FringeColors.Response);
