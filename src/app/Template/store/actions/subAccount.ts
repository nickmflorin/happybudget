import { redux } from "lib";
import ActionType from "./ActionType";

export const updateInStateAction = redux.actions.createAction<Redux.UpdateActionPayload<Model.SubAccount>>(
  ActionType.SubAccount.UpdateInState
);

export const requestSubAccountAction = redux.actions.createAction<number>(ActionType.SubAccount.Request);
export const loadingSubAccountAction = redux.actions.createAction<boolean>(ActionType.SubAccount.Loading);
export const responseSubAccountAction = redux.actions.createAction<Model.SubAccount | null>(
  ActionType.SubAccount.Response
);

export const handleTableChangeEventAction = redux.actions.createContextAction<
  Table.ChangeEvent<Tables.SubAccountRowData, Model.SubAccount>,
  Tables.SubAccountTableContext
>(ActionType.SubAccount.SubAccounts.TableChanged);

export const savingTableAction = redux.actions.createAction<boolean>(ActionType.SubAccount.SubAccounts.Saving);
export const loadingAction = redux.actions.createAction<boolean>(ActionType.SubAccount.SubAccounts.Loading);

export const requestAction = redux.actions.createContextAction<
  Redux.TableRequestPayload,
  Tables.SubAccountTableContext
>(ActionType.SubAccount.SubAccounts.Request);

export const responseAction = redux.actions.createAction<Http.TableResponse<Model.SubAccount>>(
  ActionType.SubAccount.SubAccounts.Response
);
export const addModelsToStateAction = redux.actions.createAction<Redux.AddModelsToTablePayload<Model.SubAccount>>(
  ActionType.SubAccount.SubAccounts.AddToState
);

export const setSearchAction = redux.actions.createAction<string>(ActionType.SubAccount.SubAccounts.SetSearch);
