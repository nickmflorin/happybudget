import { simpleAction } from "store/actions";
import ActionType from "../ActionType";

export const setAccountIdAction = simpleAction<number>(ActionType.Budget.Account.SetId);
export const requestAccountAction = simpleAction<null>(ActionType.Budget.Account.Request);
export const loadingAccountAction = simpleAction<boolean>(ActionType.Budget.Account.Loading);
export const responseAccountAction = simpleAction<Model.BudgetAccount | undefined>(ActionType.Budget.Account.Response);
export const updateAccountInStateAction = simpleAction<Partial<Redux.UpdateModelActionPayload<Model.BudgetAccount>>>(
  ActionType.Budget.Account.UpdateInState
);
export const bulkCreateSubAccountsAction = simpleAction<Table.RowAddPayload<BudgetTable.BudgetSubAccountRow>>(
  ActionType.Budget.Account.SubAccounts.BulkCreate
);
export const requestCommentsAction = simpleAction<null>(ActionType.Budget.Account.Comments.Request);
export const responseCommentsAction = simpleAction<Http.ListResponse<Model.Comment>>(
  ActionType.Budget.Account.Comments.Response
);
export const loadingCommentsAction = simpleAction<boolean>(ActionType.Budget.Account.Comments.Loading);
export const createCommentAction = simpleAction<{ parent?: number; data: Http.CommentPayload }>(
  ActionType.Budget.Account.Comments.Create
);
export const creatingCommentAction = simpleAction<boolean>(ActionType.Budget.Account.Comments.Creating);
export const deleteCommentAction = simpleAction<number>(ActionType.Budget.Account.Comments.Delete);
export const updateCommentAction = simpleAction<Redux.UpdateModelActionPayload<Model.Comment>>(
  ActionType.Budget.Account.Comments.Update
);
export const replyingToCommentAction = simpleAction<Redux.ModelListActionPayload>(
  ActionType.Budget.Account.Comments.Replying
);
export const deletingCommentAction = simpleAction<Redux.ModelListActionPayload>(
  ActionType.Budget.Account.Comments.Deleting
);
export const updatingCommentAction = simpleAction<Redux.ModelListActionPayload>(
  ActionType.Budget.Account.Comments.Updating
);
export const addCommentToStateAction = simpleAction<{ data: Comment; parent?: number }>(
  ActionType.Budget.Account.Comments.AddToState
);
export const removeCommentFromStateAction = simpleAction<number>(ActionType.Budget.Account.Comments.RemoveFromState);
export const updateCommentInStateAction = simpleAction<
  Redux.UpdateModelActionPayload<Redux.UpdateModelActionPayload<Model.Comment>>
>(ActionType.Budget.Account.Comments.UpdateInState);
export const tableChangedAction = simpleAction<Table.Change<BudgetTable.BudgetSubAccountRow>>(
  ActionType.Budget.Account.TableChanged
);
export const deleteSubAccountsAction = simpleAction<number | number[]>(ActionType.Budget.Account.SubAccounts.Delete);
export const deletingSubAccountAction = simpleAction<Redux.ModelListActionPayload>(
  ActionType.Budget.Account.SubAccounts.Deleting
);
export const updatingSubAccountAction = simpleAction<Redux.ModelListActionPayload>(
  ActionType.Budget.Account.SubAccounts.Updating
);
export const creatingSubAccountAction = simpleAction<boolean>(ActionType.Budget.Account.SubAccounts.Creating);
export const requestSubAccountsAction = simpleAction<null>(ActionType.Budget.Account.SubAccounts.Request);
export const loadingSubAccountsAction = simpleAction<boolean>(ActionType.Budget.Account.SubAccounts.Loading);
export const responseSubAccountsAction = simpleAction<Http.ListResponse<Model.BudgetSubAccount>>(
  ActionType.Budget.Account.SubAccounts.Response
);
export const setSubAccountsSearchAction = simpleAction<string>(ActionType.Budget.Account.SubAccounts.SetSearch);
export const removeSubAccountFromGroupAction = simpleAction<number>(
  ActionType.Budget.Account.SubAccounts.RemoveFromGroup
);
export const addSubAccountToGroupAction = simpleAction<{ id: number; group: number }>(
  ActionType.Budget.Account.SubAccounts.AddToGroup
);
export const removeSubAccountFromStateAction = simpleAction<number>(
  ActionType.Budget.Account.SubAccounts.RemoveFromState
);
export const addSubAccountToStateAction = simpleAction<Model.BudgetSubAccount>(
  ActionType.Budget.Account.SubAccounts.AddToState
);
export const requestGroupsAction = simpleAction<null>(ActionType.Budget.Account.SubAccounts.Groups.Request);
export const loadingGroupsAction = simpleAction<boolean>(ActionType.Budget.Account.SubAccounts.Groups.Loading);
export const responseGroupsAction = simpleAction<Http.ListResponse<Model.BudgetGroup>>(
  ActionType.Budget.Account.SubAccounts.Groups.Response
);
export const addGroupToStateAction = simpleAction<Model.BudgetGroup>(
  ActionType.Budget.Account.SubAccounts.Groups.AddToState
);
export const updateGroupInStateAction = simpleAction<Redux.UpdateModelActionPayload<Model.BudgetGroup>>(
  ActionType.Budget.Account.SubAccounts.Groups.UpdateInState
);
export const removeGroupFromStateAction = simpleAction<number>(
  ActionType.Budget.Account.SubAccounts.Groups.RemoveFromState
);
export const deletingGroupAction = simpleAction<Redux.ModelListActionPayload>(
  ActionType.Budget.Account.SubAccounts.Groups.Deleting
);
export const deleteGroupAction = simpleAction<number>(ActionType.Budget.Account.SubAccounts.Groups.Delete);
export const requestHistoryAction = simpleAction<null>(ActionType.Budget.Account.SubAccounts.History.Request);
export const loadingHistoryAction = simpleAction<boolean>(ActionType.Budget.Account.SubAccounts.History.Loading);
export const responseHistoryAction = simpleAction<Http.ListResponse<Model.HistoryEvent>>(
  ActionType.Budget.Account.SubAccounts.History.Response
);
