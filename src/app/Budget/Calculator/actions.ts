import { simpleAction } from "store/actions";

export const ActionType = {
  Accounts: {
    Deleting: "budget.accounts.Deleting",
    Creating: "budget.accounts.Creating",
    Updating: "budget.accounts.Updating",
    Update: "budget.accounts.Update",
    Remove: "budget.accounts.Remove"
  },
  Comments: {
    Loading: "calculator.comments.Loading",
    Response: "calculator.comments.Response",
    Request: "calculator.comments.Request",
    Delete: "calculator.comments.Delete",
    Edit: "calculator.comments.Edit",
    Submit: "calculator.comments.Submit",
    Submitting: "calculator.comments.Submitting",
    Deleting: "calculator.comments.Deleting",
    Editing: "calculator.comments.Editing",
    Replying: "calculator.comments.Replying",
    AddToState: "calculator.comments.AddToState",
    RemoveFromState: "calculator.comments.RemoveFromState",
    UpdateInState: "calculator.comments.UpdateInState"
  },
  History: {
    Loading: "calculator.history.Loading",
    Response: "calculator.history.Response",
    Request: "calculator.history.Request"
  },
  AccountsTable: {
    AddPlaceholders: "calculator.accountstable.AddPlaceholders",
    UpdateRow: "calculator.accountstable.UpdateRow",
    ActivatePlaceholder: "calculator.accountstable.ActivatePlaceholder",
    RemoveRow: "calculator.accountstable.RemoveRow",
    SelectRow: "calculator.accountstable.SelectRow",
    SelectAllRows: "calculator.accountstable.SelectAllRows",
    DeselectRow: "calculator.accountstable.DeselectRow",
    Loading: "calculator.accountstable.Loading",
    SetSearch: "calculator.accountstable.SetSearch",
    Response: "calculator.accountstable.Response",
    Request: "calculator.accountstable.Request",
    AddErrors: "calculator.accountstable.AddErrors"
  },
  Account: {
    SetId: "calculator.account.SetId",
    Loading: "calculator.account.Loading",
    Response: "calculator.account.Response",
    Request: "calculator.account.Request",
    Refresh: "calculator.account.Refresh",
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
    SubAccountsTable: {
      AddPlaceholders: "calculator.account.subaccountstable.AddPlaceholders",
      UpdateRow: "calculator.account.subaccountstable.UpdateRow",
      ActivatePlaceholder: "calculator.account.subaccountstable.ActivatePlaceholder",
      RemoveRow: "calculator.account.subaccountstable.RemoveRow",
      SelectAllRows: "calculator.account.subaccountstable.SelectAllRows",
      SelectRow: "calculator.account.subaccountstable.SelectRow",
      DeselectRow: "calculator.account.subaccountstable.DeselectRow",
      SetSearch: "calculator.account.subaccountstable.SetSearch",
      Loading: "calculator.account.subaccountstable.Loading",
      Response: "calculator.account.subaccountstable.Response",
      Request: "calculator.account.subaccountstable.Request",
      AddErrors: "calculator.account.subaccountstable.AddErrors"
    },
    SubAccounts: {
      Deleting: "calculator.account.subaccounts.Deleting",
      Creating: "calculator.account.subaccounts.Creating",
      Updating: "calculator.account.subaccounts.Updating",
      Update: "calculator.account.subaccounts.Update",
      Remove: "calculator.account.subaccounts.Remove",
      History: {
        Loading: "calculator.account.subaccounts.history.Loading",
        Response: "calculator.account.subaccounts.history.Response",
        Request: "calculator.account.subaccounts.history.Request"
      }
    }
  },
  SubAccount: {
    SetId: "calculator.subaccount.SetId",
    Loading: "calculator.subaccount.Loading",
    Response: "calculator.subaccount.Response",
    Request: "calculator.subaccount.Request",
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
    SubAccountsTable: {
      AddPlaceholders: "calculator.subaccount.subaccountstable.AddPlaceholders",
      UpdateRow: "calculator.subaccount.subaccountstable.UpdateRow",
      ActivatePlaceholder: "calculator.subaccount.subaccountstable.ActivatePlaceholder",
      RemoveRow: "calculator.subaccount.subaccountstable.RemoveRow",
      SelectRow: "calculator.subaccount.subaccountstable.SelectRow",
      SelectAllRows: "calculator.subaccount.subaccountstable.SelectAllRows",
      DeselectRow: "calculator.subaccount.subaccountstable.DeselectRow",
      SetSearch: "calculator.subaccount.subaccountstable.SetSearch",
      Loading: "calculator.subaccount.subaccountstable.Loading",
      Response: "calculator.subaccount.subaccountstable.Response",
      Request: "calculator.subaccount.subaccountstable.Request",
      AddErrors: "calculator.subaccount.subaccountstable.AddErrors"
    },
    SubAccounts: {
      Deleting: "calculator.subaccount.subaccounts.Deleting",
      Creating: "calculator.subaccount.subaccounts.Creating",
      Updating: "calculator.subaccount.subaccounts.Updating",
      Update: "calculator.subaccount.subaccounts.Update",
      Remove: "calculator.subaccount.subaccounts.Remove",
      History: {
        Loading: "calculator.subaccount.subaccounts.history.Loading",
        Response: "calculator.subaccount.subaccounts.history.Response",
        Request: "calculator.subaccount.subaccounts.history.Request"
      }
    }
  }
};

