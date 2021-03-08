import { createAction } from "store/actions";

export const ActionType = {
  SetAncestors: "budget.SetAncestors",
  SetAncestorsLoading: "budget.SetAncestorsLoading",
  Budget: {
    Loading: "budget.budget.Loading",
    Response: "budget.budget.Response",
    Request: "budget.budget.Request"
  },
  Accounts: {
    Deleting: "budget.accounts.Deleting",
    Creating: "budget.accounts.Creating",
    Updating: "budget.accounts.Updating",
    Update: "budget.accounts.Update",
    Remove: "budget.accounts.Remove"
  },
  AccountsTable: {
    AddPlaceholders: "budget.accountstable.AddPlaceholders",
    UpdateRow: "budget.accountstable.UpdateRow",
    RemoveRow: "budget.accountstable.RemoveRow",
    SelectRow: "budget.accountstable.SelectRow",
    SelectAllRows: "budget.accountstable.SelectAllRows",
    DeselectRow: "budget.accountstable.DeselectRow",
    Loading: "budget.accountstable.Loading",
    SetSearch: "budget.accountstable.SetSearch",
    Response: "budget.accountstable.Response",
    Request: "budget.accountstable.Request",
    SetError: "budget.accountstable.SetError"
  },
  Account: {
    Loading: "budget.account.Loading",
    Response: "budget.account.Response",
    Request: "budget.account.Request",
    SubAccountsTable: {
      AddPlaceholders: "budget.account.subaccountstable.AddPlaceholders",
      UpdateRow: "budget.account.subaccountstable.UpdateRow",
      RemoveRow: "budget.account.subaccountstable.RemoveRow",
      SelectAllRows: "budget.account.subaccountstable.SelectAllRows",
      SelectRow: "budget.account.subaccountstable.SelectRow",
      DeselectRow: "budget.account.subaccountstable.DeselectRow",
      SetSearch: "budget.account.subaccountstable.SetSearch",
      Loading: "budget.account.subaccountstable.Loading",
      Response: "budget.account.subaccountstable.Response",
      Request: "budget.account.subaccountstable.Request"
    },
    SubAccounts: {
      Deleting: "budget.account.subaccounts.Deleting",
      Creating: "budget.account.subaccounts.Creating",
      Updating: "budget.account.subaccounts.Updating",
      Update: "budget.account.subaccounts.Update",
      Remove: "budget.account.subaccounts.Remove"
    }
  },
  SubAccount: {
    Loading: "budget.subaccount.Loading",
    Response: "budget.subaccount.Response",
    Request: "budget.subaccount.Request",
    SubAccountsTable: {
      AddPlaceholders: "budget.subaccount.subaccountstable.AddPlaceholders",
      UpdateRow: "budget.subaccount.subaccountstable.UpdateRow",
      RemoveRow: "budget.subaccount.subaccountstable.RemoveRow",
      SelectRow: "budget.subaccount.subaccountstable.SelectRow",
      SelectAllRows: "budget.subaccount.subaccountstable.SelectAllRows",
      DeselectRow: "budget.subaccount.subaccountstable.DeselectRow",
      SetSearch: "budget.subaccount.subaccountstable.SetSearch",
      Loading: "budget.subaccount.subaccountstable.Loading",
      Response: "budget.subaccount.subaccountstable.Response",
      Request: "budget.subaccount.subaccountstable.Request"
    },
    SubAccounts: {
      Deleting: "budget.subaccount.subaccounts.Deleting",
      Creating: "budget.subaccount.subaccounts.Creating",
      Updating: "budget.subaccount.subaccounts.Updating",
      Update: "budget.subaccount.subaccounts.Update",
      Remove: "budget.subaccount.subaccounts.Remove"
    }
  }
};

export const simpleAction = <P = any>(type: string) => {
  return (payload?: P, options?: Redux.IActionConfig): Redux.Budget.IAction<P> => {
    return { ...createAction<P>(type, payload, options) };
  };
};

export const simpleBudgetAction = <P = any>(type: string) => {
  return (budgetId: number, payload?: P, options?: Redux.IActionConfig): Redux.Budget.IAction<P> => {
    return { ...createAction<P>(type, payload, options), budgetId };
  };
};

export const simpleBudgetAccountAction = <P = any>(type: string) => {
  return (accountId: number, budgetId: number, payload?: P, options?: Redux.IActionConfig): Redux.Budget.IAction<P> => {
    return { ...createAction<P>(type, payload, options), accountId, budgetId };
  };
};

