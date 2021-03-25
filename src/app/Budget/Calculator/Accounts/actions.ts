import { simpleAction } from "store/actions";

export const ActionType = {
  Accounts: {
    Deleting: "calculator.accounts.Deleting",
    Creating: "calculator.accounts.Creating",
    Updating: "calculator.accounts.Updating",
    Update: "calculator.accounts.Update",
    Remove: "calculator.accounts.Remove",
    AddPlaceholders: "calculator.accounts.AddPlaceholders",
    UpdateRow: "calculator.accounts.UpdateRow",
    ActivatePlaceholder: "calculator.accounts.ActivatePlaceholder",
    RemoveRow: "calculator.accounts.RemoveRow",
    SelectRow: "calculator.accounts.SelectRow",
    SelectAllRows: "calculator.accounts.SelectAllRows",
    DeselectRow: "calculator.accounts.DeselectRow",
    Loading: "calculator.accounts.Loading",
    SetSearch: "calculator.accounts.SetSearch",
    Response: "calculator.accounts.Response",
    Request: "calculator.accounts.Request",
    AddErrors: "calculator.accounts.AddErrors",
    History: {
      Loading: "calculator.accounts.history.Loading",
      Response: "calculator.accounts.history.Response",
      Request: "calculator.accounts.history.Request",
      AddToState: "calculator.accounts.history.AddToState"
    }
  },
  Comments: {
    Loading: "calculator.accounts.comments.Loading",
    Response: "calculator.accounts.comments.Response",
    Request: "calculator.accounts.comments.Request",
    Delete: "calculator.accounts.comments.Delete",
    Edit: "calculator.accounts.comments.Edit",
    Submit: "calculator.accounts.comments.Submit",
    Submitting: "calculator.accounts.comments.Submitting",
    Deleting: "calculator.accounts.comments.Deleting",
    Editing: "calculator.accounts.comments.Editing",
    Replying: "calculator.accounts.comments.Replying",
    AddToState: "calculator.accounts.comments.AddToState",
    RemoveFromState: "calculator.accounts.comments.RemoveFromState",
    UpdateInState: "calculator.accounts.comments.UpdateInState"
  }
};

/*
  Actions Pertaining to Budget Comments
*/
export const requestCommentsAction = simpleAction<null>(ActionType.Comments.Request);
export const responseCommentsAction = simpleAction<Http.IListResponse<IComment>>(ActionType.Comments.Response);
export const loadingCommentsAction = simpleAction<boolean>(ActionType.Comments.Loading);
export const submitCommentAction = simpleAction<{ parent?: number; data: Http.ICommentPayload }>(
  ActionType.Comments.Submit
);
export const submittingCommentAction = simpleAction<boolean>(ActionType.Comments.Submitting);
export const deleteCommentAction = simpleAction<number>(ActionType.Comments.Delete);
export const editCommentAction = simpleAction<Redux.UpdateModelActionPayload<IComment>>(ActionType.Comments.Edit);
export const deletingCommentAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Comments.Deleting);
export const editingCommentAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Comments.Editing);
export const replyingToCommentAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Comments.Replying);
export const addCommentToStateAction = simpleAction<{ data: IComment; parent?: number }>(
  ActionType.Comments.AddToState
);
export const removeCommentFromStateAction = simpleAction<number>(ActionType.Comments.RemoveFromState);
export const updateCommentInStateAction = simpleAction<Redux.UpdateModelActionPayload<IComment>>(
  ActionType.Comments.UpdateInState
);

/*
  Actions Pertaining to Budget Accounts
*/
export const addPlaceholdersAction = simpleAction<number>(ActionType.Accounts.AddPlaceholders);
export const updateAccountAction = simpleAction<Table.RowChange>(ActionType.Accounts.Update);
export const updateTableRowAction = simpleAction<{ id: number; data: Partial<Table.AccountRow> }>(
  ActionType.Accounts.UpdateRow
);
export const activatePlaceholderAction = simpleAction<Table.IActivatePlaceholderPayload>(
  ActionType.Accounts.ActivatePlaceholder
);
export const selectAccountAction = simpleAction<number>(ActionType.Accounts.SelectRow);
export const selectAllAccountsAction = simpleAction<null>(ActionType.Accounts.SelectAllRows);
export const deselectAccountAction = simpleAction<number>(ActionType.Accounts.DeselectRow);
export const removeTableRowAction = simpleAction<number>(ActionType.Accounts.RemoveRow);
export const removeAccountAction = simpleAction<number>(ActionType.Accounts.Remove);
export const deletingAccountAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Accounts.Deleting);
export const updatingAccountAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Accounts.Updating);
export const creatingAccountAction = simpleAction<boolean>(ActionType.Accounts.Creating);
export const requestAccountsAction = simpleAction<null>(ActionType.Accounts.Request);
export const loadingAccountsAction = simpleAction<boolean>(ActionType.Accounts.Loading);
export const responseAccountsAction = simpleAction<Http.IListResponse<ISubAccount>>(ActionType.Accounts.Response);
export const setAccountsSearchAction = simpleAction<string>(ActionType.Accounts.SetSearch);
export const addErrorsToTableAction = simpleAction<Table.CellError | Table.CellError[]>(ActionType.Accounts.AddErrors);

/*
  Actions Pertaining to Budget Accounts History
*/
export const requestAccountsHistoryAction = simpleAction<null>(ActionType.Accounts.History.Request);
export const loadingAccountsHistoryAction = simpleAction<boolean>(ActionType.Accounts.History.Loading);
export const responseAccountsHistoryAction = simpleAction<Http.IListResponse<HistoryEvent>>(
  ActionType.Accounts.History.Response
);
export const addAccountsHistoryToStateAction = simpleAction<HistoryEvent>(ActionType.Accounts.History.AddToState);
