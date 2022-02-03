import { redux } from "lib";

export * as account from "./account";
export * as accounts from "./accounts";
export * as subAccount from "./subAccount";

export const loadingBudgetAction = redux.actions.createAction<boolean>("template.Loading");
export const responseBudgetAction = redux.actions.createAction<Model.Template | null>("template.Response");
export const requestBudgetAction = redux.actions.createAction<number>("template.Request");

export const updateBudgetInStateAction =
  redux.actions.createAction<Redux.UpdateActionPayload<Model.Template>>("template.UpdateInState");
export const loadingFringesAction = redux.actions.createAction<boolean>("template.fringes.Loading");
export const requestFringesAction = redux.actions.createTableAction<
  Redux.TableRequestPayload,
  Tables.FringeTableContext
>("template.fringes.Request");
export const responseFringesAction =
  redux.actions.createAction<Http.TableResponse<Model.Fringe>>("template.fringes.Response");
export const handleFringesTableChangeEventAction = redux.actions.createTableAction<
  Table.ChangeEvent<Tables.FringeRowData, Model.Fringe>,
  Tables.FringeTableContext
>("template.fringes.TableChanged");

export const setFringesSearchAction = redux.actions.createTableAction<string, Tables.FringeTableContext>(
  "template.fringes.SetSearch"
);
export const addFringeModelsToStateAction = redux.actions.createAction<Redux.AddModelsToTablePayload<Model.Fringe>>(
  "template.fringes.AddModelsToState"
);

export const responseSubAccountUnitsAction = redux.actions.createAction<Http.ListResponse<Model.Tag>>(
  "template.subaccountunits.Response"
);
export const responseFringeColorsAction = redux.actions.createAction<Http.ListResponse<string>>(
  "template.fringecolors.Response"
);
