import { simpleAction } from "store/actions";

export const ActionType = {
  SubAccount: {
    SetId: "calculator.subaccount.SetId",
    Loading: "calculator.subaccount.Loading",
    Response: "calculator.subaccount.Response",
    Request: "calculator.subaccount.Request",
    UpdateInState: "calculator.account.UpdateInState"
  },
  Comments: {
    Loading: "calculator.subaccount.comments.Loading",
    Response: "calculator.subaccount.comments.Response",
    Request: "calculator.subaccount.comments.Request",
    Delete: "calculator.subaccount.comments.Delete",
    Edit: "calculator.subaccount.comments.Edit",
    Submitting: "calculator.subaccount.comments.Submitting",
    Deleting: "calculator.subaccount.comments.Deleting",
    Replying: "calculator.subaccount.comments.Replying",
    Editing: "calculator.subaccount.comments.Editing",
    Submit: "calculator.subaccount.comments.Submit",
    AddToState: "calculator.subaccount.comments.AddToState",
    RemoveFromState: "calculator.subaccount.comments.RemoveFromState",
    UpdateInState: "calculator.subaccount.comments.UpdateInState"
  },
  SubAccounts: {
    Deleting: "calculator.subaccount.subaccounts.Deleting",
    Creating: "calculator.subaccount.subaccounts.Creating",
    Updating: "calculator.subaccount.subaccounts.Updating",
    Update: "calculator.subaccount.subaccounts.Update",
    Remove: "calculator.subaccount.subaccounts.Remove",
    AddPlaceholders: "calculator.subaccount.subaccounts.AddPlaceholders",
    UpdateRow: "calculator.subaccount.subaccounts.UpdateRow",
    ActivatePlaceholder: "calculator.subaccount.subaccounts.ActivatePlaceholder",
    RemoveRow: "calculator.subaccount.subaccounts.RemoveRow",
    SelectRow: "calculator.subaccount.subaccounts.SelectRow",
    SelectAllRows: "calculator.subaccount.subaccounts.SelectAllRows",
    DeselectRow: "calculator.subaccount.subaccounts.DeselectRow",
    SetSearch: "calculator.subaccount.subaccounts.SetSearch",
    Loading: "calculator.subaccount.subaccounts.Loading",
    Response: "calculator.subaccount.subaccounts.Response",
    Request: "calculator.subaccount.subaccounts.Request",
    AddErrors: "calculator.subaccount.subaccounts.AddErrors",
    UpdateInState: "calculator.subaccount.subaccounts.UpdateInState",
    Groups: {
      Delete: "calculator.subaccount.subaccounts.groups.Delete",
      Deleting: "calculator.subaccount.subaccounts.groups.Deleting",
      AddToState: "calculator.subaccount.subaccounts.AddToState",
      AddToTable: "calculator.subaccount.subaccounts.AddToTable",
      RemoveFromTable: "calculator.subaccount.subaccounts.RemoveFromTable",
      UpdateInTable: "calculator.subaccount.subaccounts.groups.UpdateInTable"
    },
    History: {
      Loading: "calculator.subaccount.subaccounts.history.Loading",
      Response: "calculator.subaccount.subaccounts.history.Response",
      Request: "calculator.subaccount.subaccounts.history.Request"
    }
  }
};
export const setSubAccountIdAction = simpleAction<number>(ActionType.SubAccount.SetId);
export const requestSubAccountAction = simpleAction<null>(ActionType.SubAccount.Request);
export const loadingSubAccountAction = simpleAction<boolean>(ActionType.SubAccount.Loading);
export const responseSubAccountAction = simpleAction<ISubAccount>(ActionType.SubAccount.Response);
export const updateParentSubAccountInStateAction = simpleAction<Partial<IAccount>>(ActionType.SubAccount.UpdateInState);

/*
  Actions Pertaining to Sub Account Comments
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
  Actions Pertaining to Sub Account Sub Accounts
*/
export const addPlaceholdersAction = simpleAction<number>(ActionType.SubAccounts.AddPlaceholders);
export const updateSubAccountAction = simpleAction<Table.RowChange>(ActionType.SubAccounts.Update);
export const selectSubAccountAction = simpleAction<number>(ActionType.SubAccounts.SelectRow);
export const selectAllSubAccountsAction = simpleAction<null>(ActionType.SubAccounts.SelectAllRows);
export const deselectSubAccountAction = simpleAction<number>(ActionType.SubAccounts.DeselectRow);
export const updateTableRowAction = simpleAction<{
  id: number;
  data: Partial<Table.SubAccountRow>;
}>(ActionType.SubAccounts.UpdateRow);
export const activatePlaceholderAction = simpleAction<Table.ActivatePlaceholderPayload<ISubAccount>>(
  ActionType.SubAccounts.ActivatePlaceholder
);
export const removeTableRowAction = simpleAction<number>(ActionType.SubAccounts.RemoveRow);
export const removeSubAccountAction = simpleAction<number>(ActionType.SubAccounts.Remove);
export const deletingSubAccountAction = simpleAction<Redux.ModelListActionPayload>(ActionType.SubAccounts.Deleting);
export const updatingSubAccountAction = simpleAction<Redux.ModelListActionPayload>(ActionType.SubAccounts.Updating);
export const creatingSubAccountAction = simpleAction<boolean>(ActionType.SubAccounts.Creating);
export const requestSubAccountsAction = simpleAction<null>(ActionType.SubAccounts.Request);
export const loadingSubAccountsAction = simpleAction<boolean>(ActionType.SubAccounts.Loading);
export const responseSubAccountsAction = simpleAction<Http.IListResponse<ISubAccount>>(ActionType.SubAccounts.Response);
export const setSubAccountsSearchAction = simpleAction<string>(ActionType.SubAccounts.SetSearch);
export const addErrorsToTableAction = simpleAction<Table.CellError | Table.CellError[]>(
  ActionType.SubAccounts.AddErrors
);

export const updateSubAccountInStateAction = simpleAction<ISubAccount>(ActionType.SubAccounts.UpdateInState);

export const addGroupToStateAction = simpleAction<IGroup<ISimpleSubAccount>>(ActionType.SubAccounts.Groups.AddToState);
export const addGroupToTableAction = simpleAction<{ group: INestedGroup; ids: number[] }>(
  ActionType.SubAccounts.Groups.AddToTable
);
export const updateGroupInTableAction = simpleAction<{ groupId: number; group: Partial<INestedGroup> }>(
  ActionType.SubAccounts.Groups.UpdateInTable
);
export const removeGroupFromTableAction = simpleAction<number>(ActionType.SubAccounts.Groups.RemoveFromTable);
export const deletingGroupAction = simpleAction<boolean>(ActionType.SubAccounts.Groups.Deleting);
export const deleteGroupAction = simpleAction<number>(ActionType.SubAccounts.Groups.Delete);

/*
  Actions Pertaining to Sub Account Sub Accounts History
*/
export const requestSubAccountsHistoryAction = simpleAction<null>(ActionType.SubAccounts.History.Request);
export const loadingSubAccountsHistoryAction = simpleAction<boolean>(ActionType.SubAccounts.History.Loading);
export const responseSubAccountsHistoryAction = simpleAction<Http.IListResponse<HistoryEvent>>(
  ActionType.SubAccounts.History.Response
);
