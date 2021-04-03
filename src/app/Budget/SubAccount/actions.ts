import { simpleAction } from "store/actions";
import { ActionType } from "../actions";

export const setSubAccountIdAction = simpleAction<number>(ActionType.SubAccount.SetId);
export const requestSubAccountAction = simpleAction<null>(ActionType.SubAccount.Request);
export const loadingSubAccountAction = simpleAction<boolean>(ActionType.SubAccount.Loading);
export const responseSubAccountAction = simpleAction<ISubAccount>(ActionType.SubAccount.Response);
// Not currently used, because the reducer handles the logic, but we may need to use in the near future.
export const updateParentSubAccountInStateAction = simpleAction<Partial<IAccount>>(ActionType.SubAccount.UpdateInState);
export const bulkUpdateSubAccountAction = simpleAction<Table.RowChange[]>(ActionType.SubAccount.BulkUpdate);

/*
  Actions Pertaining to Sub Account Comments
*/
export const requestCommentsAction = simpleAction<null>(ActionType.SubAccount.Comments.Request);
export const responseCommentsAction = simpleAction<Http.IListResponse<IComment>>(
  ActionType.SubAccount.Comments.Response
);
export const loadingCommentsAction = simpleAction<boolean>(ActionType.SubAccount.Comments.Loading);
export const createCommentAction = simpleAction<{ parent?: number; data: Http.ICommentPayload }>(
  ActionType.SubAccount.Comments.Create
);
export const creatingCommentAction = simpleAction<boolean>(ActionType.SubAccount.Comments.Creating);
export const deleteCommentAction = simpleAction<number>(ActionType.SubAccount.Comments.Delete);
export const updateCommentAction = simpleAction<Redux.UpdateModelActionPayload<IComment>>(
  ActionType.SubAccount.Comments.Update
);
export const replyingToCommentAction = simpleAction<Redux.ModelListActionPayload>(
  ActionType.SubAccount.Comments.Replying
);
export const deletingCommentAction = simpleAction<Redux.ModelListActionPayload>(
  ActionType.SubAccount.Comments.Deleting
);
export const updatingCommentAction = simpleAction<Redux.ModelListActionPayload>(
  ActionType.SubAccount.Comments.Updating
);
export const addCommentToStateAction = simpleAction<{ data: IComment; parent?: number }>(
  ActionType.SubAccount.Comments.AddToState
);
export const removeCommentFromStateAction = simpleAction<number>(ActionType.SubAccount.Comments.RemoveFromState);
export const updateCommentInStateAction = simpleAction<Redux.UpdateModelActionPayload<IComment>>(
  ActionType.SubAccount.Comments.UpdateInState
);
/*
  Actions Pertaining to Account Sub Accounts
*/
export const updateSubAccountAction = simpleAction<Table.RowChange>(ActionType.SubAccount.SubAccounts.Update);
export const removeSubAccountAction = simpleAction<number>(ActionType.SubAccount.SubAccounts.Remove);
export const deletingSubAccountAction = simpleAction<Redux.ModelListActionPayload>(
  ActionType.SubAccount.SubAccounts.Deleting
);
export const updatingSubAccountAction = simpleAction<Redux.ModelListActionPayload>(
  ActionType.SubAccount.SubAccounts.Updating
);
export const creatingSubAccountAction = simpleAction<boolean>(ActionType.SubAccount.SubAccounts.Creating);
export const requestSubAccountsAction = simpleAction<null>(ActionType.SubAccount.SubAccounts.Request);
export const loadingSubAccountsAction = simpleAction<boolean>(ActionType.SubAccount.SubAccounts.Loading);
export const responseSubAccountsAction = simpleAction<Http.IListResponse<ISubAccount>>(
  ActionType.SubAccount.SubAccounts.Response
);
export const setSubAccountsSearchAction = simpleAction<string>(ActionType.SubAccount.SubAccounts.SetSearch);
export const removeSubAccountFromGroupAction = simpleAction<number>(ActionType.SubAccount.SubAccounts.RemoveFromGroup);
export const selectSubAccountAction = simpleAction<number>(ActionType.SubAccount.SubAccounts.Select);
export const deselectSubAccountAction = simpleAction<number>(ActionType.SubAccount.SubAccounts.Deselect);
export const selectAllSubAccountsAction = simpleAction<null>(ActionType.SubAccount.SubAccounts.SelectAll);

export const activatePlaceholderAction = simpleAction<Table.ActivatePlaceholderPayload<ISubAccount>>(
  ActionType.SubAccount.SubAccounts.Placeholders.Activate
);
export const removePlaceholderFromStateAction = simpleAction<number>(
  ActionType.SubAccount.SubAccounts.Placeholders.RemoveFromState
);
export const addPlaceholdersToStateAction = simpleAction<number>(
  ActionType.SubAccount.SubAccounts.Placeholders.AddToState
);
export const updatePlaceholderInStateAction = simpleAction<Table.SubAccountRow>(
  ActionType.SubAccount.SubAccounts.Placeholders.UpdateInState
);

export const updateSubAccountInStateAction = simpleAction<ISubAccount>(ActionType.SubAccount.SubAccounts.UpdateInState);
export const removeSubAccountFromStateAction = simpleAction<number>(ActionType.SubAccount.SubAccounts.RemoveFromState);
// Not currently used, because the reducer handles the logic, but we may need to use in the near future.
export const addSubAccountToStateAction = simpleAction<ISubAccount>(ActionType.SubAccount.SubAccounts.AddToState);

// Errors Functionality Needs to be Built Back In
export const addErrorsToStateAction = simpleAction<Table.CellError | Table.CellError[]>(
  ActionType.SubAccount.SubAccounts.AddErrors
);

/*
  Actiosn Pertaining to Account Sub Accounts Groups
*/
export const requestGroupsAction = simpleAction<null>(ActionType.SubAccount.SubAccounts.Groups.Request);
export const loadingGroupsAction = simpleAction<boolean>(ActionType.SubAccount.SubAccounts.Groups.Loading);
export const responseGroupsAction = simpleAction<Http.IListResponse<IGroup<ISimpleSubAccount>>>(
  ActionType.SubAccount.SubAccounts.Groups.Response
);
export const addGroupToStateAction = simpleAction<IGroup<ISimpleSubAccount>>(
  ActionType.SubAccount.SubAccounts.Groups.AddToState
);
export const updateGroupInStateAction = simpleAction<IGroup<ISimpleSubAccount>>(
  ActionType.SubAccount.SubAccounts.Groups.UpdateInState
);
export const removeGroupFromStateAction = simpleAction<number>(
  ActionType.SubAccount.SubAccounts.Groups.RemoveFromState
);
export const deletingGroupAction = simpleAction<Redux.ModelListActionPayload>(
  ActionType.SubAccount.SubAccounts.Groups.Deleting
);
export const deleteGroupAction = simpleAction<number>(ActionType.SubAccount.SubAccounts.Groups.Delete);

/*
  Actions Pertaining to Sub Account Sub Accounts History
*/
export const requestSubAccountsHistoryAction = simpleAction<null>(ActionType.SubAccount.SubAccounts.History.Request);
export const loadingSubAccountsHistoryAction = simpleAction<boolean>(ActionType.SubAccount.SubAccounts.History.Loading);
export const responseSubAccountsHistoryAction = simpleAction<Http.IListResponse<HistoryEvent>>(
  ActionType.SubAccount.SubAccounts.History.Response
);
