import { redux } from "lib";
import ActionType from "./ActionType";

export * as account from "./account";
export * as accounts from "./accounts";
export * as subAccount from "./subAccount";

export { default as ActionType } from "./ActionType";

export const loadingBudgetAction = redux.actions.createAction<boolean>(ActionType.Loading);
export const responseBudgetAction = redux.actions.createAction<Model.Budget | null>(ActionType.Response);
export const requestBudgetAction = redux.actions.createAction<number>(ActionType.Request);

export const requestFringesAction = redux.actions.createContextAction<
  Redux.TableRequestPayload,
  Tables.FringeTableContext
>(ActionType.Fringes.Request);

export const loadingFringesAction = redux.actions.createAction<boolean>(ActionType.Fringes.Loading);
export const responseFringesAction = redux.actions.createAction<Http.TableResponse<Model.Fringe>>(
  ActionType.Fringes.Response
);
export const setFringesSearchAction = redux.actions.createAction<string>(ActionType.Fringes.SetSearch);

export const responseSubAccountUnitsAction = redux.actions.createAction<Http.ListResponse<Model.Tag>>(
  ActionType.SubAccountUnits.Response
);

export const responseFringeColorsAction = redux.actions.createAction<Http.ListResponse<string>>(
  ActionType.FringeColors.Response
);
