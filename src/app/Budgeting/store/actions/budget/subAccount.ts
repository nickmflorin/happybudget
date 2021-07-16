import { simpleAction } from "store/actions";
import ActionType from "../ActionType";

export const setSubAccountIdAction = simpleAction<number>(ActionType.Budget.SubAccount.SetId);
export const requestSubAccountAction = simpleAction<null>(ActionType.Budget.SubAccount.Request);
export const loadingSubAccountAction = simpleAction<boolean>(ActionType.Budget.SubAccount.Loading);
export const responseSubAccountAction = simpleAction<Model.SubAccount | undefined>(
  ActionType.Budget.SubAccount.Response
);
// Not currently used, because the reducer handles the logic, but we may need to use in the near future.
export const updateParentSubAccountInStateAction = simpleAction<Partial<Model.Account>>(
  ActionType.Budget.SubAccount.UpdateInState
);
export const handleTableChangeEventAction = simpleAction<
  Table.ChangeEvent<BudgetTable.SubAccountRow, Model.SubAccount>
>(ActionType.Budget.SubAccount.TableChanged);
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
export const deletingSubAccountAction = simpleAction<Redux.ModelListActionPayload>(
  ActionType.Budget.SubAccount.SubAccounts.Deleting
);
export const updatingSubAccountAction = simpleAction<Redux.ModelListActionPayload>(
  ActionType.Budget.SubAccount.SubAccounts.Updating
);
export const creatingSubAccountAction = simpleAction<boolean>(ActionType.Budget.SubAccount.SubAccounts.Creating);
export const requestSubAccountsAction = simpleAction<null>(ActionType.Budget.SubAccount.SubAccounts.Request);
export const loadingSubAccountsAction = simpleAction<boolean>(ActionType.Budget.SubAccount.SubAccounts.Loading);
export const responseSubAccountsAction = simpleAction<Http.ListResponse<Model.SubAccount>>(
  ActionType.Budget.SubAccount.SubAccounts.Response
);
export const setSubAccountsSearchAction = simpleAction<string>(ActionType.Budget.SubAccount.SubAccounts.SetSearch);
export const removeSubAccountFromGroupAction = simpleAction<number>(
  ActionType.Budget.SubAccount.SubAccounts.RemoveFromGroup
);
export const addSubAccountToGroupAction = simpleAction<{ id: number; group: number }>(
  ActionType.Budget.SubAccount.SubAccounts.AddToGroup
);
export const addSubAccountToStateAction = simpleAction<Model.SubAccount>(
  ActionType.Budget.SubAccount.SubAccounts.AddToState
);
export const requestGroupsAction = simpleAction<null>(ActionType.Budget.SubAccount.Groups.Request);
export const loadingGroupsAction = simpleAction<boolean>(ActionType.Budget.SubAccount.Groups.Loading);
export const responseGroupsAction = simpleAction<Http.ListResponse<Model.Group>>(
  ActionType.Budget.SubAccount.Groups.Response
);
export const addGroupToStateAction = simpleAction<Model.Group>(ActionType.Budget.SubAccount.Groups.AddToState);
export const updateGroupInStateAction = simpleAction<Redux.UpdateModelActionPayload<Model.Group>>(
  ActionType.Budget.SubAccount.Groups.UpdateInState
);
export const removeGroupFromStateAction = simpleAction<number>(ActionType.Budget.SubAccount.Groups.RemoveFromState);
export const deletingGroupAction = simpleAction<Redux.ModelListActionPayload>(
  ActionType.Budget.SubAccount.Groups.Deleting
);
export const deleteGroupAction = simpleAction<number>(ActionType.Budget.SubAccount.Groups.Delete);
export const requestHistoryAction = simpleAction<null>(ActionType.Budget.SubAccount.History.Request);
export const loadingHistoryAction = simpleAction<boolean>(ActionType.Budget.SubAccount.History.Loading);
export const responseHistoryAction = simpleAction<Http.ListResponse<Model.HistoryEvent>>(
  ActionType.Budget.SubAccount.History.Response
);
export const requestFringesAction = simpleAction<null>(ActionType.Budget.SubAccount.Fringes.Request);
export const loadingFringesAction = simpleAction<boolean>(ActionType.Budget.SubAccount.Fringes.Loading);
export const responseFringesAction = simpleAction<Http.ListResponse<Model.Fringe>>(
  ActionType.Budget.SubAccount.Fringes.Response
);
export const handleFringesTableChangeEventAction = simpleAction<Table.ChangeEvent<BudgetTable.FringeRow, Model.Fringe>>(
  ActionType.Budget.SubAccount.Fringes.TableChanged
);
export const deletingFringeAction = simpleAction<Redux.ModelListActionPayload>(
  ActionType.Budget.SubAccount.Fringes.Deleting
);
export const updatingFringeAction = simpleAction<Redux.ModelListActionPayload>(
  ActionType.Budget.SubAccount.Fringes.Updating
);
export const creatingFringeAction = simpleAction<boolean>(ActionType.Budget.SubAccount.Fringes.Creating);
export const setFringesSearchAction = simpleAction<string>(ActionType.Budget.SubAccount.Fringes.SetSearch);
export const addFringeToStateAction = simpleAction<Model.Fringe>(ActionType.Budget.SubAccount.Fringes.AddToState);