export const simpleAccountAction = <P = any>(type: string) => {
  return (accountId: number, payload?: P, options?: Redux.IActionConfig): Redux.Budget.IAction<P> => {
    return { ...createAction<P>(type, payload, options), accountId };
  };
};

export const simpleSubAccountAction = <P = any>(type: string) => {
  return (subaccountId: number, payload?: P, options?: Redux.IActionConfig): Redux.Budget.IAction<P> => {
    return { ...createAction<P>(type, payload, options), subaccountId };
  };
};

export const setAncestorsAction = simpleAction<IAncestor[]>(ActionType.SetAncestors);
export const setAncestorsLoadingAction = simpleAction<boolean>(ActionType.SetAncestorsLoading);

export const requestBudgetAction = simpleBudgetAction<null>(ActionType.Budget.Request);
export const loadingBudgetAction = simpleAction<boolean>(ActionType.Budget.Loading);
export const responseBudgetAction = simpleAction<IBudget>(ActionType.Budget.Response);

export const requestAccountAction = simpleAccountAction<null>(ActionType.Account.Request);
export const loadingAccountAction = simpleAccountAction<boolean>(ActionType.Account.Loading);
export const responseAccountAction = simpleAccountAction<IAccount>(ActionType.Account.Response);

export const requestSubAccountAction = simpleSubAccountAction<null>(ActionType.SubAccount.Request);
export const loadingSubAccountAction = simpleSubAccountAction<boolean>(ActionType.SubAccount.Loading);
export const responseSubAccountAction = simpleSubAccountAction<ISubAccount>(ActionType.SubAccount.Response);

/*
  Actions Pertaining to the Accounts
*/
export const addAccountsPlaceholdersAction = simpleAction<number>(ActionType.AccountsTable.AddPlaceholders);
export const updateAccountAction = simpleBudgetAction<{
  id: number | string;
  payload: Partial<Http.IAccountPayload>;
}>(ActionType.Accounts.Update);
export const updateAccountsRowAction = simpleAction<{
  id: number | string;
  payload: Partial<Redux.Budget.IAccountRow>;
}>(ActionType.AccountsTable.UpdateRow);
export const selectAccountsRowAction = simpleAction<number | string>(ActionType.AccountsTable.SelectRow);
export const selectAllAccountsRowsAction = simpleAction<null>(ActionType.AccountsTable.SelectAllRows);
export const deselectAccountsRowAction = simpleAction<number | string>(ActionType.AccountsTable.DeselectRow);
export const removeAccountsRowAction = simpleAction<Redux.Budget.IAccountRow>(ActionType.AccountsTable.RemoveRow);
export const removeAccountAction = simpleAction<Redux.Budget.IAccountRow>(ActionType.Accounts.Remove);
export const deletingAccountAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Accounts.Deleting);
export const updatingAccountAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Accounts.Updating);
export const creatingAccountAction = simpleAction<boolean>(ActionType.Accounts.Creating);
export const requestAccountsAction = simpleBudgetAction<null>(ActionType.AccountsTable.Request);
export const loadingAccountsAction = simpleAction<boolean>(ActionType.AccountsTable.Loading);
export const responseAccountsAction = simpleAction<Http.IListResponse<ISubAccount>>(ActionType.AccountsTable.Response);
export const setAccountsSearchAction = simpleAction<string>(ActionType.AccountsTable.SetSearch);
export const setAccountsTableCellError = simpleAction<Redux.Budget.AccountCellError | Redux.Budget.AccountCellError[]>(
  ActionType.AccountsTable.SetError
);
/*
  Actions Pertaining to the Sub Accounts of an Account
*/
export const addAccountSubAccountsPlaceholdersAction = simpleAccountAction<number>(
  ActionType.Account.SubAccountsTable.AddPlaceholders
);
export const updateAccountSubAccountAction = simpleBudgetAccountAction<{
  id: number | string;
  payload: Partial<Http.ISubAccountPayload>;
}>(ActionType.Account.SubAccounts.Update);
export const selectAccountSubAccountsRowAction = simpleAccountAction<number | string>(
  ActionType.Account.SubAccountsTable.SelectRow
);
export const deselectAccountSubAccountsRowAction = simpleAccountAction<number | string>(
  ActionType.Account.SubAccountsTable.DeselectRow
);
export const selectAllAccountSubAccountsRowsAction = simpleAccountAction<null>(
  ActionType.Account.SubAccountsTable.SelectAllRows
);
export const updateAccountSubAccountsRowAction = simpleAccountAction<{
  id: number | string;
  payload: Partial<Redux.Budget.ISubAccountRow>;
}>(ActionType.Account.SubAccountsTable.UpdateRow);
export const removeAccountSubAccountsRowAction = simpleAccountAction<Redux.Budget.ISubAccountRow>(
  ActionType.Account.SubAccountsTable.RemoveRow
);
export const removeAccountSubAccountAction = simpleAccountAction<Redux.Budget.ISubAccountRow>(
  ActionType.Account.SubAccounts.Remove
);
export const deletingAccountSubAccountAction = simpleAccountAction<Redux.ModelListActionPayload>(
  ActionType.Account.SubAccounts.Deleting
);
export const updatingAccountSubAccountAction = simpleAccountAction<Redux.ModelListActionPayload>(
  ActionType.Account.SubAccounts.Updating
);
export const creatingAccountSubAccountAction = simpleAccountAction<boolean>(ActionType.Account.SubAccounts.Creating);
export const requestAccountSubAccountsAction = simpleBudgetAccountAction<null>(
  ActionType.Account.SubAccountsTable.Request
);
export const loadingAccountSubAccountsAction = simpleAccountAction<boolean>(
  ActionType.Account.SubAccountsTable.Loading
);
export const responseAccountSubAccountsAction = simpleAccountAction<Http.IListResponse<ISubAccount>>(
  ActionType.Account.SubAccountsTable.Response
);
export const setAccountSubAccountsSearchAction = simpleAccountAction<string>(
  ActionType.Account.SubAccountsTable.SetSearch
);

