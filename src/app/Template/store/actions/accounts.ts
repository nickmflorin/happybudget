import { redux } from "lib";
import ActionType from "./ActionType";

export const handleTableChangeEventAction = redux.actions.createContextAction<
  Table.ChangeEvent<Tables.AccountRowData, Model.Account>,
  Tables.AccountTableContext
>(ActionType.Accounts.TableChanged);

export const savingTableAction = redux.actions.createAction<boolean>(ActionType.Accounts.Saving);
export const requestAction = redux.actions.createContextAction<Redux.TableRequestPayload, Tables.AccountTableContext>(
  ActionType.Accounts.Request
);
export const loadingAction = redux.actions.createAction<boolean>(ActionType.Accounts.Loading);
export const responseAction = redux.actions.createAction<Http.TableResponse<Model.Account>>(
  ActionType.Accounts.Response
);
export const setSearchAction = redux.actions.createAction<string>(ActionType.Accounts.SetSearch);
export const addModelsToStateAction = redux.actions.createAction<Redux.AddModelsToTablePayload<Model.Account>>(
  ActionType.Accounts.AddToState
);
