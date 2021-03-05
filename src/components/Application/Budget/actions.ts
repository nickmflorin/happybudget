import { createAction } from "store/actions";

export const ActionDomains: { [key: string]: Redux.Dashboard.ActionDomain } = {
  TRASH: "trash",
  ACTIVE: "active"
};

export const ActionType = {
  DeleteAccount: "budget.DeleteAccount",
  AccountRemoved: "budget.AccountRemoved",
  DeletingAccount: "budget.DeletingAccount",
  Budget: {
    Loading: "budget.budget.Loading",
    Response: "budget.budget.Response",
    Request: "budget.budget.Request"
  },
  Accounts: {
    Loading: "budget.accounts.Loading",
    Response: "budget.accounts.Response",
    Request: "budget.accounts.Request",
    Select: "budget.accounts.Select",
    SetSearch: "budget.accounts.SetSearch",
    UpdateInState: "budget.accounts.UpdateInState",
    RemoveFromState: "budget.accounts.RemoveFromState",
    AddToState: "budget.accounts.AddToState"
  },
  Account: {
    Loading: "budget.account.Loading",
    Response: "budget.account.Response",
    Request: "budget.account.Request",
    UpdateInState: "budget.account.UpdateInState",
    // Needs to be implemented.
    RemoveFromState: "budget.account.RemoveFromState",
    SubAccounts: {
      Loading: "budget.account.subaccounts.Loading",
      Response: "budget.account.subaccounts.Response",
      Request: "budget.account.subaccounts.Request",
      Select: "budget.account.subaccounts.Select",
      SetSearch: "budget.account.subaccounts.SetSearch",
      UpdateInState: "budget.account.subaccounts.UpdateInState",
      RemoveFromState: "budget.account.subaccounts.RemoveFromState",
      AddToState: "budget.account.subaccounts.AddToState"
    }
  },
  SubAccount: {
    Loading: "budget.subaccount.Loading",
    Response: "budget.subaccount.Response",
    Request: "budget.subaccount.Request",
    // Needs to be implemented.
    UpdateInState: "budget.subaccount.UpdateInState",
    // Needs to be implemented.
    RemoveFromState: "budget.subaccount.RemoveFromState",
    SubAccounts: {
      Loading: "budget.subaccount.subaccounts.Loading",
      Response: "budget.subaccount.subaccounts.Response",
      Request: "budget.subaccount.subaccounts.Request",
      Select: "budget.subaccount.subaccounts.Select",
      SetSearch: "budget.subaccount.subaccounts.SetSearch",
      UpdateInState: "budget.subaccount.subaccounts.UpdateInState",
      RemoveFromState: "budget.subaccount.subaccounts.RemoveFromState",
      AddToState: "budget.subaccount.subaccounts.AddToState"
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

export const simpleAccountAction = <P = any>(type: string) => {
  return (accountId: number, budgetId: number, payload?: P, options?: Redux.IActionConfig): Redux.Budget.IAction<P> => {
    return { ...createAction<P>(type, payload, options), accountId, budgetId };
  };
};

export const simpleSubAccountAction = <P = any>(type: string) => {
  return (subaccountId: number, payload?: P, options?: Redux.IActionConfig): Redux.Budget.IAction<P> => {
    return { ...createAction<P>(type, payload, options), subaccountId };
  };
};

export const requestBudgetAction = simpleBudgetAction<null>(ActionType.Budget.Request);
export const loadingBudgetAction = simpleBudgetAction<boolean>(ActionType.Budget.Loading);
export const responseBudgetAction = simpleBudgetAction<IBudget>(ActionType.Budget.Response);

export const requestBudgetAccountsAction = simpleBudgetAction<null>(ActionType.Accounts.Request);
export const loadingBudgetAccountsAction = simpleBudgetAction<boolean>(ActionType.Accounts.Loading);
export const responseBudgetAccountsAction = simpleBudgetAction<Http.IListResponse<IAccount>>(
  ActionType.Accounts.Response
);
export const selectBudgetAccountsAction = simpleBudgetAction<number[]>(ActionType.Accounts.Select);
export const setBudgetAccountsSearchAction = simpleBudgetAction<string>(ActionType.Accounts.SetSearch);
export const updateBudgetAccountInStateAction = simpleBudgetAction<IAccount>(ActionType.Accounts.UpdateInState);
export const addBudgetAccountToStateAction = simpleBudgetAction<IAccount>(ActionType.Accounts.AddToState);
export const removeBudgetAccountFromStateAction = simpleBudgetAction<number>(ActionType.Accounts.RemoveFromState);

export const requestAccountAction = simpleAccountAction<null>(ActionType.Account.Request);
export const loadingAccountAction = simpleAccountAction<boolean>(ActionType.Account.Loading);
export const responseAccountAction = simpleAccountAction<IAccount>(ActionType.Account.Response);

export const requestAccountSubAccountsAction = simpleAccountAction<null>(ActionType.Account.SubAccounts.Request);
export const loadingAccountSubAccountsAction = simpleAccountAction<boolean>(ActionType.Account.SubAccounts.Loading);
export const responseAccountSubAccountsAction = simpleAccountAction<Http.IListResponse<ISubAccount>>(
  ActionType.Account.SubAccounts.Response
);
export const selectAccountSubAccountsAction = simpleAccountAction<number[]>(ActionType.Account.SubAccounts.Select);
export const setAccountSubAccountsSearchAction = simpleAccountAction<string>(ActionType.Account.SubAccounts.SetSearch);
export const updateAccountSubAccountInStateAction = simpleAccountAction<ISubAccount>(
  ActionType.Account.SubAccounts.UpdateInState
);
export const addAccountSubAccountToStateAction = simpleAccountAction<ISubAccount>(
  ActionType.Account.SubAccounts.AddToState
);
export const removeAccountSubAccountFromStateAction = simpleAccountAction<number>(
  ActionType.Account.SubAccounts.RemoveFromState
);

export const requestSubAccountAction = simpleSubAccountAction<null>(ActionType.SubAccount.Request);
export const loadingSubAccountAction = simpleSubAccountAction<boolean>(ActionType.SubAccount.Loading);
export const responseSubAccountAction = simpleSubAccountAction<IAccount>(ActionType.SubAccount.Response);

export const requestSubAccountSubAccountsAction = simpleSubAccountAction<null>(
  ActionType.SubAccount.SubAccounts.Request
);
export const loadingSubAccountSubAccountsAction = simpleSubAccountAction<boolean>(
  ActionType.SubAccount.SubAccounts.Loading
);
export const responseSubAccountSubAccountsAction = simpleSubAccountAction<Http.IListResponse<ISubAccount>>(
  ActionType.SubAccount.SubAccounts.Response
);
export const selectSubAccountSubAccountsAction = simpleSubAccountAction<number[]>(
  ActionType.SubAccount.SubAccounts.Select
);
export const setSubAccountSubAccountsSearchAction = simpleSubAccountAction<string>(
  ActionType.SubAccount.SubAccounts.SetSearch
);
export const updateSubAccountSubAccountInStateAction = simpleSubAccountAction<ISubAccount>(
  ActionType.SubAccount.SubAccounts.UpdateInState
);
export const addSubAccountSubAccountToStateAction = simpleSubAccountAction<ISubAccount>(
  ActionType.SubAccount.SubAccounts.AddToState
);
export const removeSubAccountSubAccountFromStateAction = simpleSubAccountAction<number>(
  ActionType.SubAccount.SubAccounts.RemoveFromState
);

// Holistic Actions That Operate Across Domains
export const accountRemovedAction = simpleAction<number>(ActionType.AccountRemoved);
export const deleteAccountAction = simpleAction<number>(ActionType.DeleteAccount);
export const deletingAccountAction = simpleAction<Redux.ModelListActionPayload>(ActionType.DeletingAccount);
