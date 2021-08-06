import { redux } from "lib";
import ActionType from "../ActionType";

export const setAccountIdAction = redux.actions.simpleAction<number>(ActionType.Template.Account.SetId);
export const requestAccountAction = redux.actions.simpleAction<null>(ActionType.Template.Account.Request);
export const loadingAccountAction = redux.actions.simpleAction<boolean>(ActionType.Template.Account.Loading);
export const responseAccountAction = redux.actions.simpleAction<Model.Account | undefined>(
  ActionType.Template.Account.Response
);
export const updateAccountInStateAction = redux.actions.simpleAction<
  Partial<Redux.UpdateModelActionPayload<Model.Account>>
>(ActionType.Template.Account.UpdateInState);
export const handleTableChangeEventAction = redux.actions.simpleAction<
  Table.ChangeEvent<Tables.SubAccountRow, Model.SubAccount>
>(ActionType.Template.Account.TableChanged);
export const deletingSubAccountAction = redux.actions.simpleAction<Redux.ModelListActionPayload>(
  ActionType.Template.Account.SubAccounts.Deleting
);
export const updatingSubAccountAction = redux.actions.simpleAction<Redux.ModelListActionPayload>(
  ActionType.Template.Account.SubAccounts.Updating
);
export const creatingSubAccountAction = redux.actions.simpleAction<boolean>(
  ActionType.Template.Account.SubAccounts.Creating
);
export const requestSubAccountsAction = redux.actions.simpleAction<null>(
  ActionType.Template.Account.SubAccounts.Request
);
export const loadingSubAccountsAction = redux.actions.simpleAction<boolean>(
  ActionType.Template.Account.SubAccounts.Loading
);
export const responseSubAccountsAction = redux.actions.simpleAction<Http.ListResponse<Model.SubAccount>>(
  ActionType.Template.Account.SubAccounts.Response
);
export const setSubAccountsSearchAction = redux.actions.simpleAction<string>(
  ActionType.Template.Account.SubAccounts.SetSearch
);
export const addSubAccountToStateAction = redux.actions.simpleAction<Model.SubAccount>(
  ActionType.Template.Account.SubAccounts.AddToState
);
export const requestGroupsAction = redux.actions.simpleAction<null>(ActionType.Template.Account.Groups.Request);
export const loadingGroupsAction = redux.actions.simpleAction<boolean>(ActionType.Template.Account.Groups.Loading);
export const responseGroupsAction = redux.actions.simpleAction<Http.ListResponse<Model.Group>>(
  ActionType.Template.Account.Groups.Response
);
export const addGroupToStateAction = redux.actions.simpleAction<Model.Group>(
  ActionType.Template.Account.Groups.AddToState
);
export const updateGroupInStateAction = redux.actions.simpleAction<Redux.UpdateModelActionPayload<Model.Group>>(
  ActionType.Template.Account.Groups.UpdateInState
);
export const deletingGroupAction = redux.actions.simpleAction<Redux.ModelListActionPayload>(
  ActionType.Template.Account.Groups.Deleting
);
export const deleteGroupAction = redux.actions.simpleAction<number>(ActionType.Template.Account.Groups.Delete);
export const requestFringesAction = redux.actions.simpleAction<null>(ActionType.Template.Account.Fringes.Request);
export const loadingFringesAction = redux.actions.simpleAction<boolean>(ActionType.Template.Account.Fringes.Loading);
export const responseFringesAction = redux.actions.simpleAction<Http.ListResponse<Model.Fringe>>(
  ActionType.Template.Account.Fringes.Response
);
export const handleFringesTableChangeEventAction = redux.actions.simpleAction<
  Table.ChangeEvent<Tables.FringeRow, Model.Fringe>
>(ActionType.Template.Account.Fringes.TableChanged);
export const deletingFringeAction = redux.actions.simpleAction<Redux.ModelListActionPayload>(
  ActionType.Template.Account.Fringes.Deleting
);
export const updatingFringeAction = redux.actions.simpleAction<Redux.ModelListActionPayload>(
  ActionType.Template.Account.Fringes.Updating
);
export const creatingFringeAction = redux.actions.simpleAction<boolean>(ActionType.Template.Account.Fringes.Creating);
export const setFringesSearchAction = redux.actions.simpleAction<string>(ActionType.Template.Account.Fringes.SetSearch);
export const addFringeToStateAction = redux.actions.simpleAction<Model.Fringe>(
  ActionType.Template.Account.Fringes.AddToState
);
