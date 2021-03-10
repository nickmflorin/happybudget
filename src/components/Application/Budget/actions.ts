import { createAction } from "store/actions";

export const ActionType = {
  SetAccountId: "budget.SetAccountId",
  SetAncestors: "budget.SetAncestors",
  SetAncestorsLoading: "budget.SetAncestorsLoading",
  SetBudgetId: "budget.SetBudgetId",
  SetSubAccountId: "budget.SetSubAccountId",
  Budget: {
    Loading: "budget.budget.Loading",
    Response: "budget.budget.Response",
    Request: "budget.budget.Request"
  },
  Actuals: {
    Deleting: "budget.actuals.Deleting",
    Creating: "budget.actuals.Creating",
    Updating: "budget.actuals.Updating",
    Update: "budget.actuals.Update",
    Remove: "budget.actuals.Remove"
  },
  ActualsTable: {
    AddPlaceholders: "budget.actualstable.AddPlaceholders",
    UpdateRow: "budget.actualstable.UpdateRow",
    ActivatePlaceholder: "budget.actualstable.ActivatePlaceholder",
    RemoveRow: "budget.actualstable.RemoveRow",
    SelectRow: "budget.actualstable.SelectRow",
    SelectAllRows: "budget.actualstable.SelectAllRows",
    DeselectRow: "budget.actualstable.DeselectRow",
    Loading: "budget.actualstable.Loading",
    SetSearch: "budget.actualstable.SetSearch",
    Response: "budget.actualstable.Response",
    Request: "budget.actualstable.Request",
    AddErrors: "budget.actualstable.AddErrors"
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
    ActivatePlaceholder: "budget.accountstable.ActivatePlaceholder",
    RemoveRow: "budget.accountstable.RemoveRow",
    SelectRow: "budget.accountstable.SelectRow",
    SelectAllRows: "budget.accountstable.SelectAllRows",
    DeselectRow: "budget.accountstable.DeselectRow",
    Loading: "budget.accountstable.Loading",
    SetSearch: "budget.accountstable.SetSearch",
    Response: "budget.accountstable.Response",
    Request: "budget.accountstable.Request",
    AddErrors: "budget.accountstable.AddErrors"
  },
  Account: {
    Loading: "budget.account.Loading",
    Response: "budget.account.Response",
    Request: "budget.account.Request",
    Refresh: "budget.account.Refresh",
    SubAccountsTable: {
      AddPlaceholders: "budget.account.subaccountstable.AddPlaceholders",
      UpdateRow: "budget.account.subaccountstable.UpdateRow",
      ActivatePlaceholder: "budget.account.subaccountstable.ActivatePlaceholder",
      RemoveRow: "budget.account.subaccountstable.RemoveRow",
      SelectAllRows: "budget.account.subaccountstable.SelectAllRows",
      SelectRow: "budget.account.subaccountstable.SelectRow",
      DeselectRow: "budget.account.subaccountstable.DeselectRow",
      SetSearch: "budget.account.subaccountstable.SetSearch",
      Loading: "budget.account.subaccountstable.Loading",
      Response: "budget.account.subaccountstable.Response",
      Request: "budget.account.subaccountstable.Request",
      AddErrors: "budget.account.subaccountstable.AddErrors"
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
      ActivatePlaceholder: "budget.subaccount.subaccountstable.ActivatePlaceholder",
      RemoveRow: "budget.subaccount.subaccountstable.RemoveRow",
      SelectRow: "budget.subaccount.subaccountstable.SelectRow",
      SelectAllRows: "budget.subaccount.subaccountstable.SelectAllRows",
      DeselectRow: "budget.subaccount.subaccountstable.DeselectRow",
      SetSearch: "budget.subaccount.subaccountstable.SetSearch",
      Loading: "budget.subaccount.subaccountstable.Loading",
      Response: "budget.subaccount.subaccountstable.Response",
      Request: "budget.subaccount.subaccountstable.Request",
      AddErrors: "budget.subaccount.subaccountstable.AddErrors"
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

export const setAccountIdAction = simpleAction<number>(ActionType.SetAccountId);
export const setBudgetIdAction = simpleAction<number>(ActionType.SetBudgetId);
export const setSubAccountIdAction = simpleAction<number>(ActionType.SetSubAccountId);

export const setAncestorsAction = simpleAction<IAncestor[]>(ActionType.SetAncestors);
export const setAncestorsLoadingAction = simpleAction<boolean>(ActionType.SetAncestorsLoading);

export const requestBudgetAction = simpleAction<null>(ActionType.Budget.Request);
export const loadingBudgetAction = simpleAction<boolean>(ActionType.Budget.Loading);
export const responseBudgetAction = simpleAction<IBudget>(ActionType.Budget.Response);

export const requestAccountAction = simpleAction<null>(ActionType.Account.Request);
export const refreshAccountAction = simpleAction<null>(ActionType.Account.Refresh);
export const loadingAccountAction = simpleAccountAction<boolean>(ActionType.Account.Loading);
export const responseAccountAction = simpleAccountAction<IAccount>(ActionType.Account.Response);

export const requestSubAccountAction = simpleAction<null>(ActionType.SubAccount.Request);
export const loadingSubAccountAction = simpleSubAccountAction<boolean>(ActionType.SubAccount.Loading);
export const responseSubAccountAction = simpleSubAccountAction<ISubAccount>(ActionType.SubAccount.Response);

/*
  Actions Pertaining to the Accounts
*/
export const addAccountsTablePlaceholdersAction = simpleAction<number>(ActionType.AccountsTable.AddPlaceholders);
export const updateAccountAction = simpleAction<{
  id: number;
  data: Partial<Http.IAccountPayload>;
}>(ActionType.Accounts.Update);
export const updateAccountsTableRowAction = simpleAction<{ id: number; data: Partial<Table.IAccountRow> }>(
  ActionType.AccountsTable.UpdateRow
);
export const activateAccountsTablePlaceholderAction = simpleAction<Redux.Budget.IActivatePlaceholderPayload>(
  ActionType.AccountsTable.ActivatePlaceholder
);
export const selectAccountsTableRowAction = simpleAction<number>(ActionType.AccountsTable.SelectRow);
export const selectAllAccountsTableRowsAction = simpleAction<null>(ActionType.AccountsTable.SelectAllRows);
export const deselectAccountsTableRowAction = simpleAction<number>(ActionType.AccountsTable.DeselectRow);
export const removeAccountsTableRowAction = simpleAction<Table.IAccountRow>(ActionType.AccountsTable.RemoveRow);
export const removeAccountAction = simpleAction<Table.IAccountRow>(ActionType.Accounts.Remove);
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
  Actions Pertaining to the Sub Accounts of an Account
*/
export const addAccountSubAccountsTablePlaceholdersAction = simpleAccountAction<number>(
  ActionType.Account.SubAccountsTable.AddPlaceholders
);
export const updateAccountSubAccountAction = simpleAccountAction<{
  id: number;
  data: Partial<Http.ISubAccountPayload>;
}>(ActionType.Account.SubAccounts.Update);
export const selectAccountSubAccountsTableRowAction = simpleAccountAction<number>(
  ActionType.Account.SubAccountsTable.SelectRow
);
export const deselectAccountSubAccountsTableRowAction = simpleAccountAction<number>(
  ActionType.Account.SubAccountsTable.DeselectRow
);
export const selectAllAccountSubAccountsTableRowsAction = simpleAccountAction<null>(
  ActionType.Account.SubAccountsTable.SelectAllRows
);
export const updateAccountSubAccountsTableRowAction = simpleAccountAction<{
  id: number;
  data: Partial<Table.ISubAccountRow>;
}>(ActionType.Account.SubAccountsTable.UpdateRow);
export const activateAccountSubAccountsTablePlaceholderAction = simpleAction<Redux.Budget.IActivatePlaceholderPayload>(
  ActionType.Account.SubAccountsTable.ActivatePlaceholder
);
export const removeAccountSubAccountsRowAction = simpleAccountAction<Table.ISubAccountRow>(
  ActionType.Account.SubAccountsTable.RemoveRow
);
export const removeAccountSubAccountAction = simpleAccountAction<Table.ISubAccountRow>(
  ActionType.Account.SubAccounts.Remove
);
export const deletingAccountSubAccountAction = simpleAccountAction<Redux.ModelListActionPayload>(
  ActionType.Account.SubAccounts.Deleting
);
export const updatingAccountSubAccountAction = simpleAccountAction<Redux.ModelListActionPayload>(
  ActionType.Account.SubAccounts.Updating
);
export const creatingAccountSubAccountAction = simpleAccountAction<boolean>(ActionType.Account.SubAccounts.Creating);
export const requestAccountSubAccountsAction = simpleAccountAction<null>(ActionType.Account.SubAccountsTable.Request);
export const loadingAccountSubAccountsAction = simpleAccountAction<boolean>(
  ActionType.Account.SubAccountsTable.Loading
);
export const responseAccountSubAccountsAction = simpleAccountAction<Http.IListResponse<ISubAccount>>(
  ActionType.Account.SubAccountsTable.Response
);
export const setAccountSubAccountsSearchAction = simpleAccountAction<string>(
  ActionType.Account.SubAccountsTable.SetSearch
);
export const addErrorsToAccountSubAccountsTableAction = simpleAccountAction<Table.ICellError | Table.ICellError[]>(
  ActionType.Account.SubAccountsTable.AddErrors
);

/*
  Actions Pertaining to the Sub Accounts of a Sub Account
*/
export const addSubAccountSubAccountsTablePlaceholdersAction = simpleSubAccountAction<number>(
  ActionType.SubAccount.SubAccountsTable.AddPlaceholders
);
export const updateSubAccountSubAccountAction = simpleSubAccountAction<{
  id: number;
  data: Partial<Http.ISubAccountPayload>;
}>(ActionType.SubAccount.SubAccounts.Update);
export const selectSubAccountSubAccountsTableRowAction = simpleSubAccountAction<number>(
  ActionType.SubAccount.SubAccountsTable.SelectRow
);
export const selectAllSubAccountSubAccountsTableRowsAction = simpleSubAccountAction<null>(
  ActionType.SubAccount.SubAccountsTable.SelectAllRows
);
export const deselectSubAccountSubAccountsTableRowAction = simpleSubAccountAction<number>(
  ActionType.SubAccount.SubAccountsTable.DeselectRow
);
export const updateSubAccountSubAccountsTableRowAction = simpleSubAccountAction<{
  id: number;
  data: Partial<Table.ISubAccountRow>;
}>(ActionType.SubAccount.SubAccountsTable.UpdateRow);
export const activateSubAccountSubAccountsTablePlaceholderAction = simpleAction<Redux.Budget.IActivatePlaceholderPayload>(
  ActionType.SubAccount.SubAccountsTable.ActivatePlaceholder
);
export const removeSubAccountSubAccountsTableRowAction = simpleSubAccountAction<Table.ISubAccountRow>(
  ActionType.SubAccount.SubAccountsTable.RemoveRow
);
export const removeSubAccountSubAccountAction = simpleSubAccountAction<Table.ISubAccountRow>(
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
export const addErrorsToSubAccountSubAccountsTableAction = simpleSubAccountAction<
  Table.ICellError | Table.ICellError[]
>(ActionType.SubAccount.SubAccountsTable.AddErrors);

/*
  Actions Pertaining to the Actuals
*/
export const addActualsTablePlaceholdersAction = simpleAction<number>(ActionType.ActualsTable.AddPlaceholders);
export const updateActualAction = simpleAction<{
  id: number;
  data: Partial<Http.IAccountPayload>;
}>(ActionType.Actuals.Update);
export const updateActualsTableCellAction = simpleAction<{ id: number; data: Partial<Table.IActualRow> }>(
  ActionType.ActualsTable.UpdateRow
);
export const activateActualsPlaceholderAction = simpleAction<Redux.Budget.IActivatePlaceholderPayload>(
  ActionType.ActualsTable.ActivatePlaceholder
);
export const selectActualsTableRowAction = simpleAction<number>(ActionType.ActualsTable.SelectRow);
export const selectAllActualsTableRowsAction = simpleAction<null>(ActionType.ActualsTable.SelectAllRows);
export const deselectActualsTableRowAction = simpleAction<number>(ActionType.ActualsTable.DeselectRow);
export const removeActualsTableRowAction = simpleAction<Table.IActualRow>(ActionType.ActualsTable.RemoveRow);
export const removeActualAction = simpleAction<Table.IActualRow>(ActionType.Actuals.Remove);
export const deletingActualAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Actuals.Deleting);
export const updatingActualAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Actuals.Updating);
export const creatingActualAction = simpleAction<boolean>(ActionType.Actuals.Creating);
export const requestActualsAction = simpleAction<null>(ActionType.ActualsTable.Request);
export const loadingActualsAction = simpleAction<boolean>(ActionType.ActualsTable.Loading);
export const responseActualsAction = simpleAction<Http.IListResponse<IActual>>(ActionType.ActualsTable.Response);
export const setActualsSearchAction = simpleAction<string>(ActionType.ActualsTable.SetSearch);
export const addErrorsToActualsTableAction = simpleAction<Table.ICellError | Table.ICellError[]>(
  ActionType.ActualsTable.AddErrors
);
