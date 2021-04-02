import { simpleAction } from "store/actions";
import { ActionType } from "../actions";

export const bulkUpdateBudgetAccountsAction = simpleAction<Table.RowChange[]>(ActionType.Budget.BulkUpdateAccounts);

/*
  Actions Pertaining to Budget Comments
*/
export const requestCommentsAction = simpleAction<null>(ActionType.Budget.Comments.Request);
export const responseCommentsAction = simpleAction<Http.IListResponse<IComment>>(ActionType.Budget.Comments.Response);
export const loadingCommentsAction = simpleAction<boolean>(ActionType.Budget.Comments.Loading);
export const submitCommentAction = simpleAction<{ parent?: number; data: Http.ICommentPayload }>(
  ActionType.Budget.Comments.Submit
);
export const submittingCommentAction = simpleAction<boolean>(ActionType.Budget.Comments.Submitting);
export const deleteCommentAction = simpleAction<number>(ActionType.Budget.Comments.Delete);
export const editCommentAction = simpleAction<Redux.UpdateModelActionPayload<IComment>>(
  ActionType.Budget.Comments.Edit
);
export const deletingCommentAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Budget.Comments.Deleting);
export const editingCommentAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Budget.Comments.Editing);
export const replyingToCommentAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Budget.Comments.Replying);
export const addCommentToStateAction = simpleAction<{ data: IComment; parent?: number }>(
  ActionType.Budget.Comments.AddToState
);
export const removeCommentFromStateAction = simpleAction<number>(ActionType.Budget.Comments.RemoveFromState);
export const updateCommentInStateAction = simpleAction<Redux.UpdateModelActionPayload<IComment>>(
  ActionType.Budget.Comments.UpdateInState
);

/*
  Actions Pertaining to Budget Accounts
*/
export const updateAccountAction = simpleAction<Table.RowChange>(ActionType.Budget.Accounts.Update);
export const removeAccountAction = simpleAction<number>(ActionType.Budget.Accounts.Remove);
export const deletingAccountAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Budget.Accounts.Deleting);
export const updatingAccountAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Budget.Accounts.Updating);
export const creatingAccountAction = simpleAction<boolean>(ActionType.Budget.Accounts.Creating);
export const requestAccountsAction = simpleAction<null>(ActionType.Budget.Accounts.Request);
export const loadingAccountsAction = simpleAction<boolean>(ActionType.Budget.Accounts.Loading);
export const responseAccountsAction = simpleAction<Http.IListResponse<IAccount>>(ActionType.Budget.Accounts.Response);
export const setAccountsSearchAction = simpleAction<string>(ActionType.Budget.Accounts.SetSearch);
export const removeAccountFromGroupAction = simpleAction<number>(ActionType.Budget.Accounts.RemoveFromGroup);
export const selectAccountAction = simpleAction<number>(ActionType.Budget.Accounts.Select);
export const deselectAccountAction = simpleAction<number>(ActionType.Budget.Accounts.Deselect);
export const selectAllAccountsAction = simpleAction<null>(ActionType.Budget.Accounts.SelectAll);

export const activatePlaceholderAction = simpleAction<Table.ActivatePlaceholderPayload<IAccount>>(
  ActionType.Budget.Accounts.Placeholders.Activate
);
export const removePlaceholderFromStateAction = simpleAction<number>(
  ActionType.Budget.Accounts.Placeholders.RemoveFromState
);
export const addPlaceholdersToStateAction = simpleAction<number>(ActionType.Budget.Accounts.Placeholders.AddToState);
export const updatePlaceholderInStateAction = simpleAction<Table.AccountRow>(
  ActionType.Budget.Accounts.Placeholders.UpdateInState
);

export const updateAccountInStateAction = simpleAction<IAccount>(ActionType.Budget.Accounts.UpdateInState);
export const removeAccountFromStateAction = simpleAction<number>(ActionType.Budget.Accounts.RemoveFromState);
// Not currently used, because the reducer handles the logic, but we may need to use in the near future.
export const addAccountToStateAction = simpleAction<IAccount>(ActionType.Budget.Accounts.AddToState);

// Errors Functionality Needs to be Built Back In
export const addErrorsToStateAction = simpleAction<Table.CellError | Table.CellError[]>(
  ActionType.Budget.Accounts.AddErrors
);

/*
  Actiosn Pertaining to Account Sub Accounts Groups
*/
export const requestGroupsAction = simpleAction<null>(ActionType.Budget.Accounts.Groups.Request);
export const loadingGroupsAction = simpleAction<boolean>(ActionType.Budget.Accounts.Groups.Loading);
export const responseGroupsAction = simpleAction<Http.IListResponse<IGroup<ISimpleAccount>>>(
  ActionType.Budget.Accounts.Groups.Response
);
export const addGroupToStateAction = simpleAction<IGroup<ISimpleAccount>>(ActionType.Budget.Accounts.Groups.AddToState);
export const updateGroupInStateAction = simpleAction<IGroup<ISimpleAccount>>(
  ActionType.Budget.Accounts.Groups.UpdateInState
);
export const removeGroupFromStateAction = simpleAction<number>(ActionType.Budget.Accounts.Groups.RemoveFromState);
export const deletingGroupAction = simpleAction<Redux.ModelListActionPayload>(
  ActionType.Budget.Accounts.Groups.Deleting
);
export const deleteGroupAction = simpleAction<number>(ActionType.Budget.Accounts.Groups.Delete);

/*
  Actions Pertaining to Budget Accounts History
*/
export const requestAccountsHistoryAction = simpleAction<null>(ActionType.Budget.Accounts.History.Request);
export const loadingAccountsHistoryAction = simpleAction<boolean>(ActionType.Budget.Accounts.History.Loading);
export const responseAccountsHistoryAction = simpleAction<Http.IListResponse<HistoryEvent>>(
  ActionType.Budget.Accounts.History.Response
);
export const addAccountsHistoryToStateAction = simpleAction<HistoryEvent>(
  ActionType.Budget.Accounts.History.AddToState
);
