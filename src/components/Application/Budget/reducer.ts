import { Reducer, combineReducers } from "redux";
import { isNil, find, filter } from "lodash";
import {
  createListResponseReducer,
  createDetailResponseReducer,
  createSimpleBooleanReducer,
  createModelListActionReducer
} from "store/util";
import { replaceInArray } from "util/arrays";

import { ActionType } from "./actions";
import initialState, { initialAccountState, initialSubAccountState } from "./initialState";
import { createSubAccountRowPlaceholder } from "./util";

const createAccountSubAccountsListResponseReducer = (
  accountId: number
): Reducer<Redux.Budget.ISubAccountListResponseStore> =>
  combineReducers({
    deleting: createModelListActionReducer(ActionType.Account.SubAccounts.Deleting, { referenceEntity: "subaccount" }),
    updating: createModelListActionReducer(ActionType.Account.SubAccounts.Updating, { referenceEntity: "subaccount" }),
    creating: createSimpleBooleanReducer(ActionType.Account.SubAccounts.Creating),
    list: createListResponseReducer(
      {
        Response: ActionType.Account.SubAccounts.Response,
        Loading: ActionType.Account.SubAccounts.Loading,
        SetSearch: ActionType.Account.SubAccounts.SetSearch,
        AddToState: ActionType.Account.SubAccounts.AddToState,
        RemoveFromState: ActionType.Account.SubAccounts.RemoveFromState,
        UpdateInState: ActionType.Account.SubAccounts.UpdateInState
      },
      {
        referenceEntity: "subaccount",
        excludeActions: (action: Redux.Budget.IAction<any>) => {
          return action.accountId !== accountId;
        }
      }
    )
  });

const createSubAccountSubAccountsListResponseReducer = (
  subaccountId: number
): Reducer<Redux.Budget.ISubAccountListResponseStore> =>
  combineReducers({
    deleting: createModelListActionReducer(ActionType.SubAccount.SubAccounts.Deleting, {
      referenceEntity: "subaccount"
    }),
    updating: createModelListActionReducer(ActionType.SubAccount.SubAccounts.Updating, {
      referenceEntity: "subaccount"
    }),
    creating: createSimpleBooleanReducer(ActionType.SubAccount.SubAccounts.Creating),
    list: createListResponseReducer(
      {
        Response: ActionType.SubAccount.SubAccounts.Response,
        Loading: ActionType.SubAccount.SubAccounts.Loading,
        Select: ActionType.SubAccount.SubAccounts.Select,
        SetSearch: ActionType.SubAccount.SubAccounts.SetSearch,
        AddToState: ActionType.SubAccount.SubAccounts.AddToState,
        RemoveFromState: ActionType.SubAccount.SubAccounts.RemoveFromState,
        UpdateInState: ActionType.SubAccount.SubAccounts.UpdateInState
      },
      {
        referenceEntity: "subaccount",
        excludeActions: (action: Redux.Budget.IAction<any>) => {
          return action.subaccountId !== subaccountId;
        }
      }
    )
  });

const createAccountIndexedReducer = (accountId: number): Reducer<Redux.Budget.IAccountStore, Redux.Budget.IAction> =>
  combineReducers({
    subaccounts: createAccountSubAccountsListResponseReducer(accountId),
    detail: createDetailResponseReducer<IAccount, Redux.IDetailResponseStore<IAccount>, Redux.Budget.IAction>(
      {
        Response: ActionType.Account.Response,
        Loading: ActionType.Account.Loading,
        Request: ActionType.Account.Request,
        UpdateInState: ActionType.Account.UpdateInState
      },
      {
        excludeActions: (act: Redux.Budget.IAction<any>) => {
          return act.accountId !== accountId;
        }
      }
    )
  });

const createSubAccountIndexedReducer = (
  subaccountId: number
): Reducer<Redux.Budget.ISubAccountStore, Redux.Budget.IAction> =>
  combineReducers({
    subaccounts: createSubAccountSubAccountsListResponseReducer(subaccountId),
    detail: createDetailResponseReducer<ISubAccount, Redux.IDetailResponseStore<ISubAccount>, Redux.Budget.IAction>(
      {
        Response: ActionType.SubAccount.Response,
        Loading: ActionType.SubAccount.Loading,
        Request: ActionType.SubAccount.Request
      },
      {
        excludeActions: (act: Redux.Budget.IAction<any>) => {
          return act.subaccountId !== subaccountId;
        }
      }
    )
  });

const accountsIndexedDetailsReducer: Reducer<
  Redux.IIndexedStore<Redux.Budget.IAccountStore>,
  Redux.Budget.IAction<any>