export const setAccountIdAction = simpleAction<number>(ActionType.Account.SetId);
export const setSubAccountIdAction = simpleAction<number>(ActionType.SubAccount.SetId);

export const requestAccountAction = simpleAction<null>(ActionType.Account.Request);
export const loadingAccountAction = simpleAction<boolean>(ActionType.Account.Loading);
export const responseAccountAction = simpleAction<IAccount>(ActionType.Account.Response);

export const requestSubAccountAction = simpleAction<null>(ActionType.SubAccount.Request);
export const loadingSubAccountAction = simpleAction<boolean>(ActionType.SubAccount.Loading);
export const responseSubAccountAction = simpleAction<ISubAccount>(ActionType.SubAccount.Response);

/*
  Actions Pertaining to Budget Comments
*/
export const requestBudgetCommentsAction = simpleAction<null>(ActionType.Comments.Request);
export const responseBudgetCommentsAction = simpleAction<Http.IListResponse<IComment>>(ActionType.Comments.Response);
export const loadingBudgetCommentsAction = simpleAction<boolean>(ActionType.Comments.Loading);
export const submitBudgetCommentAction = simpleAction<{ parent?: number; data: Http.ICommentPayload }>(
  ActionType.Comments.Submit
);
export const submittingBudgetCommentAction = simpleAction<boolean>(ActionType.Comments.Submitting);
export const deleteBudgetCommentAction = simpleAction<number>(ActionType.Comments.Delete);
export const editBudgetCommentAction = simpleAction<Redux.UpdateModelActionPayload<IComment>>(ActionType.Comments.Edit);
export const deletingBudgetCommentAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Comments.Deleting);
export const editingBudgetCommentAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Comments.Editing);
export const replyingToBudgetCommentAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Comments.Replying);
export const addBudgetCommentToStateAction = simpleAction<{ data: IComment; parent?: number }>(
  ActionType.Comments.AddToState
);
export const removeBudgetCommentFromStateAction = simpleAction<number>(ActionType.Comments.RemoveFromState);
export const updateBudgetCommentInStateAction = simpleAction<Redux.UpdateModelActionPayload<IComment>>(
  ActionType.Comments.UpdateInState
);

