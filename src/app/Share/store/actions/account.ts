import { redux } from "lib";
import ActionType from "./ActionType";

export const requestAccountAction = redux.actions.createAction<number>(ActionType.Account.Request);
export const loadingAccountAction = redux.actions.createAction<boolean>(ActionType.Account.Loading);
export const responseAccountAction = redux.actions.createAction<Model.Account | null>(ActionType.Account.Response);

export const requestAction = redux.actions.createContextAction<
  Redux.TableRequestPayload,
  Tables.SubAccountTableContext
>(ActionType.Account.SubAccounts.Request);

export const loadingAction = redux.actions.createAction<boolean>(ActionType.Account.SubAccounts.Loading);
export const responseAction = redux.actions.createAction<Http.TableResponse<Model.SubAccount>>(
  ActionType.Account.SubAccounts.Response
);
export const setSearchAction = redux.actions.createContextAction<string, Tables.SubAccountTableContext>(
  ActionType.Account.SubAccounts.SetSearch
);
