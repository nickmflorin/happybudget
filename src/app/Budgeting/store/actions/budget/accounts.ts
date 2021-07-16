import { simpleAction } from "store/actions";
import ActionType from "../ActionType";

export const handleTableChangeEventAction = simpleAction<Table.ChangeEvent<BudgetTable.AccountRow, Model.Account>>(
  ActionType.Budget.Accounts.TableChanged
);
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
export const deletingAccountAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Budget.Accounts.Deleting);
export const updatingAccountAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Budget.Accounts.Updating);
export const creatingAccountAction = simpleAction<boolean>(ActionType.Budget.Accounts.Creating);
export const requestAccountsAction = simpleAction<null>(ActionType.Budget.Accounts.Request);
export const loadingAccountsAction = simpleAction<boolean>(ActionType.Budget.Accounts.Loading);
export const responseAccountsAction = simpleAction<Http.ListResponse<Model.Account>>(
  ActionType.Budget.Accounts.Response
);
export const setAccountsSearchAction = simpleAction<string>(ActionType.Budget.Accounts.SetSearch);
export const removeAccountFromGroupAction = simpleAction<number>(ActionType.Budget.Accounts.RemoveFromGroup);
export const addAccountToGroupAction = simpleAction<{ id: number; group: number }>(
  ActionType.Budget.Accounts.AddToGroup
);
export const addAccountToStateAction = simpleAction<Model.Account>(ActionType.Budget.Accounts.AddToState);
export const requestGroupsAction = simpleAction<null>(ActionType.Budget.Groups.Request);
export const loadingGroupsAction = simpleAction<boolean>(ActionType.Budget.Groups.Loading);
export const responseGroupsAction = simpleAction<Http.ListResponse<Model.Group>>(ActionType.Budget.Groups.Response);
export const addGroupToStateAction = simpleAction<Model.Group>(ActionType.Budget.Groups.AddToState);
export const updateGroupInStateAction = simpleAction<Redux.UpdateModelActionPayload<Model.Group>>(
  ActionType.Budget.Groups.UpdateInState
);
export const removeGroupFromStateAction = simpleAction<number>(ActionType.Budget.Groups.RemoveFromState);
export const deletingGroupAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Budget.Groups.Deleting);
export const deleteGroupAction = simpleAction<number>(ActionType.Budget.Groups.Delete);

export const requestAccountsHistoryAction = simpleAction<null>(ActionType.Budget.History.Request);
export const loadingAccountsHistoryAction = simpleAction<boolean>(ActionType.Budget.History.Loading);
export const responseAccountsHistoryAction = simpleAction<Http.ListResponse<Model.HistoryEvent>>(
  ActionType.Budget.History.Response
);
export const addAccountsHistoryToStateAction = simpleAction<Model.HistoryEvent>(ActionType.Budget.History.AddToState);