/*
  Actions Pertaining to Budget Accounts
*/
export const addAccountsTablePlaceholdersAction = simpleAction<number>(ActionType.AccountsTable.AddPlaceholders);
export const updateAccountAction = simpleAction<Table.RowChange>(ActionType.Accounts.Update);
export const updateAccountsTableRowAction = simpleAction<{ id: number; data: Partial<Table.IAccountRow> }>(
  ActionType.AccountsTable.UpdateRow
);
export const activateAccountsTablePlaceholderAction = simpleAction<Table.IActivatePlaceholderPayload>(
  ActionType.AccountsTable.ActivatePlaceholder
);
export const selectAccountsTableRowAction = simpleAction<number>(ActionType.AccountsTable.SelectRow);
export const selectAllAccountsTableRowsAction = simpleAction<null>(ActionType.AccountsTable.SelectAllRows);
export const deselectAccountsTableRowAction = simpleAction<number>(ActionType.AccountsTable.DeselectRow);
export const removeAccountsTableRowAction = simpleAction<number>(ActionType.AccountsTable.RemoveRow);
export const removeAccountAction = simpleAction<number>(ActionType.Accounts.Remove);
export const deletingAccountAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Accounts.Deleting);
export const updatingAccountAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Accounts.Updating);
export const creatingAccountAction = simpleAction<boolean>(ActionType.Accounts.Creating);
export const requestAccountsAction = simpleAction<null>(ActionType.AccountsTable.Request);
export const loadingAccountsAction = simpleAction<boolean>(ActionType.AccountsTable.Loading);
export const responseAccountsAction = simpleAction<Http.IListResponse<ISubAccount>>(ActionType.AccountsTable.Response);
export const setAccountsSearchAction = simpleAction<string>(ActionType.AccountsTable.SetSearch);
export const addErrorsToAccountsTableAction = simpleAction<Table.ICellError | Table.ICellError[]>(
  ActionType.AccountsTable.AddErrors
);

/*
  Actions Pertaining to Budget Accounts History
*/
export const requestAccountsHistoryAction = simpleAction<null>(ActionType.History.Request);
export const loadingAccountsHistoryAction = simpleAction<boolean>(ActionType.History.Loading);
export const responseAccountsHistoryAction = simpleAction<Http.IListResponse<IFieldAlterationEvent>>(
  ActionType.History.Response
);

