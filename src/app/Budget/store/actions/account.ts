import { createAction } from "@reduxjs/toolkit";
import ActionType from "./ActionType";

export const setAccountIdAction = createAction<ID | null>(ActionType.Account.SetId);
export const requestAccountAction = createAction<null>(ActionType.Account.Request);
export const loadingAccountAction = createAction<boolean>(ActionType.Account.Loading);
export const responseAccountAction = createAction<Model.Account | undefined>(ActionType.Account.Response);
export const updateAccountInStateAction = createAction<Redux.UpdateActionPayload<Model.Account>>(
  ActionType.Account.UpdateInState
);

export const handleTableChangeEventAction = createAction<Table.ChangeEvent<Tables.SubAccountRowData, Model.SubAccount>>(
  ActionType.Account.SubAccounts.TableChanged
);
export const savingTableAction = createAction<boolean>(ActionType.Account.SubAccounts.Saving);
export const requestAction = createAction<null>(ActionType.Account.SubAccounts.Request);
export const loadingAction = createAction<boolean>(ActionType.Account.SubAccounts.Loading);
export const responseAction = createAction<Http.TableResponse<Model.SubAccount, Model.BudgetGroup>>(
  ActionType.Account.SubAccounts.Response
);
export const addModelsToStateAction = createAction<Redux.AddModelsToTablePayload<Model.SubAccount>>(
  ActionType.Account.SubAccounts.AddToState
);
export const addPlaceholdersToState = createAction<Table.RowAdd<Tables.SubAccountRowData, Model.SubAccount>[]>(
  ActionType.Account.SubAccounts.AddPlaceholdersToState
);
export const setSearchAction = createAction<string>(ActionType.Account.SubAccounts.SetSearch);

export const requestCommentsAction = createAction<null>(ActionType.Account.Comments.Request);
export const responseCommentsAction = createAction<Http.ListResponse<Model.Comment>>(
  ActionType.Account.Comments.Response
);
export const loadingCommentsAction = createAction<boolean>(ActionType.Account.Comments.Loading);
export const createCommentAction = createAction<{
  parent?: ID;
  data: Http.CommentPayload;
}>(ActionType.Account.Comments.Create);
export const creatingCommentAction = createAction<boolean>(ActionType.Account.Comments.Creating);
export const deleteCommentAction = createAction<ID>(ActionType.Account.Comments.Delete);
export const updateCommentAction = createAction<Redux.UpdateActionPayload<Model.Comment>>(
  ActionType.Account.Comments.Update
);
export const replyingToCommentAction = createAction<Redux.ModelListActionPayload>(ActionType.Account.Comments.Replying);
export const deletingCommentAction = createAction<Redux.ModelListActionPayload>(ActionType.Account.Comments.Deleting);
export const updatingCommentAction = createAction<Redux.ModelListActionPayload>(ActionType.Account.Comments.Updating);
export const addCommentToStateAction = createAction<{ data: Model.Comment; parent?: ID }>(
  ActionType.Account.Comments.AddToState
);
export const removeCommentFromStateAction = createAction<ID>(ActionType.Account.Comments.RemoveFromState);
export const updateCommentInStateAction = createAction<Redux.UpdateActionPayload<Model.Comment>>(
  ActionType.Account.Comments.UpdateInState
);

export const addGroupToStateAction = createAction<Model.BudgetGroup>(ActionType.Account.Groups.AddToState);
export const updateGroupInStateAction = createAction<Redux.UpdateActionPayload<Model.BudgetGroup>>(
  ActionType.Account.Groups.UpdateInState
);
export const requestHistoryAction = createAction<null>(ActionType.Account.History.Request);
export const loadingHistoryAction = createAction<boolean>(ActionType.Account.History.Loading);
export const responseHistoryAction = createAction<Http.ListResponse<Model.HistoryEvent>>(
  ActionType.Account.History.Response
);
