import { simpleAction } from "store/actions";

export const ActionType = {
  Account: {
    SetId: "calculator.account.SetId",
    Loading: "calculator.account.Loading",
    Response: "calculator.account.Response",
    Request: "calculator.account.Request",
    Refresh: "calculator.account.Refresh"
  },
  Comments: {
    Loading: "calculator.account.comments.Loading",
    Response: "calculator.account.comments.Response",
    Request: "calculator.account.comments.Request",
    Submitting: "calculator.account.comments.Submitting",
    Deleting: "calculator.account.comments.Deleting",
    Editing: "calculator.account.comments.Editing",
    Replying: "calculator.account.comments.Replying",
    Delete: "calculator.account.comments.Delete",
    Edit: "calculator.account.comments.Edit",
    Submit: "calculator.account.comments.Submit",
    AddToState: "calculator.account.comments.AddToState",
    RemoveFromState: "calculator.account.comments.RemoveFromState",
    UpdateInState: "calculator.account.comments.UpdateInState"
  },
  SubAccounts: {
    Deleting: "calculator.account.subaccounts.Deleting",
    Creating: "calculator.account.subaccounts.Creating",
    Updating: "calculator.account.subaccounts.Updating",
    Update: "calculator.account.subaccounts.Update",
    Remove: "calculator.account.subaccounts.Remove",
    AddPlaceholders: "calculator.account.subaccounts.AddPlaceholders",
    UpdateRow: "calculator.account.subaccounts.UpdateRow",
    ActivatePlaceholder: "calculator.account.subaccounts.ActivatePlaceholder",
    RemoveRow: "calculator.account.subaccounts.RemoveRow",
    SelectAllRows: "calculator.account.subaccounts.SelectAllRows",
    SelectRow: "calculator.account.subaccounts.SelectRow",
    DeselectRow: "calculator.account.subaccounts.DeselectRow",
    SetSearch: "calculator.account.subaccounts.SetSearch",
    Loading: "calculator.account.subaccounts.Loading",
    Response: "calculator.account.subaccounts.Response",
    Request: "calculator.account.subaccounts.Request",
    AddErrors: "calculator.account.subaccounts.AddErrors",
    AddGroupToRows: "calculator.account.subaccounts.AddGroupToRows",
    RemoveGroupFromRows: "calculator.account.subaccounts.RemoveGroupFromRows",
    Groups: {
      Delete: "calculator.account.subaccounts.groups.Delete",
      Deleting: "calculator.account.subaccounts.groups.Deleting"
    },
    History: {
      Loading: "calculator.account.subaccounts.history.Loading",
      Response: "calculator.account.subaccounts.history.Response",
      Request: "calculator.account.subaccounts.history.Request"
    }
  }
};

export const setAccountIdAction = simpleAction<number>(ActionType.Account.SetId);
export const requestAccountAction = simpleAction<null>(ActionType.Account.Request);
export const loadingAccountAction = simpleAction<boolean>(ActionType.Account.Loading);
export const responseAccountAction = simpleAction<IAccount>(ActionType.Account.Response);

/*
  Actions Pertaining to Account Comments
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
export const replyingToCommentAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Comments.Replying);
export const deletingCommentAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Comments.Deleting);
export const editingCommentAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Comments.Editing);
export const addCommentToStateAction = simpleAction<{ data: IComment; parent?: number }>(
  ActionType.Comments.AddToState
);
export const removeCommentFromStateAction = simpleAction<number>(ActionType.Comments.RemoveFromState);
export const updateCommentInStateAction = simpleAction<Redux.UpdateModelActionPayload<IComment>>(
  ActionType.Comments.UpdateInState
);
/*
  Actions Pertaining to Account Sub Accounts
*/
export const addSubAccountsPlaceholdersAction = simpleAction<number>(ActionType.SubAccounts.AddPlaceholders);
export const updateSubAccountAction = simpleAction<Table.RowChange>(ActionType.SubAccounts.Update);
export const selectSubAccountAction = simpleAction<number>(ActionType.SubAccounts.SelectRow);
export const deselectSubAccountAction = simpleAction<number>(ActionType.SubAccounts.DeselectRow);
export const selectAllSubAccountsAction = simpleAction<null>(ActionType.SubAccounts.SelectAllRows);
export const updateSubAccountsTableRowAction = simpleAction<{
  id: number;
  data: Partial<Table.SubAccountRow>;
}>(ActionType.SubAccounts.UpdateRow);
export const activateSubAccountsTablePlaceholderAction = simpleAction<Table.IActivatePlaceholderPayload>(
  ActionType.SubAccounts.ActivatePlaceholder
);
export const removeSubAccountsTableRowAction = simpleAction<number>(ActionType.SubAccounts.RemoveRow);
export const removeSubAccountAction = simpleAction<number>(ActionType.SubAccounts.Remove);
export const deletingSubAccountAction = simpleAction<Redux.ModelListActionPayload>(ActionType.SubAccounts.Deleting);
export const updatingSubAccountAction = simpleAction<Redux.ModelListActionPayload>(ActionType.SubAccounts.Updating);
export const creatingSubAccountAction = simpleAction<boolean>(ActionType.SubAccounts.Creating);
export const requestSubAccountsAction = simpleAction<null>(ActionType.SubAccounts.Request);
export const loadingSubAccountsAction = simpleAction<boolean>(ActionType.SubAccounts.Loading);
export const responseSubAccountsAction = simpleAction<Http.IListResponse<ISubAccount>>(ActionType.SubAccounts.Response);
export const setSubAccountsSearchAction = simpleAction<string>(ActionType.SubAccounts.SetSearch);
export const addErrorsToSubAccountsTableAction = simpleAction<Table.CellError | Table.CellError[]>(
  ActionType.SubAccounts.AddErrors
);
export const addGroupToSubAccountsTableRowsAction = simpleAction<{ group: Table.RowGroup; ids: number[] }>(
  ActionType.SubAccounts.AddGroupToRows
);
export const removeGroupFromSubAccountsTableRowsAction = simpleAction<number>(
  ActionType.SubAccounts.RemoveGroupFromRows
);
export const deletingSubAccountsGroupAction = simpleAction<boolean>(ActionType.SubAccounts.Groups.Deleting);
export const deleteSubAccountsGroupAction = simpleAction<number>(ActionType.SubAccounts.Groups.Delete);

/*
  Actions Pertaining to Account Sub Accounts History
*/
export const requestSubAccountsHistoryAction = simpleAction<null>(ActionType.SubAccounts.History.Request);
export const loadingSubAccountsHistoryAction = simpleAction<boolean>(ActionType.SubAccounts.History.Loading);
export const responseSubAccountsHistoryAction = simpleAction<Http.IListResponse<HistoryEvent>>(
  ActionType.SubAccounts.History.Response
);