import { simpleAction } from "store/actions";
import { ActionType } from "../actions";

export const setAccountIdAction = simpleAction<number>(ActionType.Account.SetId);
export const requestAccountAction = simpleAction<null>(ActionType.Account.Request);
export const loadingAccountAction = simpleAction<boolean>(ActionType.Account.Loading);
export const responseAccountAction = simpleAction<IAccount>(ActionType.Account.Response);
// Not currently used, because the reducer handles the logic, but we may need to use in the near future.
export const updateAccountInStateAction = simpleAction<Partial<IAccount>>(ActionType.Account.UpdateInState);
export const bulkUpdateAccountAction = simpleAction<Table.RowChange[]>(ActionType.Account.BulkUpdate);

/*
  Actions Pertaining to Account Comments
*/
export const requestCommentsAction = simpleAction<null>(ActionType.Account.Comments.Request);
export const responseCommentsAction = simpleAction<Http.IListResponse<IComment>>(ActionType.Account.Comments.Response);
export const loadingCommentsAction = simpleAction<boolean>(ActionType.Account.Comments.Loading);
export const submitCommentAction = simpleAction<{ parent?: number; data: Http.ICommentPayload }>(
  ActionType.Account.Comments.Submit
);
export const submittingCommentAction = simpleAction<boolean>(ActionType.Account.Comments.Submitting);
export const deleteCommentAction = simpleAction<number>(ActionType.Account.Comments.Delete);
export const editCommentAction = simpleAction<Redux.UpdateModelActionPayload<IComment>>(
  ActionType.Account.Comments.Edit
);
export const replyingToCommentAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Account.Comments.Replying);
export const deletingCommentAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Account.Comments.Deleting);
export const editingCommentAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Account.Comments.Editing);
export const addCommentToStateAction = simpleAction<{ data: IComment; parent?: number }>(
  ActionType.Account.Comments.AddToState
);
export const removeCommentFromStateAction = simpleAction<number>(ActionType.Account.Comments.RemoveFromState);
export const updateCommentInStateAction = simpleAction<Redux.UpdateModelActionPayload<IComment>>(
  ActionType.Account.Comments.UpdateInState
);
/*
  Actions Pertaining to Account Sub Accounts
*/
export const updateSubAccountAction = simpleAction<Table.RowChange>(ActionType.Account.SubAccounts.Update);
export const removeSubAccountAction = simpleAction<number>(ActionType.Account.SubAccounts.Remove);
export const deletingSubAccountAction = simpleAction<Redux.ModelListActionPayload>(
  ActionType.Account.SubAccounts.Deleting
);
export const updatingSubAccountAction = simpleAction<Redux.ModelListActionPayload>(
  ActionType.Account.SubAccounts.Updating
);
export const creatingSubAccountAction = simpleAction<boolean>(ActionType.Account.SubAccounts.Creating);
export const requestSubAccountsAction = simpleAction<null>(ActionType.Account.SubAccounts.Request);
export const loadingSubAccountsAction = simpleAction<boolean>(ActionType.Account.SubAccounts.Loading);
export const responseSubAccountsAction = simpleAction<Http.IListResponse<ISubAccount>>(
  ActionType.Account.SubAccounts.Response
);
export const setSubAccountsSearchAction = simpleAction<string>(ActionType.Account.SubAccounts.SetSearch);
export const removeSubAccountFromGroupAction = simpleAction<number>(ActionType.Account.SubAccounts.RemoveFromGroup);
export const selectSubAccountAction = simpleAction<number>(ActionType.Account.SubAccounts.Select);
export const deselectSubAccountAction = simpleAction<number>(ActionType.Account.SubAccounts.Deselect);
export const selectAllSubAccountsAction = simpleAction<null>(ActionType.Account.SubAccounts.SelectAll);

export const activatePlaceholderAction = simpleAction<Table.ActivatePlaceholderPayload<ISubAccount>>(
  ActionType.Account.SubAccounts.Placeholders.Activate
);
export const removePlaceholderFromStateAction = simpleAction<number>(
  ActionType.Account.SubAccounts.Placeholders.RemoveFromState
);
export const addPlaceholdersToStateAction = simpleAction<number>(
  ActionType.Account.SubAccounts.Placeholders.AddToState
);
export const updatePlaceholderInStateAction = simpleAction<Table.SubAccountRow>(
  ActionType.Account.SubAccounts.Placeholders.UpdateInState
);

export const updateSubAccountInStateAction = simpleAction<ISubAccount>(ActionType.Account.SubAccounts.UpdateInState);
export const removeSubAccountFromStateAction = simpleAction<number>(ActionType.Account.SubAccounts.RemoveFromState);
// Not currently used, because the reducer handles the logic, but we may need to use in the near future.
export const addSubAccountToStateAction = simpleAction<ISubAccount>(ActionType.Account.SubAccounts.AddToState);

// Errors Functionality Needs to be Built Back In
export const addErrorsToStateAction = simpleAction<Table.CellError | Table.CellError[]>(
  ActionType.Account.SubAccounts.AddErrors
);

/*
  Actions Pertaining to Account Sub Accounts Groups
*/
export const requestGroupsAction = simpleAction<null>(ActionType.Account.SubAccounts.Groups.Request);
export const loadingGroupsAction = simpleAction<boolean>(ActionType.Account.SubAccounts.Groups.Loading);
export const responseGroupsAction = simpleAction<Http.IListResponse<IGroup<ISimpleSubAccount>>>(
  ActionType.Account.SubAccounts.Groups.Response
);
export const addGroupToStateAction = simpleAction<IGroup<ISimpleSubAccount>>(
  ActionType.Account.SubAccounts.Groups.AddToState
);
export const updateGroupInStateAction = simpleAction<IGroup<ISimpleSubAccount>>(
  ActionType.Account.SubAccounts.Groups.UpdateInState
);
export const removeGroupFromStateAction = simpleAction<number>(ActionType.Account.SubAccounts.Groups.RemoveFromState);
export const deletingGroupAction = simpleAction<Redux.ModelListActionPayload>(
  ActionType.Account.SubAccounts.Groups.Deleting
);
export const deleteGroupAction = simpleAction<number>(ActionType.Account.SubAccounts.Groups.Delete);

/*
  Actions Pertaining to Account Sub Accounts History
*/
export const requestHistoryAction = simpleAction<null>(ActionType.Account.SubAccounts.History.Request);
export const loadingHistoryAction = simpleAction<boolean>(ActionType.Account.SubAccounts.History.Loading);
export const responseHistoryAction = simpleAction<Http.IListResponse<HistoryEvent>>(
  ActionType.Account.SubAccounts.History.Response
);
