import { redux } from "lib";
import ActionType from "../ActionType";

export const setAccountIdAction = redux.actions.simpleAction<number>(ActionType.Budget.Account.SetId);
export const requestAccountAction = redux.actions.simpleAction<null>(ActionType.Budget.Account.Request);
export const loadingAccountAction = redux.actions.simpleAction<boolean>(ActionType.Budget.Account.Loading);
export const responseAccountAction = redux.actions.simpleAction<Model.Account | undefined>(
  ActionType.Budget.Account.Response
);
export const updateAccountInStateAction = redux.actions.simpleAction<Redux.UpdateModelActionPayload<Model.Account>>(
  ActionType.Budget.Account.UpdateInState
);
export const requestCommentsAction = redux.actions.simpleAction<null>(ActionType.Budget.Account.Comments.Request);
export const responseCommentsAction = redux.actions.simpleAction<Http.ListResponse<Model.Comment>>(
  ActionType.Budget.Account.Comments.Response
);
export const loadingCommentsAction = redux.actions.simpleAction<boolean>(ActionType.Budget.Account.Comments.Loading);
export const createCommentAction = redux.actions.simpleAction<{ parent?: number; data: Http.CommentPayload }>(
  ActionType.Budget.Account.Comments.Create
);
export const creatingCommentAction = redux.actions.simpleAction<boolean>(ActionType.Budget.Account.Comments.Creating);
export const deleteCommentAction = redux.actions.simpleAction<number>(ActionType.Budget.Account.Comments.Delete);
export const updateCommentAction = redux.actions.simpleAction<Redux.UpdateModelActionPayload<Model.Comment>>(
  ActionType.Budget.Account.Comments.Update
);
export const replyingToCommentAction = redux.actions.simpleAction<Redux.ModelListActionPayload>(
  ActionType.Budget.Account.Comments.Replying
);
export const deletingCommentAction = redux.actions.simpleAction<Redux.ModelListActionPayload>(
  ActionType.Budget.Account.Comments.Deleting
);
export const updatingCommentAction = redux.actions.simpleAction<Redux.ModelListActionPayload>(
  ActionType.Budget.Account.Comments.Updating
);
export const addCommentToStateAction = redux.actions.simpleAction<{ data: Comment; parent?: number }>(
  ActionType.Budget.Account.Comments.AddToState
);
export const removeCommentFromStateAction = redux.actions.simpleAction<number>(
  ActionType.Budget.Account.Comments.RemoveFromState
);
export const updateCommentInStateAction = redux.actions.simpleAction<Redux.UpdateModelActionPayload<Model.Comment>>(
  ActionType.Budget.Account.Comments.UpdateInState
);
export const handleTableChangeEventAction = redux.actions.simpleAction<
  Table.ChangeEvent<Tables.SubAccountRow, Model.SubAccount>
>(ActionType.Budget.Account.TableChanged);
export const deletingSubAccountAction = redux.actions.simpleAction<Redux.ModelListActionPayload>(
  ActionType.Budget.Account.SubAccounts.Deleting
);
export const updatingSubAccountAction = redux.actions.simpleAction<Redux.ModelListActionPayload>(
  ActionType.Budget.Account.SubAccounts.Updating
);
export const creatingSubAccountAction = redux.actions.simpleAction<boolean>(
  ActionType.Budget.Account.SubAccounts.Creating
);
export const requestSubAccountsAction = redux.actions.simpleAction<null>(ActionType.Budget.Account.SubAccounts.Request);
export const loadingSubAccountsAction = redux.actions.simpleAction<boolean>(
  ActionType.Budget.Account.SubAccounts.Loading
);
export const responseSubAccountsAction = redux.actions.simpleAction<Http.ListResponse<Model.SubAccount>>(
  ActionType.Budget.Account.SubAccounts.Response
);
export const setSubAccountsSearchAction = redux.actions.simpleAction<string>(
  ActionType.Budget.Account.SubAccounts.SetSearch
);
export const addSubAccountToStateAction = redux.actions.simpleAction<Model.SubAccount>(
  ActionType.Budget.Account.SubAccounts.AddToState
);
export const requestGroupsAction = redux.actions.simpleAction<null>(ActionType.Budget.Account.Groups.Request);
export const loadingGroupsAction = redux.actions.simpleAction<boolean>(ActionType.Budget.Account.Groups.Loading);
export const responseGroupsAction = redux.actions.simpleAction<Http.ListResponse<Model.Group>>(
  ActionType.Budget.Account.Groups.Response
);
export const addGroupToStateAction = redux.actions.simpleAction<Model.Group>(
  ActionType.Budget.Account.Groups.AddToState
);
export const updateGroupInStateAction = redux.actions.simpleAction<Redux.UpdateModelActionPayload<Model.Group>>(
  ActionType.Budget.Account.Groups.UpdateInState
);
export const deletingGroupAction = redux.actions.simpleAction<Redux.ModelListActionPayload>(
  ActionType.Budget.Account.Groups.Deleting
);
export const deleteGroupAction = redux.actions.simpleAction<number>(ActionType.Budget.Account.Groups.Delete);
export const requestHistoryAction = redux.actions.simpleAction<null>(ActionType.Budget.Account.History.Request);
export const loadingHistoryAction = redux.actions.simpleAction<boolean>(ActionType.Budget.Account.History.Loading);
export const responseHistoryAction = redux.actions.simpleAction<Http.ListResponse<Model.HistoryEvent>>(
  ActionType.Budget.Account.History.Response
);
export const requestFringesAction = redux.actions.simpleAction<null>(ActionType.Budget.Account.Fringes.Request);
export const loadingFringesAction = redux.actions.simpleAction<boolean>(ActionType.Budget.Account.Fringes.Loading);
export const responseFringesAction = redux.actions.simpleAction<Http.ListResponse<Model.Fringe>>(
  ActionType.Budget.Account.Fringes.Response
);
export const handleFringesTableChangeEventAction = redux.actions.simpleAction<
  Table.ChangeEvent<Tables.FringeRow, Model.Fringe>
>(ActionType.Budget.Account.Fringes.TableChanged);
export const deletingFringeAction = redux.actions.simpleAction<Redux.ModelListActionPayload>(
  ActionType.Budget.Account.Fringes.Deleting
);
export const updatingFringeAction = redux.actions.simpleAction<Redux.ModelListActionPayload>(
  ActionType.Budget.Account.Fringes.Updating
);
export const creatingFringeAction = redux.actions.simpleAction<boolean>(ActionType.Budget.Account.Fringes.Creating);
export const setFringesSearchAction = redux.actions.simpleAction<string>(ActionType.Budget.Account.Fringes.SetSearch);
export const addFringeToStateAction = redux.actions.simpleAction<Model.Fringe>(
  ActionType.Budget.Account.Fringes.AddToState
);
