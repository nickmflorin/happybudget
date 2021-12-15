import { redux } from "lib";
import ActionType from "./ActionType";

export const requestAction = redux.actions.createContextAction<Redux.TableRequestPayload, Tables.AccountTableContext>(
  ActionType.Accounts.Request
);
export const loadingAction = redux.actions.createAction<boolean>(ActionType.Accounts.Loading);
export const responseAction = redux.actions.createAction<Http.TableResponse<Model.Account>>(
  ActionType.Accounts.Response
);
export const setSearchAction = redux.actions.createAction<string>(ActionType.Accounts.SetSearch);
