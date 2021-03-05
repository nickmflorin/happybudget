import { isNil } from "lodash";
import { createAction } from "store/actions";

export type Pointer = { accountId: number; subaccountId?: undefined } | { accountId?: undefined; subaccountId: number };

export const ActionDomains: { [key: string]: Redux.Dashboard.ActionDomain } = {
  TRASH: "trash",
  ACTIVE: "active"
};

export const ActionType = {
  DeleteAccount: "budget.DeleteAccount",
  DeletingAccount: "budget.DeletingAccount",
  DeleteSubAccount: "budget.DeleteSubAccount",
  DeletingSubAccount: "budget.DeletingSubAccount",
  UpdateAccount: "budget.UpdateAccount",
  UpdatingAccount: "budget.UpdatingAccount",
  UpdateSubAccount: "budget.UpdateSubAccount",
  UpdatingSubAccount: "budget.UpdatingSubAccount",
  CreateAccount: "budget.CreateAccount",
  CreatingAccount: "budget.CreatingAccount",
  CreateSubAccount: "budget.CreateSubAccount",
  CreatingSubAccount: "budget.CreatingSubAccount",
  AccountRemoved: "budget.AccountRemoved",
  AccountChanged: "budget.AccountChanged",
  AccountAdded: "budget.AccountAdded",
  SubAccountRemoved: "budget.SubAccountRemoved",
  SubAccountChanged: "budget.SubAccountChanged",
  SubAccountAdded: "budget.SubAccountAdded",
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
      Create: "budget.account.subaccounts.Create",
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
      Create: "budget.subaccount.subaccounts.Create",
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

export const requestBudgetAction = simpleBudgetAction<null>(ActionType.Budget.Request);
export const loadingBudgetAction = simpleBudgetAction<boolean>(ActionType.Budget.Loading);
export const responseBudgetAction = simpleBudgetAction<IBudget>(ActionType.Budget.Response);

export const requestAccountsAction = simpleBudgetAction<null>(ActionType.Accounts.Request);
export const loadingAccountsAction = simpleAction<boolean>(ActionType.Accounts.Loading);
export const responseAccountsAction = simpleAction<Http.IListResponse<IAccount>>(ActionType.Accounts.Response);
export const selectAccountsAction = simpleAction<number[]>(ActionType.Accounts.Select);
export const setAccountsSearchAction = simpleAction<string>(ActionType.Accounts.SetSearch);
// NOTE: These 3 actions are not currently used.  When the state is updated directly after an API request,
// it causes unnecessary rerendering of AGGridReact.  It is better to allow AGGridReact to handle the state
// and only use the raw data to populate the table on it's first render.
export const updateAccountInStateAction = simpleAction<IAccount>(ActionType.Accounts.UpdateInState);
export const addAccountToStateAction = simpleAction<IAccount>(ActionType.Accounts.AddToState);
export const removeAccountFromStateAction = simpleAction<number>(ActionType.Accounts.RemoveFromState);

export const requestAccountAction = simpleAccountAction<null>(ActionType.Account.Request);
export const loadingAccountAction = simpleAccountAction<boolean>(ActionType.Account.Loading);
export const responseAccountAction = simpleAccountAction<IAccount>(ActionType.Account.Response);

export const createAccountSubAccountAction = simpleBudgetAccountAction<Http.ISubAccountPayload>(
  ActionType.Account.SubAccounts.Create
);
export const requestAccountSubAccountsAction = simpleBudgetAccountAction<null>(ActionType.Account.SubAccounts.Request);
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

export const createSubAccountSubAccountAction = simpleSubAccountAction<Http.ISubAccountPayload>(
  ActionType.SubAccount.SubAccounts.Create
);
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

// Convenience actions that dictate which specific action should be called
// based on the pointer.
export const createSubAccountAction = (budgetId: number, payload: Http.ISubAccountPayload, pointer: Pointer) => {
  if (pointer.accountId !== undefined) {
    return createAccountSubAccountAction(pointer.accountId, budgetId, payload);
  }
  return createSubAccountSubAccountAction(pointer.subaccountId, payload);
};

export const selectSubAccountsAction = (payload: number[], pointer: Pointer) => {
  if (pointer.accountId !== undefined) {
    return selectAccountSubAccountsAction(pointer.accountId, payload);
  }
  return selectSubAccountSubAccountsAction(pointer.subaccountId, payload);
};
export const setSubAccountsSearchAction = (payload: string, pointer: Pointer) => {
  if (pointer.accountId !== undefined) {
    return setAccountSubAccountsSearchAction(pointer.accountId, payload);
  }
  return setSubAccountSubAccountsSearchAction(pointer.subaccountId, payload);
};

// Holistic Actions That Operate Across Domains
export const accountRemovedAction = simpleAction<number>(ActionType.AccountRemoved);
export const accountChangedAction = simpleAction<IAccount>(ActionType.AccountChanged);
export const accountAddedAction = simpleAction<IAccount>(ActionType.AccountAdded);

export const deleteAccountAction = simpleAction<number>(ActionType.DeleteAccount);
export const deletingAccountAction = simpleAction<Redux.ModelListActionPayload>(ActionType.DeletingAccount);
export const updateAccountAction = simpleAccountAction<Partial<Http.IAccountPayload>>(ActionType.UpdateAccount);
export const updatingAccountAction = simpleAction<Redux.ModelListActionPayload>(ActionType.UpdatingAccount);
export const createAccountAction = simpleBudgetAction<Http.IAccountPayload>(ActionType.CreateAccount);
export const creatingAccountAction = simpleAction<boolean>(ActionType.CreatingAccount);

export const subaccountRemovedAction = simpleAction<number>(ActionType.SubAccountRemoved);
export const subaccountChangedAction = simpleAction<ISubAccount>(ActionType.SubAccountChanged);
export const subaccountAddedAction = simpleAction<ISubAccount>(ActionType.SubAccountAdded);

export const deleteSubAccountAction = simpleAction<number>(ActionType.DeleteSubAccount);
export const deletingSubAccountAction = simpleAction<Redux.ModelListActionPayload>(ActionType.DeletingSubAccount);
export const updateSubAccountAction = simpleSubAccountAction<Partial<Http.ISubAccountPayload>>(
  ActionType.UpdateSubAccount
);
export const updatingSubAccountAction = simpleAction<Redux.ModelListActionPayload>(ActionType.UpdatingSubAccount);
// Need to know if it pertains to the budget or the account!
// export const createSubAccountAction = simpleBudgetAction<Http.IAccountPayload>(ActionType.CreateSubAccount);
// export const creatingSubAccountAction = simpleAction<boolean>(ActionType.CreatingSubAccount);
