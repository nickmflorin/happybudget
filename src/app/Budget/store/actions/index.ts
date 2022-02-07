import { redux } from "lib";

export * as account from "./account";
export * as accounts from "./accounts";
export * as actuals from "./actuals";
export * as pdf from "./pdf";
export * as subAccount from "./subAccount";
export * as analysis from "./analysis";

export const loadingBudgetAction = redux.actions.createAction<boolean>("budget.Loading");
export const responseBudgetAction = redux.actions.createAction<Model.Budget | null>("budget.Response");
export const requestBudgetAction = redux.actions.createAction<number>("budget.Request");

export const updateBudgetInStateAction =
  redux.actions.createAction<Redux.UpdateActionPayload<Model.Budget>>("budget.UpdateInState");
export const loadingFringesAction = redux.actions.createAction<boolean>("budget.fringes.Loading");
export const requestFringesAction = redux.actions.createContextAction<
  Redux.TableRequestPayload,
  Tables.FringeTableContext
>("budget.fringes.Request");
export const responseFringesAction =
  redux.actions.createAction<Http.TableResponse<Model.Fringe>>("budget.fringes.Response");
export const handleFringesTableChangeEventAction = redux.actions.createContextAction<
  Table.ChangeEvent<Tables.FringeRowData, Model.Fringe>,
  Tables.FringeTableContext
>("budget.fringes.TableChanged");

export const setFringesSearchAction = redux.actions.createContextAction<string, Tables.FringeTableContext>(
  "budget.fringes.SetSearch"
);
export const addFringeModelsToStateAction = redux.actions.createAction<Redux.AddModelsToTablePayload<Model.Fringe>>(
  "budget.fringes.AddModelsToState"
);
export const responseSubAccountUnitsAction = redux.actions.createAction<Http.ListResponse<Model.Tag>>(
  "budget.subaccountunits.Response"
);
export const responseFringeColorsAction =
  redux.actions.createAction<Http.ListResponse<string>>("budget.fringecolors.Response");
