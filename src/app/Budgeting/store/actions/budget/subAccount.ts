import { redux } from "lib";
import ActionType from "../ActionType";

export const setSubAccountIdAction = redux.actions.simpleAction<number>(ActionType.Budget.SubAccount.SetId);
export const requestSubAccountAction = redux.actions.simpleAction<null>(ActionType.Budget.SubAccount.Request);
export const loadingSubAccountAction = redux.actions.simpleAction<boolean>(ActionType.Budget.SubAccount.Loading);
export const responseSubAccountAction = redux.actions.simpleAction<Model.SubAccount | undefined>(
  ActionType.Budget.SubAccount.Response
);
// Not currently used, because the reducer handles the logic, but we may need to use in the near future.
export const updateParentSubAccountInStateAction = redux.actions.simpleAction<Partial<Model.Account>>(
  ActionType.Budget.SubAccount.UpdateInState
);
export const handleTableChangeEventAction = redux.actions.simpleAction<
  Table.ChangeEvent<Tables.SubAccountRow, Model.SubAccount>
>(ActionType.Budget.SubAccount.TableChanged);
export const requestCommentsAction = redux.actions.simpleAction<null>(ActionType.Budget.SubAccount.Comments.Request);
export const responseCommentsAction = redux.actions.simpleAction<Http.ListResponse<Model.Comment>>(
  ActionType.Budget.SubAccount.Comments.Response
);
export const loadingCommentsAction = redux.actions.simpleAction<boolean>(ActionType.Budget.SubAccount.Comments.Loading);
export const createCommentAction = redux.actions.simpleAction<{
  parent?: number;
  data: Http.CommentPayload;
}>(ActionType.Budget.SubAccount.Comments.Create);
export const creatingCommentAction = redux.actions.simpleAction<boolean>(
  ActionType.Budget.SubAccount.Comments.Creating
);
export const deleteCommentAction = redux.actions.simpleAction<number>(ActionType.Budget.SubAccount.Comments.Delete);
export const updateCommentAction = redux.actions.simpleAction<Redux.UpdateModelActionPayload<Model.Comment>>(
  ActionType.Budget.SubAccount.Comments.Update
);
export const replyingToCommentAction = redux.actions.simpleAction<Redux.ModelListActionPayload>(
  ActionType.Budget.SubAccount.Comments.Replying
);
export const deletingCommentAction = redux.actions.simpleAction<Redux.ModelListActionPayload>(
  ActionType.Budget.SubAccount.Comments.Deleting
);
export const updatingCommentAction = redux.actions.simpleAction<Redux.ModelListActionPayload>(
  ActionType.Budget.SubAccount.Comments.Updating
);
export const addCommentToStateAction = redux.actions.simpleAction<{
  data: Model.Comment;
  parent?: number;
}>(ActionType.Budget.SubAccount.Comments.AddToState);
export const removeCommentFromStateAction = redux.actions.simpleAction<number>(
  ActionType.Budget.SubAccount.Comments.RemoveFromState
);
export const updateCommentInStateAction = redux.actions.simpleAction<
  Redux.UpdateModelActionPayload<Redux.UpdateModelActionPayload<Model.Comment>>
>(ActionType.Budget.SubAccount.Comments.UpdateInState);
export const deletingSubAccountAction = redux.actions.simpleAction<Redux.ModelListActionPayload>(
  ActionType.Budget.SubAccount.SubAccounts.Deleting
);
export const updatingSubAccountAction = redux.actions.simpleAction<Redux.ModelListActionPayload>(
  ActionType.Budget.SubAccount.SubAccounts.Updating
);
export const creatingSubAccountAction = redux.actions.simpleAction<boolean>(
  ActionType.Budget.SubAccount.SubAccounts.Creating
);
export const requestSubAccountsAction = redux.actions.simpleAction<null>(
  ActionType.Budget.SubAccount.SubAccounts.Request
);
export const loadingSubAccountsAction = redux.actions.simpleAction<boolean>(
  ActionType.Budget.SubAccount.SubAccounts.Loading
);
export const responseSubAccountsAction = redux.actions.simpleAction<Http.ListResponse<Model.SubAccount>>(
  ActionType.Budget.SubAccount.SubAccounts.Response
);
export const setSubAccountsSearchAction = redux.actions.simpleAction<string>(
  ActionType.Budget.SubAccount.SubAccounts.SetSearch
);
export const addSubAccountToStateAction = redux.actions.simpleAction<Model.SubAccount>(
  ActionType.Budget.SubAccount.SubAccounts.AddToState
);
export const requestGroupsAction = redux.actions.simpleAction<null>(ActionType.Budget.SubAccount.Groups.Request);
export const loadingGroupsAction = redux.actions.simpleAction<boolean>(ActionType.Budget.SubAccount.Groups.Loading);
export const responseGroupsAction = redux.actions.simpleAction<Http.ListResponse<Model.Group>>(
  ActionType.Budget.SubAccount.Groups.Response
);
export const addGroupToStateAction = redux.actions.simpleAction<Model.Group>(
  ActionType.Budget.SubAccount.Groups.AddToState
);
export const updateGroupInStateAction = redux.actions.simpleAction<Redux.UpdateModelActionPayload<Model.Group>>(
  ActionType.Budget.SubAccount.Groups.UpdateInState
);
export const deletingGroupAction = redux.actions.simpleAction<Redux.ModelListActionPayload>(
  ActionType.Budget.SubAccount.Groups.Deleting
);
export const deleteGroupAction = redux.actions.simpleAction<number>(ActionType.Budget.SubAccount.Groups.Delete);
export const requestHistoryAction = redux.actions.simpleAction<null>(ActionType.Budget.SubAccount.History.Request);
export const loadingHistoryAction = redux.actions.simpleAction<boolean>(ActionType.Budget.SubAccount.History.Loading);
export const responseHistoryAction = redux.actions.simpleAction<Http.ListResponse<Model.HistoryEvent>>(
  ActionType.Budget.SubAccount.History.Response
);
export const requestFringesAction = redux.actions.simpleAction<null>(ActionType.Budget.SubAccount.Fringes.Request);
export const loadingFringesAction = redux.actions.simpleAction<boolean>(ActionType.Budget.SubAccount.Fringes.Loading);
export const responseFringesAction = redux.actions.simpleAction<Http.ListResponse<Model.Fringe>>(
  ActionType.Budget.SubAccount.Fringes.Response
);
export const handleFringesTableChangeEventAction = redux.actions.simpleAction<
  Table.ChangeEvent<Tables.FringeRow, Model.Fringe>
>(ActionType.Budget.SubAccount.Fringes.TableChanged);
export const deletingFringeAction = redux.actions.simpleAction<Redux.ModelListActionPayload>(
  ActionType.Budget.SubAccount.Fringes.Deleting
);
export const updatingFringeAction = redux.actions.simpleAction<Redux.ModelListActionPayload>(
  ActionType.Budget.SubAccount.Fringes.Updating
);
export const creatingFringeAction = redux.actions.simpleAction<boolean>(ActionType.Budget.SubAccount.Fringes.Creating);
export const setFringesSearchAction = redux.actions.simpleAction<string>(
  ActionType.Budget.SubAccount.Fringes.SetSearch
);
export const addFringeToStateAction = redux.actions.simpleAction<Model.Fringe>(
  ActionType.Budget.SubAccount.Fringes.AddToState
);
