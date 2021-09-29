import { createAction } from "@reduxjs/toolkit";
import ActionType from "./ActionType";

export const handleTableChangeEventAction = createAction<Table.ChangeEvent<Tables.AccountRowData>>(
  ActionType.Accounts.TableChanged
);
export const savingTableAction = createAction<boolean>(ActionType.Accounts.Saving);
export const requestAction = createAction<null>(ActionType.Accounts.Request);
export const loadingAction = createAction<boolean>(ActionType.Accounts.Loading);
export const responseAction = createAction<Http.TableResponse<Model.Account>>(ActionType.Accounts.Response);
export const clearAction = createAction<null>(ActionType.Accounts.Clear);
export const setSearchAction = createAction<string>(ActionType.Accounts.SetSearch);
export const addModelsToStateAction = createAction<Redux.AddModelsToTablePayload<Model.Account>>(
  ActionType.Accounts.AddToState
);

export const requestCommentsAction = createAction<null>(ActionType.Comments.Request);
export const responseCommentsAction = createAction<Http.ListResponse<Model.Comment>>(ActionType.Comments.Response);
export const loadingCommentsAction = createAction<boolean>(ActionType.Comments.Loading);
export const createCommentAction = createAction<{
  parent?: number;
  data: Http.CommentPayload;
}>(ActionType.Comments.Create);
export const creatingCommentAction = createAction<boolean>(ActionType.Comments.Creating);
export const deleteCommentAction = createAction<number>(ActionType.Comments.Delete);
export const updateCommentAction = createAction<Redux.UpdateActionPayload<Model.Comment>>(ActionType.Comments.Update);
export const deletingCommentAction = createAction<Redux.ModelListActionPayload>(ActionType.Comments.Deleting);
export const updatingCommentAction = createAction<Redux.ModelListActionPayload>(ActionType.Comments.Updating);
export const replyingToCommentAction = createAction<Redux.ModelListActionPayload>(ActionType.Comments.Replying);
export const addCommentToStateAction = createAction<{ data: Model.Comment; parent?: number }>(
  ActionType.Comments.AddToState
);
export const removeCommentFromStateAction = createAction<number>(ActionType.Comments.RemoveFromState);
export const updateCommentInStateAction = createAction<
  Redux.UpdateActionPayload<Redux.UpdateActionPayload<Model.Comment, number>>
>(ActionType.Comments.UpdateInState);

export const requestHistoryAction = createAction<null>(ActionType.History.Request);
export const loadingHistoryAction = createAction<boolean>(ActionType.History.Loading);
export const responseHistoryAction = createAction<Http.ListResponse<Model.HistoryEvent>>(ActionType.History.Response);
export const addHistoryToStateAction = createAction<Model.HistoryEvent>(ActionType.History.AddToState);
