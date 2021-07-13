import { simpleAction } from "store/actions";
import ActionType from "../ActionType";

export const handleTableChangeEventAction = simpleAction<Table.ChangeEvent<BudgetTable.AccountRow, Model.Account>>(
  ActionType.Template.Accounts.TableChanged
);
export const deletingAccountAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Template.Accounts.Deleting);
export const updatingAccountAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Template.Accounts.Updating);
export const creatingAccountAction = simpleAction<boolean>(ActionType.Template.Accounts.Creating);
export const requestAccountsAction = simpleAction<null>(ActionType.Template.Accounts.Request);
export const loadingAccountsAction = simpleAction<boolean>(ActionType.Template.Accounts.Loading);
export const responseAccountsAction = simpleAction<Http.ListResponse<Model.Account>>(
  ActionType.Template.Accounts.Response
);
export const setAccountsSearchAction = simpleAction<string>(ActionType.Template.Accounts.SetSearch);
export const removeAccountFromGroupAction = simpleAction<number>(ActionType.Template.Accounts.RemoveFromGroup);
export const addAccountToGroupAction = simpleAction<{ id: number; group: number }>(
  ActionType.Template.Accounts.AddToGroup
);
export const addAccountToStateAction = simpleAction<Model.Account>(ActionType.Template.Accounts.AddToState);
export const requestGroupsAction = simpleAction<null>(ActionType.Template.Accounts.Groups.Request);
export const loadingGroupsAction = simpleAction<boolean>(ActionType.Template.Accounts.Groups.Loading);
export const responseGroupsAction = simpleAction<Http.ListResponse<Model.Group>>(
  ActionType.Template.Accounts.Groups.Response
);
export const addGroupToStateAction = simpleAction<Model.Group>(ActionType.Template.Accounts.Groups.AddToState);
export const updateGroupInStateAction = simpleAction<Redux.UpdateModelActionPayload<Model.Group>>(
  ActionType.Template.Accounts.Groups.UpdateInState
);
export const removeGroupFromStateAction = simpleAction<number>(ActionType.Template.Accounts.Groups.RemoveFromState);
export const deletingGroupAction = simpleAction<Redux.ModelListActionPayload>(
  ActionType.Template.Accounts.Groups.Deleting
);
export const deleteGroupAction = simpleAction<number>(ActionType.Template.Accounts.Groups.Delete);