/*
  Actions Pertaining to Account Comments
*/
export const requestAccountCommentsAction = simpleAction<null>(ActionType.Account.Comments.Request);
export const responseAccountCommentsAction = simpleAction<Http.IListResponse<IComment>>(
  ActionType.Account.Comments.Response
);
export const loadingAccountCommentsAction = simpleAction<boolean>(ActionType.Account.Comments.Loading);
export const submitAccountCommentAction = simpleAction<{ parent?: number; data: Http.ICommentPayload }>(
  ActionType.Account.Comments.Submit
);
export const submittingAccountCommentAction = simpleAction<boolean>(ActionType.Account.Comments.Submitting);
export const deleteAccountCommentAction = simpleAction<number>(ActionType.Account.Comments.Delete);
export const editAccountCommentAction = simpleAction<Redux.UpdateModelActionPayload<IComment>>(
  ActionType.Account.Comments.Edit
);
export const replyingToAccountCommentAction = simpleAction<Redux.ModelListActionPayload>(
  ActionType.Account.Comments.Replying
);
export const deletingAccountCommentAction = simpleAction<Redux.ModelListActionPayload>(
  ActionType.Account.Comments.Deleting
);
export const editingAccountCommentAction = simpleAction<Redux.ModelListActionPayload>(
  ActionType.Account.Comments.Editing
);
export const addAccountCommentToStateAction = simpleAction<{ data: IComment; parent?: number }>(
  ActionType.Account.Comments.AddToState
);
export const removeAccountCommentFromStateAction = simpleAction<number>(ActionType.Account.Comments.RemoveFromState);
export const updateAccountCommentInStateAction = simpleAction<Redux.UpdateModelActionPayload<IComment>>(
  ActionType.Account.Comments.UpdateInState
);
/*
  Actions Pertaining to Account Sub Accounts
*/
export const addAccountSubAccountsTablePlaceholdersAction = simpleAction<number>(
  ActionType.Account.SubAccountsTable.AddPlaceholders
);
export const updateAccountSubAccountAction = simpleAction<Table.RowChange>(ActionType.Account.SubAccounts.Update);
export const selectAccountSubAccountsTableRowAction = simpleAction<number>(
  ActionType.Account.SubAccountsTable.SelectRow
);
export const deselectAccountSubAccountsTableRowAction = simpleAction<number>(
  ActionType.Account.SubAccountsTable.DeselectRow
);
export const selectAllAccountSubAccountsTableRowsAction = simpleAction<null>(
  ActionType.Account.SubAccountsTable.SelectAllRows
);
export const updateAccountSubAccountsTableRowAction = simpleAction<{
  id: number;
  data: Partial<Table.ISubAccountRow>;
}>(ActionType.Account.SubAccountsTable.UpdateRow);
export const activateAccountSubAccountsTablePlaceholderAction = simpleAction<Table.IActivatePlaceholderPayload>(
  ActionType.Account.SubAccountsTable.ActivatePlaceholder
);
export const removeAccountSubAccountsTableRowAction = simpleAction<number>(
  ActionType.Account.SubAccountsTable.RemoveRow
);
export const removeAccountSubAccountAction = simpleAction<number>(ActionType.Account.SubAccounts.Remove);
export const deletingAccountSubAccountAction = simpleAction<Redux.ModelListActionPayload>(
  ActionType.Account.SubAccounts.Deleting
);
export const updatingAccountSubAccountAction = simpleAction<Redux.ModelListActionPayload>(
  ActionType.Account.SubAccounts.Updating
);
export const creatingAccountSubAccountAction = simpleAction<boolean>(ActionType.Account.SubAccounts.Creating);
export const requestAccountSubAccountsAction = simpleAction<null>(ActionType.Account.SubAccountsTable.Request);
export const loadingAccountSubAccountsAction = simpleAction<boolean>(ActionType.Account.SubAccountsTable.Loading);
export const responseAccountSubAccountsAction = simpleAction<Http.IListResponse<ISubAccount>>(
  ActionType.Account.SubAccountsTable.Response
);
export const setAccountSubAccountsSearchAction = simpleAction<string>(ActionType.Account.SubAccountsTable.SetSearch);
export const addErrorsToAccountSubAccountsTableAction = simpleAction<Table.ICellError | Table.ICellError[]>(
  ActionType.Account.SubAccountsTable.AddErrors
);

/*
  Actions Pertaining to Account Sub Accounts History
*/
export const requestAccountSubAccountsHistoryAction = simpleAction<null>(
  ActionType.Account.SubAccounts.History.Request
);
export const loadingAccountSubAccountsHistoryAction = simpleAction<boolean>(
  ActionType.Account.SubAccounts.History.Loading
);
export const responseAccountSubAccountsHistoryAction = simpleAction<Http.IListResponse<IFieldAlterationEvent>>(
  ActionType.Account.SubAccounts.History.Response
);

