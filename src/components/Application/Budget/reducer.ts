import { Reducer, combineReducers } from "redux";
import { isNil } from "lodash";
import {
  createListResponseReducer,
  createDetailResponseReducer,
  createSimpleBooleanReducer,
  createModelListActionReducer,
  createTableReducer
} from "store/reducerFactories";

import { ActionType } from "./actions";
import { initialAccountState, initialSubAccountState } from "./initialState";
import { createSubAccountRowPlaceholder, createAccountRowPlaceholder } from "./util";

const indexedAccountReducer = combineReducers({
  subaccounts: combineReducers({
    deleting: createModelListActionReducer(ActionType.Account.SubAccounts.Deleting, { referenceEntity: "subaccount" }),
    updating: createModelListActionReducer(ActionType.Account.SubAccounts.Updating, { referenceEntity: "subaccount" }),
    creating: createSimpleBooleanReducer(ActionType.Account.SubAccounts.Creating),
    table: createTableReducer<Redux.Budget.ISubAccountRow, Redux.Budget.IAction<any>>(
      {
        SetData: ActionType.Account.SubAccountsTable.SetData,
        AddRow: ActionType.Account.SubAccountsTable.AddRow,
        RemoveRow: ActionType.Account.SubAccountsTable.RemoveRow,
        UpdateRow: ActionType.Account.SubAccountsTable.UpdateRow,
        UpdateRowInStateOnly: ActionType.Account.SubAccountsTable.UpdateRowInStateOnly,
        SelectRow: ActionType.Account.SubAccountsTable.SelectRow,
        DeselectRow: ActionType.Account.SubAccountsTable.DeselectRow,
        SelectAllRows: ActionType.Account.SubAccountsTable.SelectAllRows
      },
      createSubAccountRowPlaceholder,
      { referenceEntity: "subaccount" }
    ),
    // TODO: Do we want to also maintain the raw list data to keep it in sync
    // with the table rows?  Right now we don't have to, because the raw data
    // is just used for initial population of the tables, but we may need to.
    list: createListResponseReducer<ISubAccount, Redux.IListResponseStore<ISubAccount>, Redux.Budget.IAction<any>>(
      {
        Response: ActionType.Account.SubAccounts.Response,
        Loading: ActionType.Account.SubAccounts.Loading,
        SetSearch: ActionType.Account.SubAccounts.SetSearch
      },
      {
        referenceEntity: "subaccount"
      }
    )
  }),
  detail: createDetailResponseReducer<IAccount, Redux.IDetailResponseStore<IAccount>, Redux.Budget.IAction>({
    Response: ActionType.Account.Response,
    Loading: ActionType.Account.Loading,
    Request: ActionType.Account.Request
  })
});

const indexedSubAccountReducer = combineReducers({
  subaccounts: combineReducers({
    deleting: createModelListActionReducer(ActionType.SubAccount.SubAccounts.Deleting, {
      referenceEntity: "subaccount"
    }),
    updating: createModelListActionReducer(ActionType.SubAccount.SubAccounts.Updating, {
      referenceEntity: "subaccount"
    }),
    creating: createSimpleBooleanReducer(ActionType.SubAccount.SubAccounts.Creating),
    table: createTableReducer<Redux.Budget.ISubAccountRow, Redux.Budget.IAction<any>>(
      {
        SetData: ActionType.SubAccount.SubAccountsTable.SetData,
        AddRow: ActionType.SubAccount.SubAccountsTable.AddRow,
        RemoveRow: ActionType.SubAccount.SubAccountsTable.RemoveRow,
        UpdateRow: ActionType.SubAccount.SubAccountsTable.UpdateRow,
        UpdateRowInStateOnly: ActionType.SubAccount.SubAccountsTable.UpdateRowInStateOnly,
        SelectRow: ActionType.SubAccount.SubAccountsTable.SelectRow,
        DeselectRow: ActionType.SubAccount.SubAccountsTable.DeselectRow,
        SelectAllRows: ActionType.SubAccount.SubAccountsTable.SelectAllRows
      },
      createSubAccountRowPlaceholder,
      { referenceEntity: "subaccount" }
    ),
    // TODO: Do we want to also maintain the raw list data to keep it in sync
    // with the table rows?  Right now we don't have to, because the raw data
    // is just used for initial population of the tables, but we may need to.
    list: createListResponseReducer<ISubAccount, Redux.IListResponseStore<ISubAccount>, Redux.Budget.IAction<any>>(
      {
        Response: ActionType.SubAccount.SubAccounts.Response,
        Loading: ActionType.SubAccount.SubAccounts.Loading,
        Select: ActionType.SubAccount.SubAccounts.Select,
        SetSearch: ActionType.SubAccount.SubAccounts.SetSearch
      },
      {
        referenceEntity: "subaccount"
      }
    )
  }),
  detail: createDetailResponseReducer<ISubAccount, Redux.IDetailResponseStore<ISubAccount>, Redux.Budget.IAction>({
    Response: ActionType.SubAccount.Response,
    Loading: ActionType.SubAccount.Loading,
    Request: ActionType.SubAccount.Request
  })
});