/*
  Actions Pertaining to the Sub Accounts of a Sub Account
*/
export const addSubAccountSubAccountsPlaceholdersAction = simpleSubAccountAction<number>(
  ActionType.SubAccount.SubAccountsTable.AddPlaceholders
);
export const updateSubAccountSubAccountAction = simpleSubAccountAction<{
  id: number | string;
  payload: Partial<Http.ISubAccountPayload>;
}>(ActionType.SubAccount.SubAccounts.Update);
export const selectSubAccountSubAccountsRowAction = simpleSubAccountAction<number | string>(
  ActionType.SubAccount.SubAccountsTable.SelectRow
);
export const selectAllSubAccountSubAccountsRowsAction = simpleSubAccountAction<null>(
  ActionType.SubAccount.SubAccountsTable.SelectAllRows
);
export const deselectSubAccountSubAccountsRowAction = simpleSubAccountAction<number | string>(
  ActionType.SubAccount.SubAccountsTable.DeselectRow
);
export const updateSubAccountSubAccountsRowAction = simpleSubAccountAction<{
  id: number | string;
  payload: Partial<Redux.Budget.ISubAccountRow>;
}>(ActionType.SubAccount.SubAccountsTable.UpdateRow);
export const removeSubAccountSubAccountsRowAction = simpleSubAccountAction<Redux.Budget.ISubAccountRow>(
  ActionType.SubAccount.SubAccountsTable.RemoveRow
);
export const removeSubAccountSubAccountAction = simpleSubAccountAction<Redux.Budget.ISubAccountRow>(
  ActionType.SubAccount.SubAccounts.Remove
);
export const deletingSubAccountSubAccountAction = simpleSubAccountAction<Redux.ModelListActionPayload>(
  ActionType.SubAccount.SubAccounts.Deleting
);
export const updatingSubAccountSubAccountAction = simpleSubAccountAction<Redux.ModelListActionPayload>(
  ActionType.SubAccount.SubAccounts.Updating
);
export const creatingSubAccountSubAccountAction = simpleSubAccountAction<boolean>(
  ActionType.SubAccount.SubAccounts.Creating
);
export const requestSubAccountSubAccountsAction = simpleSubAccountAction<null>(
  ActionType.SubAccount.SubAccountsTable.Request
);
export const loadingSubAccountSubAccountsAction = simpleSubAccountAction<boolean>(
  ActionType.SubAccount.SubAccountsTable.Loading
);
export const responseSubAccountSubAccountsAction = simpleSubAccountAction<Http.IListResponse<ISubAccount>>(
  ActionType.SubAccount.SubAccountsTable.Response
);
export const setSubAccountSubAccountsSearchAction = simpleSubAccountAction<string>(
  ActionType.SubAccount.SubAccountsTable.SetSearch
);
