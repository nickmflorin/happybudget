import { simpleAction } from "store/actions";

export const ActionType = {
  Accounts: {
    Deleting: "calculator.budget.accounts.Deleting",
    Creating: "calculator.budget.accounts.Creating",
    Updating: "calculator.budget.accounts.Updating",
    Update: "calculator.budget.accounts.Update",
    Remove: "calculator.budget.accounts.Remove",
    AddPlaceholders: "calculator.budget.accounts.AddPlaceholders",
    UpdateRow: "calculator.budget.accounts.UpdateRow",
    ActivatePlaceholder: "calculator.budget.accounts.ActivatePlaceholder",
    RemoveRow: "calculator.budget.accounts.RemoveRow",
    SelectRow: "calculator.budget.accounts.SelectRow",
    SelectAllRows: "calculator.budget.accounts.SelectAllRows",
    DeselectRow: "calculator.budget.accounts.DeselectRow",
    Loading: "calculator.budget.accounts.Loading",
    SetSearch: "calculator.budget.accounts.SetSearch",
    Response: "calculator.budget.accounts.Response",
    Request: "calculator.budget.accounts.Request",
    AddErrors: "calculator.budget.accounts.AddErrors",
    History: {
      Loading: "calculator.budget.accounts.history.Loading",
      Response: "calculator.budget.accounts.history.Response",
      Request: "calculator.budget.accounts.history.Request",
      AddToState: "calculator.budget.accounts.history.AddToState"
    }
  },
  Comments: {
    Loading: "calculator.budget.comments.Loading",
    Response: "calculator.budget.comments.Response",
    Request: "calculator.budget.comments.Request",
    Delete: "calculator.budget.comments.Delete",
    Edit: "calculator.budget.comments.Edit",
    Submit: "calculator.budget.comments.Submit",
    Submitting: "calculator.budget.comments.Submitting",
    Deleting: "calculator.budget.comments.Deleting",
    Editing: "calculator.budget.comments.Editing",
    Replying: "calculator.budget.comments.Replying",
    AddToState: "calculator.budget.comments.AddToState",
    RemoveFromState: "calculator.budget.comments.RemoveFromState",
    UpdateInState: "calculator.budget.comments.UpdateInState"
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
