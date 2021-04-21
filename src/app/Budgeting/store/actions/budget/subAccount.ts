import { simpleAction } from "store/actions";
import ActionType from "../ActionType";

export const setSubAccountIdAction = simpleAction<number>(ActionType.Budget.SubAccount.SetId);
export const requestSubAccountAction = simpleAction<null>(ActionType.Budget.SubAccount.Request);
export const loadingSubAccountAction = simpleAction<boolean>(ActionType.Budget.SubAccount.Loading);
export const responseSubAccountAction = simpleAction<Model.BudgetSubAccount | undefined>(
  ActionType.Budget.SubAccount.Response
);
// Not currently used, because the reducer handles the logic, but we may need to use in the near future.
export const updateParentSubAccountInStateAction = simpleAction<Partial<Model.BudgetAccount>>(
  ActionType.Budget.SubAccount.UpdateInState
);
export const bulkUpdateSubAccountAction = simpleAction<Table.RowChange<Table.BudgetSubAccountRow>[]>(
  ActionType.Budget.SubAccount.BulkUpdate
);

/*
  Actions Pertaining to Sub Account Comments
*/
export const requestCommentsAction = simpleAction<null>(ActionType.Budget.SubAccount.Comments.Request);
export const responseCommentsAction = simpleAction<Http.ListResponse<Model.Comment>>(
  ActionType.Budget.SubAccount.Comments.Response
);
export const loadingCommentsAction = simpleAction<boolean>(ActionType.Budget.SubAccount.Comments.Loading);
export const createCommentAction = simpleAction<{ parent?: number; data: Http.CommentPayload }>(
  ActionType.Budget.SubAccount.Comments.Create
);
export const creatingCommentAction = simpleAction<boolean>(ActionType.Budget.SubAccount.Comments.Creating);
export const deleteCommentAction = simpleAction<number>(ActionType.Budget.SubAccount.Comments.Delete);
export const updateCommentAction = simpleAction<Redux.UpdateModelActionPayload<Model.Comment>>(
  ActionType.Budget.SubAccount.Comments.Update
);
export const replyingToCommentAction = simpleAction<Redux.ModelListActionPayload>(
  ActionType.Budget.SubAccount.Comments.Replying
);
export const deletingCommentAction = simpleAction<Redux.ModelListActionPayload>(
  ActionType.Budget.SubAccount.Comments.Deleting
);
export const updatingCommentAction = simpleAction<Redux.ModelListActionPayload>(
  ActionType.Budget.SubAccount.Comments.Updating
);
export const addCommentToStateAction = simpleAction<{ data: Model.Comment; parent?: number }>(
  ActionType.Budget.SubAccount.Comments.AddToState
);
export const removeCommentFromStateAction = simpleAction<number>(ActionType.Budget.SubAccount.Comments.RemoveFromState);
export const updateCommentInStateAction = simpleAction<
  Redux.UpdateModelActionPayload<Redux.UpdateModelActionPayload<Model.Comment>>
>(ActionType.Budget.SubAccount.Comments.UpdateInState);
/*
  Actions Pertaining to Account Sub Accounts
*/
export const updateSubAccountAction = simpleAction<Table.RowChange<Table.BudgetSubAccountRow>>(
  ActionType.Budget.SubAccount.SubAccounts.Update
);
export const removeSubAccountAction = simpleAction<number>(ActionType.Budget.SubAccount.SubAccounts.Remove);
export const deletingSubAccountAction = simpleAction<Redux.ModelListActionPayload>(
  ActionType.Budget.SubAccount.SubAccounts.Deleting
);
export const updatingSubAccountAction = simpleAction<Redux.ModelListActionPayload>(
  ActionType.Budget.SubAccount.SubAccounts.Updating
);
export const creatingSubAccountAction = simpleAction<boolean>(ActionType.Budget.SubAccount.SubAccounts.Creating);
export const requestSubAccountsAction = simpleAction<null>(ActionType.Budget.SubAccount.SubAccounts.Request);
export const loadingSubAccountsAction = simpleAction<boolean>(ActionType.Budget.SubAccount.SubAccounts.Loading);
export const responseSubAccountsAction = simpleAction<Http.ListResponse<Model.BudgetSubAccount>>(
  ActionType.Budget.SubAccount.SubAccounts.Response
);
export const setSubAccountsSearchAction = simpleAction<string>(ActionType.Budget.SubAccount.SubAccounts.SetSearch);
export const removeSubAccountFromGroupAction = simpleAction<number>(
  ActionType.Budget.SubAccount.SubAccounts.RemoveFromGroup
);
export const selectSubAccountAction = simpleAction<number>(ActionType.Budget.SubAccount.SubAccounts.Select);
export const deselectSubAccountAction = simpleAction<number>(ActionType.Budget.SubAccount.SubAccounts.Deselect);
export const selectAllSubAccountsAction = simpleAction<null>(ActionType.Budget.SubAccount.SubAccounts.SelectAll);

