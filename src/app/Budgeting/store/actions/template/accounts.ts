import { simpleAction } from "store/actions";
import ActionType from "../ActionType";

export const bulkUpdateAccountsAction = simpleAction<Table.RowChange<Table.TemplateAccountRow>[]>(
  ActionType.Template.BulkUpdate
);
export const bulkCreateAccountsAction = simpleAction<number>(ActionType.Template.BulkCreate);

export const updateAccountAction = simpleAction<Table.RowChange<Table.TemplateAccountRow>>(
  ActionType.Template.Accounts.Update
);
export const removeAccountAction = simpleAction<number>(ActionType.Template.Accounts.Delete);
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
export const selectAccountAction = simpleAction<number>(ActionType.Template.Accounts.Select);
export const deselectAccountAction = simpleAction<number>(ActionType.Template.Accounts.Deselect);
export const selectAllAccountsAction = simpleAction<null>(ActionType.Template.Accounts.SelectAll);

export const updateAccountInStateAction = simpleAction<Redux.UpdateModelActionPayload<Model.TemplateAccount>>(
  ActionType.Template.Accounts.UpdateInState
);
export const removeAccountFromStateAction = simpleAction<number>(ActionType.Template.Accounts.RemoveFromState);
export const addAccountToStateAction = simpleAction<Model.TemplateAccount>(ActionType.Template.Accounts.AddToState);

// Errors Functionality Needs to be Built Back In
export const addErrorsToStateAction = simpleAction<Table.CellError | Table.CellError[]>(
  ActionType.Template.Accounts.AddErrors
);
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
