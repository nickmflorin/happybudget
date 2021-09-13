import { createAction } from "@reduxjs/toolkit";
import ActionType from "./ActionType";

export const requestAction = createAction<null>(ActionType.Accounts.Request);
export const loadingAction = createAction<boolean>(ActionType.Accounts.Loading);
export const responseAction = createAction<Http.TableResponse<Model.Account, Model.BudgetGroup>>(
  ActionType.Accounts.Response
);
export const clearAction = createAction<null>(ActionType.Accounts.Clear);
export const setSearchAction = createAction<string>(ActionType.Accounts.SetSearch);
