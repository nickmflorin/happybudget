import { redux } from "lib";
import ActionType from "../ActionType";

export const handleTableChangeEventAction = redux.actions.simpleAction<
  Table.ChangeEvent<Tables.AccountRow, Model.Account>
>(ActionType.Template.Accounts.TableChanged);
export const deletingAccountAction = redux.actions.simpleAction<Redux.ModelListActionPayload>(
  ActionType.Template.Accounts.Deleting
);
export const updatingAccountAction = redux.actions.simpleAction<Redux.ModelListActionPayload>(
  ActionType.Template.Accounts.Updating
);
export const creatingAccountAction = redux.actions.simpleAction<boolean>(ActionType.Template.Accounts.Creating);
export const requestAccountsAction = redux.actions.simpleAction<null>(ActionType.Template.Accounts.Request);
export const loadingAccountsAction = redux.actions.simpleAction<boolean>(ActionType.Template.Accounts.Loading);
export const responseAccountsAction = redux.actions.simpleAction<Http.ListResponse<Model.Account>>(
  ActionType.Template.Accounts.Response
);
export const setAccountsSearchAction = redux.actions.simpleAction<string>(ActionType.Template.Accounts.SetSearch);
export const addAccountToStateAction = redux.actions.simpleAction<Model.Account>(
  ActionType.Template.Accounts.AddToState
);
export const requestGroupsAction = redux.actions.simpleAction<null>(ActionType.Template.Groups.Request);
export const loadingGroupsAction = redux.actions.simpleAction<boolean>(ActionType.Template.Groups.Loading);
export const responseGroupsAction = redux.actions.simpleAction<Http.ListResponse<Model.Group>>(
  ActionType.Template.Groups.Response
);
export const addGroupToStateAction = redux.actions.simpleAction<Model.Group>(ActionType.Template.Groups.AddToState);
export const updateGroupInStateAction = redux.actions.simpleAction<Redux.UpdateModelActionPayload<Model.Group>>(
  ActionType.Template.Groups.UpdateInState
);
export const deletingGroupAction = redux.actions.simpleAction<Redux.ModelListActionPayload>(
  ActionType.Template.Groups.Deleting
);
export const deleteGroupAction = redux.actions.simpleAction<number>(ActionType.Template.Groups.Delete);
