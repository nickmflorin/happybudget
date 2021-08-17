import { redux } from "lib";
import ActionType from "../ActionType";

export const handleTableChangeEventAction = redux.actions.simpleAction<
  Table.ChangeEvent<Tables.AccountRow, Model.Account>
>(ActionType.Budget.Accounts.TableChanged);
export const requestCommentsAction = redux.actions.simpleAction<null>(ActionType.Budget.Comments.Request);
export const responseCommentsAction = redux.actions.simpleAction<Http.ListResponse<Model.Comment>>(
  ActionType.Budget.Comments.Response
);
export const loadingCommentsAction = redux.actions.simpleAction<boolean>(ActionType.Budget.Comments.Loading);
export const createCommentAction = redux.actions.simpleAction<{
  parent?: number;
  data: Http.CommentPayload;
}>(ActionType.Budget.Comments.Create);
export const creatingCommentAction = redux.actions.simpleAction<boolean>(ActionType.Budget.Comments.Creating);
export const deleteCommentAction = redux.actions.simpleAction<number>(ActionType.Budget.Comments.Delete);
export const updateCommentAction = redux.actions.simpleAction<Redux.UpdateModelActionPayload<Model.Comment>>(
  ActionType.Budget.Comments.Update
);
export const deletingCommentAction = redux.actions.simpleAction<Redux.ModelListActionPayload>(
  ActionType.Budget.Comments.Deleting
);
export const updatingCommentAction = redux.actions.simpleAction<Redux.ModelListActionPayload>(
  ActionType.Budget.Comments.Updating
);
export const replyingToCommentAction = redux.actions.simpleAction<Redux.ModelListActionPayload>(
  ActionType.Budget.Comments.Replying
);
export const addCommentToStateAction = redux.actions.simpleAction<{ data: Comment; parent?: number }>(
  ActionType.Budget.Comments.AddToState
);
export const removeCommentFromStateAction = redux.actions.simpleAction<number>(
  ActionType.Budget.Comments.RemoveFromState
);
export const updateCommentInStateAction = redux.actions.simpleAction<
  Redux.UpdateModelActionPayload<Redux.UpdateModelActionPayload<Model.Comment>>
>(ActionType.Budget.Comments.UpdateInState);
export const deletingAccountAction = redux.actions.simpleAction<Redux.ModelListActionPayload>(
  ActionType.Budget.Accounts.Deleting
);
export const updatingAccountAction = redux.actions.simpleAction<Redux.ModelListActionPayload>(
  ActionType.Budget.Accounts.Updating
);
export const creatingAccountAction = redux.actions.simpleAction<boolean>(ActionType.Budget.Accounts.Creating);
export const requestAccountsAction = redux.actions.simpleAction<null>(ActionType.Budget.Accounts.Request);
export const loadingAccountsAction = redux.actions.simpleAction<boolean>(ActionType.Budget.Accounts.Loading);
export const responseAccountsAction = redux.actions.simpleAction<Http.ListResponse<Model.Account>>(
  ActionType.Budget.Accounts.Response
);
export const setAccountsSearchAction = redux.actions.simpleAction<string>(ActionType.Budget.Accounts.SetSearch);
export const addAccountToStateAction = redux.actions.simpleAction<Model.Account>(ActionType.Budget.Accounts.AddToState);
export const requestGroupsAction = redux.actions.simpleAction<null>(ActionType.Budget.Groups.Request);
export const loadingGroupsAction = redux.actions.simpleAction<boolean>(ActionType.Budget.Groups.Loading);
export const responseGroupsAction = redux.actions.simpleAction<Http.ListResponse<Model.Group>>(
  ActionType.Budget.Groups.Response
);
export const addGroupToStateAction = redux.actions.simpleAction<Model.Group>(ActionType.Budget.Groups.AddToState);
export const updateGroupInStateAction = redux.actions.simpleAction<Redux.UpdateModelActionPayload<Model.Group>>(
  ActionType.Budget.Groups.UpdateInState
);
export const deletingGroupAction = redux.actions.simpleAction<Redux.ModelListActionPayload>(
  ActionType.Budget.Groups.Deleting
);
export const deleteGroupAction = redux.actions.simpleAction<number>(ActionType.Budget.Groups.Delete);

export const requestAccountsHistoryAction = redux.actions.simpleAction<null>(ActionType.Budget.History.Request);
export const loadingAccountsHistoryAction = redux.actions.simpleAction<boolean>(ActionType.Budget.History.Loading);
export const responseAccountsHistoryAction = redux.actions.simpleAction<Http.ListResponse<Model.HistoryEvent>>(
  ActionType.Budget.History.Response
);
export const addAccountsHistoryToStateAction = redux.actions.simpleAction<Model.HistoryEvent>(
  ActionType.Budget.History.AddToState
);
