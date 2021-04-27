import { simpleAction } from "store/actions";
import ActionType from "../ActionType";

export const bulkUpdateBudgetAccountsAction = simpleAction<Table.RowChange<Table.BudgetAccountRow>[]>(
  ActionType.Budget.BulkUpdate
);
export const bulkCreateAccountsAction = simpleAction<number>(ActionType.Budget.BulkCreate);

export const requestCommentsAction = simpleAction<null>(ActionType.Budget.Comments.Request);
export const responseCommentsAction = simpleAction<Http.ListResponse<Model.Comment>>(
  ActionType.Budget.Comments.Response
);
export const loadingCommentsAction = simpleAction<boolean>(ActionType.Budget.Comments.Loading);
export const createCommentAction = simpleAction<{ parent?: number; data: Http.CommentPayload }>(
  ActionType.Budget.Comments.Create
);
export const creatingCommentAction = simpleAction<boolean>(ActionType.Budget.Comments.Creating);
export const deleteCommentAction = simpleAction<number>(ActionType.Budget.Comments.Delete);
export const updateCommentAction = simpleAction<Redux.UpdateModelActionPayload<Model.Comment>>(
  ActionType.Budget.Comments.Update
);
export const deletingCommentAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Budget.Comments.Deleting);
export const updatingCommentAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Budget.Comments.Updating);
export const replyingToCommentAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Budget.Comments.Replying);
export const addCommentToStateAction = simpleAction<{ data: Comment; parent?: number }>(
  ActionType.Budget.Comments.AddToState
);
export const removeCommentFromStateAction = simpleAction<number>(ActionType.Budget.Comments.RemoveFromState);
export const updateCommentInStateAction = simpleAction<
  Redux.UpdateModelActionPayload<Redux.UpdateModelActionPayload<Model.Comment>>
>(ActionType.Budget.Comments.UpdateInState);

export const updateAccountAction = simpleAction<Table.RowChange<Table.BudgetAccountRow>>(
  ActionType.Budget.Accounts.Update
);
export const removeAccountAction = simpleAction<number>(ActionType.Budget.Accounts.Delete);
export const deletingAccountAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Budget.Accounts.Deleting);
export const updatingAccountAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Budget.Accounts.Updating);
export const creatingAccountAction = simpleAction<boolean>(ActionType.Budget.Accounts.Creating);
export const requestAccountsAction = simpleAction<null>(ActionType.Budget.Accounts.Request);
export const loadingAccountsAction = simpleAction<boolean>(ActionType.Budget.Accounts.Loading);
export const responseAccountsAction = simpleAction<Http.ListResponse<Model.BudgetAccount>>(
  ActionType.Budget.Accounts.Response
);
export const setAccountsSearchAction = simpleAction<string>(ActionType.Budget.Accounts.SetSearch);
export const removeAccountFromGroupAction = simpleAction<number>(ActionType.Budget.Accounts.RemoveFromGroup);
export const selectAccountAction = simpleAction<number>(ActionType.Budget.Accounts.Select);
export const deselectAccountAction = simpleAction<number>(ActionType.Budget.Accounts.Deselect);
export const selectAllAccountsAction = simpleAction<null>(ActionType.Budget.Accounts.SelectAll);

export const updateAccountInStateAction = simpleAction<Redux.UpdateModelActionPayload<Model.BudgetAccount>>(
  ActionType.Budget.Accounts.UpdateInState
);
export const removeAccountFromStateAction = simpleAction<number>(ActionType.Budget.Accounts.RemoveFromState);
export const addAccountToStateAction = simpleAction<Model.BudgetAccount>(ActionType.Budget.Accounts.AddToState);

// Errors Functionality Needs to be Built Back In
export const addErrorsToStateAction = simpleAction<Table.CellError | Table.CellError[]>(
  ActionType.Budget.Accounts.AddErrors
);

export const requestGroupsAction = simpleAction<null>(ActionType.Budget.Accounts.Groups.Request);
export const loadingGroupsAction = simpleAction<boolean>(ActionType.Budget.Accounts.Groups.Loading);
export const responseGroupsAction = simpleAction<Http.ListResponse<Model.BudgetGroup>>(
  ActionType.Budget.Accounts.Groups.Response
);
export const addGroupToStateAction = simpleAction<Model.BudgetGroup>(ActionType.Budget.Accounts.Groups.AddToState);
export const updateGroupInStateAction = simpleAction<Redux.UpdateModelActionPayload<Model.BudgetGroup>>(
  ActionType.Budget.Accounts.Groups.UpdateInState
);
export const removeGroupFromStateAction = simpleAction<number>(ActionType.Budget.Accounts.Groups.RemoveFromState);
export const deletingGroupAction = simpleAction<Redux.ModelListActionPayload>(
  ActionType.Budget.Accounts.Groups.Deleting
);
export const deleteGroupAction = simpleAction<number>(ActionType.Budget.Accounts.Groups.Delete);

export const requestAccountsHistoryAction = simpleAction<null>(ActionType.Budget.Accounts.History.Request);
export const loadingAccountsHistoryAction = simpleAction<boolean>(ActionType.Budget.Accounts.History.Loading);
export const responseAccountsHistoryAction = simpleAction<Http.ListResponse<Model.HistoryEvent>>(
  ActionType.Budget.Accounts.History.Response
);
export const addAccountsHistoryToStateAction = simpleAction<Model.HistoryEvent>(
  ActionType.Budget.Accounts.History.AddToState
);
