import { simpleAction } from "store/actions";
import ActionType from "../ActionType";

export const setAccountIdAction = simpleAction<number>(ActionType.Budget.Account.SetId);
export const requestAccountAction = simpleAction<null>(ActionType.Budget.Account.Request);
export const loadingAccountAction = simpleAction<boolean>(ActionType.Budget.Account.Loading);
export const responseAccountAction = simpleAction<Model.Account | undefined>(ActionType.Budget.Account.Response);
export const updateAccountInStateAction = simpleAction<Redux.UpdateModelActionPayload<Model.Account>>(
  ActionType.Budget.Account.UpdateInState
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
export const updateCommentInStateAction = simpleAction<Redux.UpdateModelActionPayload<Model.Comment>>(
  ActionType.Budget.Account.Comments.UpdateInState
);
export const handleTableChangeEventAction = simpleAction<
  Table.ChangeEvent<BudgetTable.SubAccountRow, Model.SubAccount>
>(ActionType.Budget.Account.TableChanged);
export const deletingSubAccountAction = simpleAction<Redux.ModelListActionPayload>(
  ActionType.Budget.Account.SubAccounts.Deleting
);
export const updatingSubAccountAction = simpleAction<Redux.ModelListActionPayload>(
  ActionType.Budget.Account.SubAccounts.Updating
);
export const creatingSubAccountAction = simpleAction<boolean>(ActionType.Budget.Account.SubAccounts.Creating);
export const requestSubAccountsAction = simpleAction<null>(ActionType.Budget.Account.SubAccounts.Request);
export const loadingSubAccountsAction = simpleAction<boolean>(ActionType.Budget.Account.SubAccounts.Loading);
export const responseSubAccountsAction = simpleAction<Http.ListResponse<Model.SubAccount>>(
  ActionType.Budget.Account.SubAccounts.Response
);
export const setSubAccountsSearchAction = simpleAction<string>(ActionType.Budget.Account.SubAccounts.SetSearch);
export const addSubAccountToStateAction = simpleAction<Model.SubAccount>(
  ActionType.Budget.Account.SubAccounts.AddToState
);
export const requestGroupsAction = simpleAction<null>(ActionType.Budget.Account.Groups.Request);
export const loadingGroupsAction = simpleAction<boolean>(ActionType.Budget.Account.Groups.Loading);
export const responseGroupsAction = simpleAction<Http.ListResponse<Model.Group>>(
  ActionType.Budget.Account.Groups.Response
);
export const addGroupToStateAction = simpleAction<Model.Group>(ActionType.Budget.Account.Groups.AddToState);
export const updateGroupInStateAction = simpleAction<Redux.UpdateModelActionPayload<Model.Group>>(
  ActionType.Budget.Account.Groups.UpdateInState
);
export const deletingGroupAction = simpleAction<Redux.ModelListActionPayload>(
  ActionType.Budget.Account.Groups.Deleting
);
export const deleteGroupAction = simpleAction<number>(ActionType.Budget.Account.Groups.Delete);
export const requestHistoryAction = simpleAction<null>(ActionType.Budget.Account.History.Request);
export const loadingHistoryAction = simpleAction<boolean>(ActionType.Budget.Account.History.Loading);
export const responseHistoryAction = simpleAction<Http.ListResponse<Model.HistoryEvent>>(
  ActionType.Budget.Account.History.Response
);
export const requestFringesAction = simpleAction<null>(ActionType.Budget.Account.Fringes.Request);
export const loadingFringesAction = simpleAction<boolean>(ActionType.Budget.Account.Fringes.Loading);
export const responseFringesAction = simpleAction<Http.ListResponse<Model.Fringe>>(
  ActionType.Budget.Account.Fringes.Response
);
export const handleFringesTableChangeEventAction = simpleAction<Table.ChangeEvent<BudgetTable.FringeRow, Model.Fringe>>(
  ActionType.Budget.Account.Fringes.TableChanged
);
export const deletingFringeAction = simpleAction<Redux.ModelListActionPayload>(
  ActionType.Budget.Account.Fringes.Deleting
);
export const updatingFringeAction = simpleAction<Redux.ModelListActionPayload>(
  ActionType.Budget.Account.Fringes.Updating
);
export const creatingFringeAction = simpleAction<boolean>(ActionType.Budget.Account.Fringes.Creating);
export const setFringesSearchAction = simpleAction<string>(ActionType.Budget.Account.Fringes.SetSearch);
export const addFringeToStateAction = simpleAction<Model.Fringe>(ActionType.Budget.Account.Fringes.AddToState);
