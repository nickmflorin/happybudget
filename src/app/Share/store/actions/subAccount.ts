import { redux } from "lib";
import ActionType from "./ActionType";

export const setSubAccountIdAction = redux.actions.simpleAction<number>(ActionType.Budget.SubAccount.SetId);
export const requestSubAccountAction = redux.actions.simpleAction<null>(ActionType.Budget.SubAccount.Request);
export const loadingSubAccountAction = redux.actions.simpleAction<boolean>(ActionType.Budget.SubAccount.Loading);
export const responseSubAccountAction = redux.actions.simpleAction<Model.SubAccount | undefined>(
  ActionType.Budget.SubAccount.Response
);
export const requestSubAccountsAction = redux.actions.simpleAction<null>(
  ActionType.Budget.SubAccount.SubAccounts.Request
);
export const loadingSubAccountsAction = redux.actions.simpleAction<boolean>(
  ActionType.Budget.SubAccount.SubAccounts.Loading
);
export const responseSubAccountsAction = redux.actions.simpleAction<Http.ListResponse<Model.SubAccount>>(
  ActionType.Budget.SubAccount.SubAccounts.Response
);
export const setSubAccountsSearchAction = redux.actions.simpleAction<string>(
  ActionType.Budget.SubAccount.SubAccounts.SetSearch
);
export const requestGroupsAction = redux.actions.simpleAction<null>(ActionType.Budget.SubAccount.Groups.Request);
export const loadingGroupsAction = redux.actions.simpleAction<boolean>(ActionType.Budget.SubAccount.Groups.Loading);
export const responseGroupsAction = redux.actions.simpleAction<Http.ListResponse<Model.Group>>(
  ActionType.Budget.SubAccount.Groups.Response
);
export const requestFringesAction = redux.actions.simpleAction<null>(ActionType.Budget.SubAccount.Fringes.Request);
export const loadingFringesAction = redux.actions.simpleAction<boolean>(ActionType.Budget.SubAccount.Fringes.Loading);
export const responseFringesAction = redux.actions.simpleAction<Http.ListResponse<Model.Fringe>>(
  ActionType.Budget.SubAccount.Fringes.Response
);
