import { createAction } from "@reduxjs/toolkit";
import ActionType from "./ActionType";

export const requestAction = createAction<Redux.TableRequestPayload>(ActionType.Accounts.Request);
export const loadingAction = createAction<boolean>(ActionType.Accounts.Loading);
export const responseAction = createAction<Http.TableResponse<Model.Account>>(ActionType.Accounts.Response);
export const setSearchAction = createAction<string>(ActionType.Accounts.SetSearch);
