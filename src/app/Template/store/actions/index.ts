import { createAction } from "@reduxjs/toolkit";
import ActionType from "./ActionType";

export * as account from "./account";
export * as accounts from "./accounts";
export * as subAccount from "./subAccount";

export { default as ActionType } from "./ActionType";

export const wipeStateAction = createAction<null>(ActionType.WipeState);
export const setTemplateIdAction = createAction<number | null>(ActionType.SetId);
export const loadingTemplateAction = createAction<boolean>(ActionType.Loading);
export const responseTemplateAction = createAction<Model.Template | null>(ActionType.Response);
export const updateTemplateInStateAction = createAction<Redux.UpdateActionPayload<Model.Template>>(
  ActionType.UpdateInState
);

export const requestFringesAction = createAction<Redux.TableRequestPayload>(ActionType.Fringes.Request);
export const loadingFringesAction = createAction<boolean>(ActionType.Fringes.Loading);
export const responseFringesAction = createAction<Http.TableResponse<Model.Fringe>>(ActionType.Fringes.Response);
export const handleFringesTableChangeEventAction = createAction<Table.ChangeEvent<Tables.FringeRowData>>(
  ActionType.Fringes.TableChanged
);
export const savingFringesTableAction = createAction<boolean>(ActionType.Fringes.Saving);
export const setFringesSearchAction = createAction<string>(ActionType.Fringes.SetSearch);
export const addFringeModelsToStateAction = createAction<Redux.AddModelsToTablePayload<Model.Fringe>>(
  ActionType.Fringes.AddToState
);
export const responseSubAccountUnitsAction = createAction<Http.ListResponse<Model.Tag>>(
  ActionType.SubAccountUnits.Response
);
export const clearFringesAction = createAction<null>(ActionType.Fringes.Clear);
export const responseFringeColorsAction = createAction<Http.ListResponse<string>>(ActionType.FringeColors.Response);