/*
  Actions Pertaining to Sub Account Comments
*/
export const requestSubAccountCommentsAction = simpleAction<null>(ActionType.Account.Comments.Request);
export const responseSubAccountCommentsAction = simpleAction<Http.IListResponse<IComment>>(
  ActionType.SubAccount.Comments.Response
);
export const loadingSubAccountCommentsAction = simpleAction<boolean>(ActionType.SubAccount.Comments.Loading);
export const submitSubAccountCommentAction = simpleAction<{ parent?: number; data: Http.ICommentPayload }>(
  ActionType.SubAccount.Comments.Submit
);
export const submittingSubAccountCommentAction = simpleAction<boolean>(ActionType.SubAccount.Comments.Submitting);
export const deleteSubAccountCommentAction = simpleAction<number>(ActionType.SubAccount.Comments.Delete);
export const editSubAccountCommentAction = simpleAction<Redux.UpdateModelActionPayload<IComment>>(
  ActionType.SubAccount.Comments.Edit
);
export const replyingToSubAccountCommentAction = simpleAction<Redux.ModelListActionPayload>(
  ActionType.SubAccount.Comments.Replying
);
export const deletingSubAccountCommentAction = simpleAction<Redux.ModelListActionPayload>(
  ActionType.SubAccount.Comments.Deleting
);
export const editingSubAccountCommentAction = simpleAction<Redux.ModelListActionPayload>(
  ActionType.SubAccount.Comments.Editing
);
export const addSubAccountCommentToStateAction = simpleAction<{ data: IComment; parent?: number }>(
  ActionType.SubAccount.Comments.AddToState
);
export const removeSubAccountCommentFromStateAction = simpleAction<number>(
  ActionType.SubAccount.Comments.RemoveFromState
);
export const updateSubAccountCommentInStateAction = simpleAction<Redux.UpdateModelActionPayload<IComment>>(
  ActionType.SubAccount.Comments.UpdateInState
);
/*
  Actions Pertaining to Sub Account Sub Accounts
*/
export const addSubAccountSubAccountsTablePlaceholdersAction = simpleAction<number>(
  ActionType.SubAccount.SubAccountsTable.AddPlaceholders
);
export const updateSubAccountSubAccountAction = simpleAction<Table.RowChange>(ActionType.SubAccount.SubAccounts.Update);
export const selectSubAccountSubAccountsTableRowAction = simpleAction<number>(
  ActionType.SubAccount.SubAccountsTable.SelectRow
);
export const selectAllSubAccountSubAccountsTableRowsAction = simpleAction<null>(
  ActionType.SubAccount.SubAccountsTable.SelectAllRows
);
export const deselectSubAccountSubAccountsTableRowAction = simpleAction<number>(
  ActionType.SubAccount.SubAccountsTable.DeselectRow
);
export const updateSubAccountSubAccountsTableRowAction = simpleAction<{
  id: number;
  data: Partial<Table.ISubAccountRow>;
}>(ActionType.SubAccount.SubAccountsTable.UpdateRow);
export const activateSubAccountSubAccountsTablePlaceholderAction = simpleAction<Table.IActivatePlaceholderPayload>(
  ActionType.SubAccount.SubAccountsTable.ActivatePlaceholder
);
export const removeSubAccountSubAccountsTableRowAction = simpleAction<number>(
  ActionType.SubAccount.SubAccountsTable.RemoveRow
);
export const removeSubAccountSubAccountAction = simpleAction<number>(ActionType.SubAccount.SubAccounts.Remove);
export const deletingSubAccountSubAccountAction = simpleAction<Redux.ModelListActionPayload>(
  ActionType.SubAccount.SubAccounts.Deleting
);
export const updatingSubAccountSubAccountAction = simpleAction<Redux.ModelListActionPayload>(
  ActionType.SubAccount.SubAccounts.Updating
);
export const creatingSubAccountSubAccountAction = simpleAction<boolean>(ActionType.SubAccount.SubAccounts.Creating);
export const requestSubAccountSubAccountsAction = simpleAction<null>(ActionType.SubAccount.SubAccountsTable.Request);
export const loadingSubAccountSubAccountsAction = simpleAction<boolean>(ActionType.SubAccount.SubAccountsTable.Loading);
export const responseSubAccountSubAccountsAction = simpleAction<Http.IListResponse<ISubAccount>>(
  ActionType.SubAccount.SubAccountsTable.Response
);
export const setSubAccountSubAccountsSearchAction = simpleAction<string>(
  ActionType.SubAccount.SubAccountsTable.SetSearch
);
export const addErrorsToSubAccountSubAccountsTableAction = simpleAction<Table.ICellError | Table.ICellError[]>(
  ActionType.SubAccount.SubAccountsTable.AddErrors
);

/*
  Actions Pertaining to Sub Account Sub Accounts History
*/
export const requestSubAccountSubAccountsHistoryAction = simpleAction<null>(
  ActionType.SubAccount.SubAccounts.History.Request
);
export const loadingSubAccountSubAccountsHistoryAction = simpleAction<boolean>(
  ActionType.SubAccount.SubAccounts.History.Loading
);
export const responseSubAccountSubAccountsHistoryAction = simpleAction<Http.IListResponse<IFieldAlterationEvent>>(
  ActionType.SubAccount.SubAccounts.History.Response
);
