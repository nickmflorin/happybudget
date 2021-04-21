import { simpleAction } from "store/actions";
import ActionType from "../ActionType";

export const setAccountIdAction = simpleAction<number>(ActionType.Template.Account.SetId);
export const requestAccountAction = simpleAction<null>(ActionType.Template.Account.Request);
export const loadingAccountAction = simpleAction<boolean>(ActionType.Template.Account.Loading);
export const responseAccountAction = simpleAction<Model.TemplateAccount | undefined>(
  ActionType.Template.Account.Response
);
// Not currently used, because the reducer handles the logic, but we may need to use in the near future.
export const updateAccountInStateAction = simpleAction<Partial<Redux.UpdateModelActionPayload<Model.TemplateAccount>>>(
  ActionType.Template.Account.UpdateInState
);
export const bulkUpdateAccountAction = simpleAction<Table.RowChange<Table.TemplateSubAccountRow>[]>(
  ActionType.Template.Account.BulkUpdate
);

/*
  Actions Pertaining to Account Sub Accounts
*/
export const updateSubAccountAction = simpleAction<Table.RowChange<Table.TemplateSubAccountRow>>(
  ActionType.Template.Account.SubAccounts.Update
);
export const removeSubAccountAction = simpleAction<number>(ActionType.Template.Account.SubAccounts.Remove);
export const deletingSubAccountAction = simpleAction<Redux.ModelListActionPayload>(
  ActionType.Template.Account.SubAccounts.Deleting
);
export const updatingSubAccountAction = simpleAction<Redux.ModelListActionPayload>(
  ActionType.Template.Account.SubAccounts.Updating
);
export const creatingSubAccountAction = simpleAction<boolean>(ActionType.Template.Account.SubAccounts.Creating);
export const requestSubAccountsAction = simpleAction<null>(ActionType.Template.Account.SubAccounts.Request);
export const loadingSubAccountsAction = simpleAction<boolean>(ActionType.Template.Account.SubAccounts.Loading);
export const responseSubAccountsAction = simpleAction<Http.ListResponse<Model.TemplateSubAccount>>(
  ActionType.Template.Account.SubAccounts.Response
);
export const setSubAccountsSearchAction = simpleAction<string>(ActionType.Template.Account.SubAccounts.SetSearch);
export const removeSubAccountFromGroupAction = simpleAction<number>(
  ActionType.Template.Account.SubAccounts.RemoveFromGroup
);
export const selectSubAccountAction = simpleAction<number>(ActionType.Template.Account.SubAccounts.Select);
export const deselectSubAccountAction = simpleAction<number>(ActionType.Template.Account.SubAccounts.Deselect);
export const selectAllSubAccountsAction = simpleAction<null>(ActionType.Template.Account.SubAccounts.SelectAll);

export const activatePlaceholderAction = simpleAction<Table.ActivatePlaceholderPayload<Model.TemplateSubAccount>>(
  ActionType.Template.Account.SubAccounts.Placeholders.Activate
);
export const removePlaceholderFromStateAction = simpleAction<number>(
  ActionType.Template.Account.SubAccounts.Placeholders.RemoveFromState
);
export const addPlaceholdersToStateAction = simpleAction<number>(
  ActionType.Template.Account.SubAccounts.Placeholders.AddToState
);
export const updatePlaceholderInStateAction = simpleAction<Redux.UpdateModelActionPayload<Table.TemplateSubAccountRow>>(
  ActionType.Template.Account.SubAccounts.Placeholders.UpdateInState
);

export const updateSubAccountInStateAction = simpleAction<Redux.UpdateModelActionPayload<Model.TemplateSubAccount>>(
  ActionType.Template.Account.SubAccounts.UpdateInState
);
export const removeSubAccountFromStateAction = simpleAction<number>(
  ActionType.Template.Account.SubAccounts.RemoveFromState
);
// Not currently used, because the reducer handles the logic, but we may need to use in the near future.
export const addSubAccountToStateAction = simpleAction<Model.TemplateSubAccount>(
  ActionType.Template.Account.SubAccounts.AddToState
);

// Errors Functionality Needs to be Built Back In
export const addErrorsToStateAction = simpleAction<Table.CellError | Table.CellError[]>(
  ActionType.Template.Account.SubAccounts.AddErrors
);

/*
  Actions Pertaining to Account Sub Accounts Groups
*/
export const requestGroupsAction = simpleAction<null>(ActionType.Template.Account.SubAccounts.Groups.Request);
export const loadingGroupsAction = simpleAction<boolean>(ActionType.Template.Account.SubAccounts.Groups.Loading);
export const responseGroupsAction = simpleAction<Http.ListResponse<Model.TemplateGroup>>(
  ActionType.Template.Account.SubAccounts.Groups.Response
);
export const addGroupToStateAction = simpleAction<Model.TemplateGroup>(
  ActionType.Template.Account.SubAccounts.Groups.AddToState
);
export const updateGroupInStateAction = simpleAction<Redux.UpdateModelActionPayload<Model.TemplateGroup>>(
  ActionType.Template.Account.SubAccounts.Groups.UpdateInState
);
export const removeGroupFromStateAction = simpleAction<number>(
  ActionType.Template.Account.SubAccounts.Groups.RemoveFromState
);
export const deletingGroupAction = simpleAction<Redux.ModelListActionPayload>(
  ActionType.Template.Account.SubAccounts.Groups.Deleting
);
export const deleteGroupAction = simpleAction<number>(ActionType.Template.Account.SubAccounts.Groups.Delete);