export const activatePlaceholderAction = simpleAction<Table.ActivatePlaceholderPayload<Model.BudgetSubAccount>>(
  ActionType.Budget.SubAccount.SubAccounts.Placeholders.Activate
);
export const removePlaceholderFromStateAction = simpleAction<number>(
  ActionType.Budget.SubAccount.SubAccounts.Placeholders.RemoveFromState
);
export const addPlaceholdersToStateAction = simpleAction<number>(
  ActionType.Budget.SubAccount.SubAccounts.Placeholders.AddToState
);
export const updatePlaceholderInStateAction = simpleAction<Redux.UpdateModelActionPayload<Table.BudgetSubAccountRow>>(
  ActionType.Budget.SubAccount.SubAccounts.Placeholders.UpdateInState
);

export const updateSubAccountInStateAction = simpleAction<Redux.UpdateModelActionPayload<Model.BudgetSubAccount>>(
  ActionType.Budget.SubAccount.SubAccounts.UpdateInState
);
export const removeSubAccountFromStateAction = simpleAction<number>(
  ActionType.Budget.SubAccount.SubAccounts.RemoveFromState
);
// Not currently used, because the reducer handles the logic, but we may need to use in the near future.
export const addSubAccountToStateAction = simpleAction<Model.BudgetSubAccount>(
  ActionType.Budget.SubAccount.SubAccounts.AddToState
);

// Errors Functionality Needs to be Built Back In
export const addErrorsToStateAction = simpleAction<Table.CellError | Table.CellError[]>(
  ActionType.Budget.SubAccount.SubAccounts.AddErrors
);

/*
  Actiosn Pertaining to Account Sub Accounts Groups
*/
export const requestGroupsAction = simpleAction<null>(ActionType.Budget.SubAccount.SubAccounts.Groups.Request);
export const loadingGroupsAction = simpleAction<boolean>(ActionType.Budget.SubAccount.SubAccounts.Groups.Loading);
export const responseGroupsAction = simpleAction<Http.ListResponse<Model.BudgetGroup>>(
  ActionType.Budget.SubAccount.SubAccounts.Groups.Response
);
export const addGroupToStateAction = simpleAction<Model.BudgetGroup>(
  ActionType.Budget.SubAccount.SubAccounts.Groups.AddToState
);
export const updateGroupInStateAction = simpleAction<Redux.UpdateModelActionPayload<Model.BudgetGroup>>(
  ActionType.Budget.SubAccount.SubAccounts.Groups.UpdateInState
);
export const removeGroupFromStateAction = simpleAction<number>(
  ActionType.Budget.SubAccount.SubAccounts.Groups.RemoveFromState
);
export const deletingGroupAction = simpleAction<Redux.ModelListActionPayload>(
  ActionType.Budget.SubAccount.SubAccounts.Groups.Deleting
);
export const deleteGroupAction = simpleAction<number>(ActionType.Budget.SubAccount.SubAccounts.Groups.Delete);

/*
  Actions Pertaining to Sub Account Sub Accounts History
*/
export const requestSubAccountsHistoryAction = simpleAction<null>(
  ActionType.Budget.SubAccount.SubAccounts.History.Request
);
export const loadingSubAccountsHistoryAction = simpleAction<boolean>(
  ActionType.Budget.SubAccount.SubAccounts.History.Loading
);
export const responseSubAccountsHistoryAction = simpleAction<Http.ListResponse<Model.HistoryEvent>>(
  ActionType.Budget.SubAccount.SubAccounts.History.Response
);
