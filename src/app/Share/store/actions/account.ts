import { createAction } from "@reduxjs/toolkit";
import ActionType from "./ActionType";

export const setAccountIdAction = createAction<number | null>(ActionType.Account.SetId);
export const requestAccountAction = createAction<null>(ActionType.Account.Request);
export const loadingAccountAction = createAction<boolean>(ActionType.Account.Loading);
export const responseAccountAction = createAction<Model.Account | null>(ActionType.Account.Response);

export const requestAction = createAction<Redux.TableRequestPayload>(ActionType.Account.SubAccounts.Request);
export const loadingAction = createAction<boolean>(ActionType.Account.SubAccounts.Loading);
export const responseAction = createAction<Http.TableResponse<Model.SubAccount>>(
  ActionType.Account.SubAccounts.Response
);
export const setSearchAction = createAction<string>(ActionType.Account.SubAccounts.SetSearch);
