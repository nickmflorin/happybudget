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
export const bulkCreateSubAccountsAction = simpleAction<number>(ActionType.Budget.SubAccount.BulkCreate);
export const tableChangedAction = simpleAction<Table.Change<Table.BudgetSubAccountRow>>(
  ActionType.Budget.SubAccount.TableChanged
);
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
export const removeSubAccountAction = simpleAction<number>(ActionType.Budget.SubAccount.SubAccounts.Delete);
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
export const addSubAccountToGroupAction = simpleAction<{ id: number; group: number }>(
  ActionType.Budget.SubAccount.SubAccounts.AddToGroup
);
export const selectSubAccountAction = simpleAction<number>(ActionType.Budget.SubAccount.SubAccounts.Select);
export const deselectSubAccountAction = simpleAction<number>(ActionType.Budget.SubAccount.SubAccounts.Deselect);
export const selectAllSubAccountsAction = simpleAction<null>(ActionType.Budget.SubAccount.SubAccounts.SelectAll);
export const updateSubAccountInStateAction = simpleAction<Redux.UpdateModelActionPayload<Model.BudgetSubAccount>>(
  ActionType.Budget.SubAccount.SubAccounts.UpdateInState
);
export const removeSubAccountFromStateAction = simpleAction<number>(
  ActionType.Budget.SubAccount.SubAccounts.RemoveFromState
);
export const addSubAccountToStateAction = simpleAction<Model.BudgetSubAccount>(
  ActionType.Budget.SubAccount.SubAccounts.AddToState
);
// Errors Functionality Needs to be Built Back In
export const addErrorsToStateAction = simpleAction<Table.CellError | Table.CellError[]>(
  ActionType.Budget.SubAccount.SubAccounts.AddErrors
);
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
export const requestHistoryAction = simpleAction<null>(ActionType.Budget.SubAccount.SubAccounts.History.Request);
export const loadingHistoryAction = simpleAction<boolean>(ActionType.Budget.SubAccount.SubAccounts.History.Loading);
export const responseHistoryAction = simpleAction<Http.ListResponse<Model.HistoryEvent>>(
  ActionType.Budget.SubAccount.SubAccounts.History.Response
);
