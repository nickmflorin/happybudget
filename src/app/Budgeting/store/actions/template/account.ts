import { simpleAction } from "store/actions";
import ActionType from "../ActionType";

export const setAccountIdAction = simpleAction<number>(ActionType.Template.Account.SetId);
export const requestAccountAction = simpleAction<null>(ActionType.Template.Account.Request);
export const loadingAccountAction = simpleAction<boolean>(ActionType.Template.Account.Loading);
export const responseAccountAction = simpleAction<Model.TemplateAccount | undefined>(
  ActionType.Template.Account.Response
);
export const updateAccountInStateAction = simpleAction<Partial<Redux.UpdateModelActionPayload<Model.TemplateAccount>>>(
  ActionType.Template.Account.UpdateInState
);
export const bulkCreateSubAccountsAction = simpleAction<number>(ActionType.Template.Account.BulkCreate);
export const tableChangedAction = simpleAction<Table.Change<BudgetTable.TemplateSubAccountRow>>(
  ActionType.Template.Account.TableChanged
);
export const removeSubAccountAction = simpleAction<number>(ActionType.Template.Account.SubAccounts.Delete);
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
export const addSubAccountToGroupAction = simpleAction<{ id: number; group: number }>(
  ActionType.Template.Account.SubAccounts.AddToGroup
);
export const selectSubAccountAction = simpleAction<number>(ActionType.Template.Account.SubAccounts.Select);
export const deselectSubAccountAction = simpleAction<number>(ActionType.Template.Account.SubAccounts.Deselect);
export const selectAllSubAccountsAction = simpleAction<null>(ActionType.Template.Account.SubAccounts.SelectAll);

export const updateSubAccountInStateAction = simpleAction<Redux.UpdateModelActionPayload<Model.TemplateSubAccount>>(
  ActionType.Template.Account.SubAccounts.UpdateInState
);
export const removeSubAccountFromStateAction = simpleAction<number>(
  ActionType.Template.Account.SubAccounts.RemoveFromState
);
export const addSubAccountToStateAction = simpleAction<Model.TemplateSubAccount>(
  ActionType.Template.Account.SubAccounts.AddToState
);

// Errors Functionality Needs to be Built Back In
export const addErrorsToStateAction = simpleAction<Table.CellError | Table.CellError[]>(
  ActionType.Template.Account.SubAccounts.AddErrors
);

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
