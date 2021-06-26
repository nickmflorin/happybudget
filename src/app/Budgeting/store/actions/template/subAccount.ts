import { simpleAction } from "store/actions";
import ActionType from "../ActionType";

export const setSubAccountIdAction = simpleAction<number>(ActionType.Template.SubAccount.SetId);
export const requestSubAccountAction = simpleAction<null>(ActionType.Template.SubAccount.Request);
export const loadingSubAccountAction = simpleAction<boolean>(ActionType.Template.SubAccount.Loading);
export const responseSubAccountAction = simpleAction<Model.TemplateSubAccount | undefined>(
  ActionType.Template.SubAccount.Response
);
export const tableChangedAction = simpleAction<Table.Change<BudgetTable.TemplateSubAccountRow>>(
  ActionType.Template.SubAccount.TableChanged
);
export const deleteSubAccountsAction = simpleAction<number | number[]>(
  ActionType.Template.SubAccount.SubAccounts.Delete
);
export const deletingSubAccountAction = simpleAction<Redux.ModelListActionPayload>(
  ActionType.Template.SubAccount.SubAccounts.Deleting
);
export const bulkCreateSubAccountsAction = simpleAction<Table.RowAddPayload<BudgetTable.TemplateSubAccountRow>>(
  ActionType.Template.SubAccount.SubAccounts.BulkCreate
);
export const updatingSubAccountAction = simpleAction<Redux.ModelListActionPayload>(
  ActionType.Template.SubAccount.SubAccounts.Updating
);
export const creatingSubAccountAction = simpleAction<boolean>(ActionType.Template.SubAccount.SubAccounts.Creating);
export const requestSubAccountsAction = simpleAction<null>(ActionType.Template.SubAccount.SubAccounts.Request);
export const loadingSubAccountsAction = simpleAction<boolean>(ActionType.Template.SubAccount.SubAccounts.Loading);
export const responseSubAccountsAction = simpleAction<Http.ListResponse<Model.TemplateSubAccount>>(
  ActionType.Template.SubAccount.SubAccounts.Response
);
export const setSubAccountsSearchAction = simpleAction<string>(ActionType.Template.SubAccount.SubAccounts.SetSearch);
export const removeSubAccountFromGroupAction = simpleAction<number>(
  ActionType.Template.SubAccount.SubAccounts.RemoveFromGroup
);
export const addSubAccountToGroupAction = simpleAction<{ id: number; group: number }>(
  ActionType.Template.SubAccount.SubAccounts.AddToGroup
);
export const removeSubAccountFromStateAction = simpleAction<number>(
  ActionType.Template.SubAccount.SubAccounts.RemoveFromState
);
export const addSubAccountToStateAction = simpleAction<Model.TemplateSubAccount>(
  ActionType.Template.SubAccount.SubAccounts.AddToState
);
export const requestGroupsAction = simpleAction<null>(ActionType.Template.SubAccount.SubAccounts.Groups.Request);
export const loadingGroupsAction = simpleAction<boolean>(ActionType.Template.SubAccount.SubAccounts.Groups.Loading);
export const responseGroupsAction = simpleAction<Http.ListResponse<Model.TemplateGroup>>(
  ActionType.Template.SubAccount.SubAccounts.Groups.Response
);
export const addGroupToStateAction = simpleAction<Model.TemplateGroup>(
  ActionType.Template.SubAccount.SubAccounts.Groups.AddToState
);
export const updateGroupInStateAction = simpleAction<Redux.UpdateModelActionPayload<Model.TemplateGroup>>(
  ActionType.Template.SubAccount.SubAccounts.Groups.UpdateInState
);
export const removeGroupFromStateAction = simpleAction<number>(
  ActionType.Template.SubAccount.SubAccounts.Groups.RemoveFromState
);
export const deletingGroupAction = simpleAction<Redux.ModelListActionPayload>(
  ActionType.Template.SubAccount.SubAccounts.Groups.Deleting
);
export const deleteGroupAction = simpleAction<number>(ActionType.Template.SubAccount.SubAccounts.Groups.Delete);
