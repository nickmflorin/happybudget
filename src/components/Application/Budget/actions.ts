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
    Updating: "budget.accounts.Updating"
  },
  AccountsTable: {
    AddRow: "budget.accountstable.AddRow",
    UpdateRow: "budget.accountstable.UpdateRow",
    UpdateRowInStateOnly: "budget.accountstable.UpdateRowInStateOnly",
    RemoveRow: "budget.accountstable.RemoveRow",
    SelectRow: "budget.accountstable.SelectRow",
    SelectAllRows: "budget.accountstable.SelectAllRows",
    DeselectRow: "budget.accountstable.DeselectRow",
    Loading: "budget.accountstable.Loading",
    SetSearch: "budget.accountstable.SetSearch",
    Response: "budget.accountstable.Response",
    Request: "budget.accountstable.Request"
  },
  Account: {
    Loading: "budget.account.Loading",
    Response: "budget.account.Response",
    Request: "budget.account.Request",
    SubAccountsTable: {
      AddRow: "budget.account.subaccountstable.AddRow",
      UpdateRow: "budget.account.subaccountstable.UpdateRow",
      UpdateRowInStateOnly: "budget.account.subaccountstable.UpdateRowInStateOnly",
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
      Updating: "budget.account.subaccounts.Updating"
    }
  },
  SubAccount: {
    Loading: "budget.subaccount.Loading",
    Response: "budget.subaccount.Response",
    Request: "budget.subaccount.Request",
    SubAccountsTable: {
      AddRow: "budget.subaccount.subaccountstable.AddRow",
      UpdateRow: "budget.subaccount.subaccountstable.UpdateRow",
      UpdateRowInStateOnly: "budget.subaccount.subaccountstable.UpdateRowInStateOnly",
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
      Updating: "budget.subaccount.subaccounts.Updating"
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
export const addAccountsRowAction = simpleAction<null>(ActionType.AccountsTable.AddRow);
export const updateAccountsRowAction = simpleBudgetAction<{
  id: number | string;
  payload: Partial<Redux.Budget.IAccountRow>;
}>(ActionType.AccountsTable.UpdateRow);
export const selectAccountsRowAction = simpleAction<number | string>(ActionType.AccountsTable.SelectRow);
export const selectAllAccountsRowsAction = simpleAction<null>(ActionType.AccountsTable.SelectAllRows);
export const deselectAccountsRowAction = simpleAction<number | string>(ActionType.AccountsTable.DeselectRow);
// This action is required because the action updateAccountSubAccountsRowAction
// triggers both a state update in the reducer and the saga responsible for updating
// the row in the backend.  In this saga, we also need to perform an update to the
// row state via the reducer, which is what this action is used for - otherwise,
// we could run into an infinite recursion because the saga would trigger itself.
export const updateAccountsRowInStateOnlyAction = simpleAction<{
  id: number | string;
  payload: Partial<Redux.Budget.IAccountRow>;
}>(ActionType.AccountsTable.UpdateRowInStateOnly);
export const removeAccountsRowAction = simpleAction<Redux.Budget.IAccountRow>(ActionType.AccountsTable.RemoveRow);
export const deletingAccountAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Accounts.Deleting);
export const updatingAccountAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Accounts.Updating);
export const creatingAccountAction = simpleAction<boolean>(ActionType.Accounts.Creating);
export const requestAccountsAction = simpleBudgetAction<null>(ActionType.AccountsTable.Request);
export const loadingAccountsAction = simpleAction<boolean>(ActionType.AccountsTable.Loading);
export const responseAccountsAction = simpleAction<Http.IListResponse<ISubAccount>>(ActionType.AccountsTable.Response);
export const setAccountsSearchAction = simpleAction<string>(ActionType.AccountsTable.SetSearch);

/*
  Actions Pertaining to the Sub Accounts of an Account
*/
export const addAccountSubAccountsRowAction = simpleAccountAction<null>(ActionType.Account.SubAccountsTable.AddRow);
export const updateAccountSubAccountsRowAction = simpleBudgetAccountAction<{
  id: number | string;
  payload: Partial<Redux.Budget.ISubAccountRow>;
}>(ActionType.Account.SubAccountsTable.UpdateRow);
export const selectAccountSubAccountsRowAction = simpleAccountAction<number | string>(
  ActionType.Account.SubAccountsTable.SelectRow
);
export const deselectAccountSubAccountsRowAction = simpleAccountAction<number | string>(
  ActionType.Account.SubAccountsTable.DeselectRow
);
export const selectAllAccountSubAccountsRowsAction = simpleAccountAction<null>(
  ActionType.Account.SubAccountsTable.SelectAllRows
);

// This action is required because the action updateAccountSubAccountsRowAction
// triggers both a state update in the reducer and the saga responsible for updating
// the row in the backend.  In this saga, we also need to perform an update to the
// row state via the reducer, which is what this action is used for - otherwise,
// we could run into an infinite recursion because the saga would trigger itself.
export const updateAccountSubAccountsRowInStateOnlyAction = simpleAccountAction<{
  id: number | string;
  payload: Partial<Redux.Budget.ISubAccountRow>;
}>(ActionType.Account.SubAccountsTable.UpdateRowInStateOnly);
export const removeAccountSubAccountsRowAction = simpleAccountAction<Redux.Budget.ISubAccountRow>(
  ActionType.Account.SubAccountsTable.RemoveRow
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
export const addSubAccountSubAccountsRowAction = simpleSubAccountAction<null>(
  ActionType.SubAccount.SubAccountsTable.AddRow
);
export const updateSubAccountSubAccountsRowAction = simpleSubAccountAction<{
  id: number | string;
  payload: Partial<Redux.Budget.ISubAccountRow>;
}>(ActionType.SubAccount.SubAccountsTable.UpdateRow);
export const selectSubAccountSubAccountsRowAction = simpleSubAccountAction<number | string>(
  ActionType.SubAccount.SubAccountsTable.SelectRow
);
export const selectAllSubAccountSubAccountsRowsAction = simpleSubAccountAction<null>(
  ActionType.SubAccount.SubAccountsTable.SelectAllRows
);
export const deselectSubAccountSubAccountsRowAction = simpleSubAccountAction<number | string>(
  ActionType.SubAccount.SubAccountsTable.DeselectRow
);
// This action is required because the action updateSubAccountSubAccountsRowAction
// triggers both a state update in the reducer and the saga responsible for updating
// the row in the backend.  In this saga, we also need to perform an update to the
// row state via the reducer, which is what this action is used for - otherwise,
// we could run into an infinite recursion because the saga would trigger itself.
export const updateSubAccountSubAccountsRowInStateOnlyAction = simpleSubAccountAction<{
  id: number | string;
  payload: Partial<Redux.Budget.ISubAccountRow>;
}>(ActionType.SubAccount.SubAccountsTable.UpdateRowInStateOnly);
export const removeSubAccountSubAccountsRowAction = simpleSubAccountAction<Redux.Budget.ISubAccountRow>(
  ActionType.SubAccount.SubAccountsTable.RemoveRow
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
