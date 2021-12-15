import { redux } from "lib";
import ActionType from "./ActionType";

export * as account from "./account";
export * as accounts from "./accounts";
export * as subAccount from "./subAccount";

export { default as ActionType } from "./ActionType";

export const loadingBudgetAction = redux.actions.createAction<boolean>(ActionType.Loading);
export const responseBudgetAction = redux.actions.createAction<Model.Template | null>(ActionType.Response);
export const requestBudgetAction = redux.actions.createAction<number>(ActionType.Request);

export const updateBudgetInStateAction = redux.actions.createAction<Redux.UpdateActionPayload<Model.Template>>(
  ActionType.UpdateInState
);
export const loadingFringesAction = redux.actions.createAction<boolean>(ActionType.Fringes.Loading);
export const requestFringesAction = redux.actions.createContextAction<
  Redux.TableRequestPayload,
  Tables.FringeTableContext
>(ActionType.Fringes.Request);
export const responseFringesAction = redux.actions.createAction<Http.TableResponse<Model.Fringe>>(
  ActionType.Fringes.Response
);
export const handleFringesTableChangeEventAction = redux.actions.createContextAction<
  Table.ChangeEvent<Tables.FringeRowData, Model.Fringe>,
  Tables.FringeTableContext
>(ActionType.Fringes.TableChanged);

export const savingFringesTableAction = redux.actions.createAction<boolean>(ActionType.Fringes.Saving);
export const setFringesSearchAction = redux.actions.createAction<string>(ActionType.Fringes.SetSearch);
export const addFringeModelsToStateAction = redux.actions.createAction<Redux.AddModelsToTablePayload<Model.Fringe>>(
  ActionType.Fringes.AddToState
);

export const responseSubAccountUnitsAction = redux.actions.createAction<Http.ListResponse<Model.Tag>>(
  ActionType.SubAccountUnits.Response
);
export const responseFringeColorsAction = redux.actions.createAction<Http.ListResponse<string>>(
  ActionType.FringeColors.Response
);
