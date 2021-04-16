import { simpleAction } from "store/actions";
import ActionType from "../ActionType";

export const bulkUpdateTemplateAccountsAction = simpleAction<Table.RowChange<Table.TemplateAccountRow>[]>(
  ActionType.Template.BulkUpdateAccounts
);

/*
  Actions Pertaining to Budget Accounts
*/
export const updateAccountAction = simpleAction<Table.RowChange<Table.TemplateAccountRow>>(
  ActionType.Template.Accounts.Update
);
export const removeAccountAction = simpleAction<number>(ActionType.Template.Accounts.Remove);
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

export const activatePlaceholderAction = simpleAction<Table.ActivatePlaceholderPayload<Model.TemplateAccount>>(
  ActionType.Template.Accounts.Placeholders.Activate
);
export const removePlaceholderFromStateAction = simpleAction<number>(
  ActionType.Template.Accounts.Placeholders.RemoveFromState
);
export const addPlaceholdersToStateAction = simpleAction<number>(ActionType.Template.Accounts.Placeholders.AddToState);
export const updatePlaceholderInStateAction = simpleAction<Table.TemplateAccountRow>(
  ActionType.Template.Accounts.Placeholders.UpdateInState
);

export const updateAccountInStateAction = simpleAction<Model.TemplateAccount>(
  ActionType.Template.Accounts.UpdateInState
);
export const removeAccountFromStateAction = simpleAction<number>(ActionType.Template.Accounts.RemoveFromState);
// Not currently used, because the reducer handles the logic, but we may need to use in the near future.
export const addAccountToStateAction = simpleAction<Model.TemplateAccount>(ActionType.Template.Accounts.AddToState);

// Errors Functionality Needs to be Built Back In
export const addErrorsToStateAction = simpleAction<Table.CellError | Table.CellError[]>(
  ActionType.Template.Accounts.AddErrors
);

/*
  Actiosn Pertaining to Account Sub Accounts Groups
*/
export const requestGroupsAction = simpleAction<null>(ActionType.Template.Accounts.Groups.Request);
export const loadingGroupsAction = simpleAction<boolean>(ActionType.Template.Accounts.Groups.Loading);
export const responseGroupsAction = simpleAction<Http.ListResponse<Model.TemplateGroup>>(
  ActionType.Template.Accounts.Groups.Response
);
export const addGroupToStateAction = simpleAction<Model.TemplateGroup>(ActionType.Template.Accounts.Groups.AddToState);
export const updateGroupInStateAction = simpleAction<Model.TemplateGroup>(
  ActionType.Template.Accounts.Groups.UpdateInState
);
export const removeGroupFromStateAction = simpleAction<number>(ActionType.Template.Accounts.Groups.RemoveFromState);
export const deletingGroupAction = simpleAction<Redux.ModelListActionPayload>(
  ActionType.Template.Accounts.Groups.Deleting
);
export const deleteGroupAction = simpleAction<number>(ActionType.Template.Accounts.Groups.Delete);
