import { redux } from "lib";
import ActionType from "./ActionType";

export const requestAccountsAction = redux.actions.simpleAction<null>(ActionType.Budget.Accounts.Request);
export const loadingAccountsAction = redux.actions.simpleAction<boolean>(ActionType.Budget.Accounts.Loading);
export const responseAccountsAction = redux.actions.simpleAction<Http.ListResponse<Model.Account>>(
  ActionType.Budget.Accounts.Response
);
export const setAccountsSearchAction = redux.actions.simpleAction<string>(ActionType.Budget.Accounts.SetSearch);
export const requestGroupsAction = redux.actions.simpleAction<null>(ActionType.Budget.Groups.Request);
export const loadingGroupsAction = redux.actions.simpleAction<boolean>(ActionType.Budget.Groups.Loading);
export const responseGroupsAction = redux.actions.simpleAction<Http.ListResponse<Model.Group>>(
  ActionType.Budget.Groups.Response
);
