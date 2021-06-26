import { simpleAction } from "store/actions";
import ActionType from "../ActionType";

export const tableChangedAction = simpleAction<Table.Change<BudgetTable.TemplateAccountRow>>(
  ActionType.Template.Accounts.TableChanged
);
export const bulkCreateAccountsAction = simpleAction<Table.RowAddPayload<BudgetTable.TemplateAccountRow>>(
  ActionType.Template.Accounts.BulkCreate
);
export const deleteAccountsAction = simpleAction<number | number[]>(ActionType.Template.Accounts.Delete);
export const deletingAccountAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Template.Accounts.Deleting);
export const updatingAccountAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Template.Accounts.Updating);
export const creatingAccountAction = simpleAction<boolean>(ActionType.Template.Accounts.Creating);
export const requestAccountsAction = simpleAction<null>(ActionType.Template.Accounts.Request);
export const loadingAccountsAction = simpleAction<boolean>(ActionType.Template.Accounts.Loading);
export const responseAccountsAction = simpleAction<Http.ListResponse<Model.TemplateAccount>>(
  ActionType.Template.Accounts.Response
);
export const setAccountsSearchAction = simpleAction<string>(ActionType.Template.Accounts.SetSearch);
export const removeAccountFromGroupAction = simpleAction<number>(ActionType.Template.Accounts.RemoveFromGroup);
export const addAccountToGroupAction = simpleAction<{ id: number; group: number }>(
  ActionType.Template.Accounts.AddToGroup
);
export const removeAccountFromStateAction = simpleAction<number>(ActionType.Template.Accounts.RemoveFromState);
export const addAccountToStateAction = simpleAction<Model.TemplateAccount>(ActionType.Template.Accounts.AddToState);
export const requestGroupsAction = simpleAction<null>(ActionType.Template.Accounts.Groups.Request);
export const loadingGroupsAction = simpleAction<boolean>(ActionType.Template.Accounts.Groups.Loading);
export const responseGroupsAction = simpleAction<Http.ListResponse<Model.TemplateGroup>>(
  ActionType.Template.Accounts.Groups.Response
);
export const addGroupToStateAction = simpleAction<Model.TemplateGroup>(ActionType.Template.Accounts.Groups.AddToState);
export const updateGroupInStateAction = simpleAction<Redux.UpdateModelActionPayload<Model.TemplateGroup>>(
  ActionType.Template.Accounts.Groups.UpdateInState
);
export const removeGroupFromStateAction = simpleAction<number>(ActionType.Template.Accounts.Groups.RemoveFromState);
export const deletingGroupAction = simpleAction<Redux.ModelListActionPayload>(
  ActionType.Template.Accounts.Groups.Deleting
);
export const deleteGroupAction = simpleAction<number>(ActionType.Template.Accounts.Groups.Delete);
