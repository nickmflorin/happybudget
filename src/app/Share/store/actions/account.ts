import { redux } from "lib";
import ActionType from "./ActionType";

export const setAccountIdAction = redux.actions.simpleAction<number>(ActionType.Budget.Account.SetId);
export const requestAccountAction = redux.actions.simpleAction<null>(ActionType.Budget.Account.Request);
export const loadingAccountAction = redux.actions.simpleAction<boolean>(ActionType.Budget.Account.Loading);
export const responseAccountAction = redux.actions.simpleAction<Model.Account | undefined>(
  ActionType.Budget.Account.Response
);
export const requestSubAccountsAction = redux.actions.simpleAction<null>(ActionType.Budget.Account.SubAccounts.Request);
export const loadingSubAccountsAction = redux.actions.simpleAction<boolean>(
  ActionType.Budget.Account.SubAccounts.Loading
);
export const responseSubAccountsAction = redux.actions.simpleAction<Http.ListResponse<Model.SubAccount>>(
  ActionType.Budget.Account.SubAccounts.Response
);
export const setSubAccountsSearchAction = redux.actions.simpleAction<string>(
  ActionType.Budget.Account.SubAccounts.SetSearch
);
export const requestGroupsAction = redux.actions.simpleAction<null>(ActionType.Budget.Account.Groups.Request);
export const loadingGroupsAction = redux.actions.simpleAction<boolean>(ActionType.Budget.Account.Groups.Loading);
export const responseGroupsAction = redux.actions.simpleAction<Http.ListResponse<Model.Group>>(
  ActionType.Budget.Account.Groups.Response
);
export const requestFringesAction = redux.actions.simpleAction<null>(ActionType.Budget.Account.Fringes.Request);
export const loadingFringesAction = redux.actions.simpleAction<boolean>(ActionType.Budget.Account.Fringes.Loading);
export const responseFringesAction = redux.actions.simpleAction<Http.ListResponse<Model.Fringe>>(
  ActionType.Budget.Account.Fringes.Response
);