const accountsIndexedDetailsReducer: Reducer<
  Redux.IIndexedStore<Redux.Budget.IAccountStore>,
  Redux.Budget.IAction<any>
> = (
  state: Redux.IIndexedStore<Redux.Budget.IAccountStore> = {},
  action: Redux.Budget.IAction<any>
): Redux.IIndexedStore<Redux.Budget.IAccountStore> => {
  let newState = { ...state };
  if (!isNil(action.accountId)) {
    if (isNil(newState[action.accountId])) {
      newState = { ...newState, [action.accountId]: initialAccountState };
    }
    newState = {
      ...newState,
      [action.accountId]: indexedAccountReducer(newState[action.accountId], action)
    };
  }
  return newState;
};

const subaccountsIndexedDetailsReducer: Reducer<
  Redux.IIndexedStore<Redux.Budget.ISubAccountStore>,
  Redux.Budget.IAction<any>
> = (
  state: Redux.IIndexedStore<Redux.Budget.ISubAccountStore> = {},
  action: Redux.Budget.IAction<any>
): Redux.IIndexedStore<Redux.Budget.ISubAccountStore> => {
  let newState = { ...state };
  if (!isNil(action.subaccountId)) {
    if (isNil(newState[action.subaccountId])) {
      newState = { ...newState, [action.subaccountId]: initialSubAccountState };
    }
    newState = {
      ...newState,
      [action.subaccountId]: indexedSubAccountReducer(newState[action.subaccountId], action)
    };
  }
  return newState;
};

const ancestorsReducer: Reducer<Redux.ListStore<IAncestor>, Redux.Budget.IAction<any>> = (
  state: Redux.ListStore<IAncestor> = [],
  action: Redux.Budget.IAction<any>
) => {
  let newState = [...state];
  if (action.type === ActionType.SetAncestors) {
    newState = action.payload;
  }
  return newState;
};

const rootReducer = combineReducers({
  ancestors: ancestorsReducer,
  ancestorsLoading: createSimpleBooleanReducer(ActionType.SetAncestorsLoading),
  budget: createDetailResponseReducer<IBudget, Redux.IDetailResponseStore<IBudget>, Redux.Budget.IAction>({
    Response: ActionType.Budget.Response,
    Loading: ActionType.Budget.Loading,
    Request: ActionType.Budget.Request
  }),
  subaccounts: subaccountsIndexedDetailsReducer,
  accounts: combineReducers({
    details: accountsIndexedDetailsReducer,
    deleting: createModelListActionReducer(ActionType.Accounts.Deleting, { referenceEntity: "account" }),
    updating: createModelListActionReducer(ActionType.Accounts.Updating, { referenceEntity: "account" }),
    creating: createSimpleBooleanReducer(ActionType.Accounts.Creating),
    table: createTableReducer<Redux.Budget.IAccountRow, Redux.Budget.IAction<any>>(
      {
        SetData: ActionType.AccountsTable.SetData,
        AddRow: ActionType.AccountsTable.AddRow,
        RemoveRow: ActionType.AccountsTable.RemoveRow,
        UpdateRow: ActionType.AccountsTable.UpdateRow,
        UpdateRowInStateOnly: ActionType.AccountsTable.UpdateRowInStateOnly,
        SelectRow: ActionType.AccountsTable.SelectRow,
        DeselectRow: ActionType.AccountsTable.DeselectRow,
        SelectAllRows: ActionType.AccountsTable.SelectAllRows
      },
      createAccountRowPlaceholder,
      { referenceEntity: "account" }
    ),
    // TODO: Do we want to also maintain the raw list data to keep it in sync
    // with the table rows?  Right now we don't have to, because the raw data
    // is just used for initial population of the tables, but we may need to.
    list: createListResponseReducer(
      {
        Response: ActionType.Accounts.Response,
        Loading: ActionType.Accounts.Loading,
        Select: ActionType.Accounts.Select,
        SetSearch: ActionType.Accounts.SetSearch
      },
      {
        referenceEntity: "account"
      }
    )
  })
});

export default rootReducer;