> = (
  state: Redux.IIndexedStore<Redux.Budget.IAccountStore> = {},
  action: Redux.Budget.IAction<any>
): Redux.IIndexedStore<Redux.Budget.IAccountStore> => {
  let newState = { ...state };
  if (!isNil(action.payload) && action.type === ActionType.AccountRemoved && !isNil(newState[action.payload])) {
    const key = action.payload;
    const { [key]: value, ...withoutAccount } = newState;
    newState = { ...withoutAccount };
  } else if (!isNil(action.accountId)) {
    if (isNil(newState[action.accountId])) {
      newState = { ...newState, [action.accountId]: initialAccountState };
    }
    const accountReducer = createAccountIndexedReducer(action.accountId);
    newState = {
      ...newState,
      [action.accountId]: accountReducer(newState[action.accountId], action)
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
    if (action.type === ActionType.SubAccount.RemoveFromState && !isNil(newState[action.subaccountId])) {
      const key = action.subaccountId;
      const { [key]: value, ...withoutAccount } = newState;
      newState = { ...withoutAccount };
    } else {
      if (isNil(newState[action.subaccountId])) {
        newState = { ...newState, [action.subaccountId]: initialSubAccountState };
      }
      const subaccountReducer = createSubAccountIndexedReducer(action.subaccountId);
      newState = {
        ...newState,
        [action.subaccountId]: subaccountReducer(newState[action.subaccountId], action)
      };
    }
  }
  return newState;
};

const subaccountsTableReducer: Reducer<Redux.Budget.ISubAccountRow[], Redux.Budget.IAction<any>> = (
  state: Redux.Budget.ISubAccountRow[] = initialState.subaccountsTable,
  action: Redux.Budget.IAction<any>
) => {
  let newState = [...state];
  if (action.type === ActionType.Account.SubAccountsTable.SetData) {
    return action.payload;
  } else if (action.type === ActionType.Account.SubAccountsTable.AddRow) {
    newState = [...newState, createSubAccountRowPlaceholder()];
  } else if (
    action.type === ActionType.Account.SubAccountsTable.UpdateRow ||
    action.type === ActionType.Account.SubAccountsTable.UpdateRowInStateOnly
  ) {
    // TODO: Eventually, we should wait until the set of required fields have
    // been populated on the row before submitting a request to create the
    // SubAccount in the backend.
    const existing = find(newState, { id: action.payload.id });
    if (isNil(existing)) {
      /* eslint-disable no-console */
      console.error(
        `Inconsistent State!:  Inconsistent state noticed when updating sub account in state...
        the subaccount with ID ${action.payload.id} does not exist in state when it is expected to.`
      );
    } else {
      newState = replaceInArray<Redux.Budget.ISubAccountRow>(
        newState,
        { id: action.payload.id },
        { ...existing, ...action.payload.payload }
      );
    }
  } else if (action.type === ActionType.Account.SubAccountsTable.RemoveRow) {
    const existing = find(newState, { id: action.payload.id });
    if (isNil(existing)) {
      /* eslint-disable no-console */
      console.error(
        `Inconsistent State!:  Inconsistent state noticed when removing sub account from state...
          the subaccount with ID ${action.payload.id} does not exist in state when it is expected to.`
      );
    } else {
      newState = filter(newState, (row: Redux.Budget.ISubAccountRow) => row.id !== action.payload.id);
    }
  } else if (action.type === ActionType.Account.SubAccountsTable.SelectRow) {
    console.log("Selecting!");
    const existing = find(newState, { id: action.payload });
    if (isNil(existing)) {
      /* eslint-disable no-console */
      console.error(
        `Inconsistent State!:  Inconsistent state noticed when selecting sub account in state...
        the subaccount with ID ${action.payload} does not exist in state when it is expected to.`
      );
    } else if (existing.selected === true) {
      /* eslint-disable no-console */
      console.error(
        `Inconsistent State!:  Inconsistent state noticed when selecting sub account in state...
        the subaccount with ID ${action.payload} is already selected when it is not expected to be.`
      );
    } else {
      console.log(action.payload);
      newState = replaceInArray<Redux.Budget.ISubAccountRow>(
        newState,
        { id: action.payload },
        { ...existing, selected: true }
      );
    }
  } else if (action.type === ActionType.Account.SubAccountsTable.DeselectRow) {
    const existing = find(newState, { id: action.payload });
    if (isNil(existing)) {
      /* eslint-disable no-console */
      console.error(
        `Inconsistent State!:  Inconsistent state noticed when deselecting sub account in state...
        the subaccount with ID ${action.payload} does not exist in state when it is expected to.`
      );
    } else if (existing.selected === false) {
      /* eslint-disable no-console */
      console.error(
        `Inconsistent State!:  Inconsistent state noticed when deselecting sub account in state...
        the subaccount with ID ${action.payload} is already deselected when it is not expected to be.`
      );
    } else {
      newState = replaceInArray<Redux.Budget.ISubAccountRow>(
        newState,
        { id: action.payload },
        { ...existing, selected: false }
      );
    }
  }
  return newState;
};

const rootReducer = combineReducers({
  budget: createDetailResponseReducer<IBudget, Redux.IDetailResponseStore<IBudget>, Redux.Budget.IAction>({
    Response: ActionType.Budget.Response,
    Loading: ActionType.Budget.Loading,
    Request: ActionType.Budget.Request
  }),
  subaccounts: subaccountsIndexedDetailsReducer,
  subaccountsTable: subaccountsTableReducer,
  accounts: combineReducers({
    details: accountsIndexedDetailsReducer,
    deleting: createModelListActionReducer(ActionType.DeletingAccount, { referenceEntity: "account" }),
    updating: createModelListActionReducer(ActionType.UpdatingAccount, { referenceEntity: "account" }),
    creating: createSimpleBooleanReducer(ActionType.CreatingAccount),
    list: createListResponseReducer(
      {
        Response: ActionType.Accounts.Response,
        Loading: ActionType.Accounts.Loading,
        Select: ActionType.Accounts.Select,
        SetSearch: ActionType.Accounts.SetSearch,
        AddToState: ActionType.Accounts.AddToState,
        RemoveFromState: ActionType.Accounts.RemoveFromState,
        UpdateInState: ActionType.Accounts.UpdateInState
      },
      {
        referenceEntity: "account"
      }
    )
  })
});

export default rootReducer;
