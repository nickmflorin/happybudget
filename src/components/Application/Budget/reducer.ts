import { Reducer, combineReducers } from "redux";
import { isNil } from "lodash";
import {
  createListResponseReducer,
  createDetailResponseReducer,
  createSimpleBooleanReducer,
  createModelListActionReducer
} from "store/util";
import { initialAccountState, initialSubAccountState } from "./initialState";

import { ActionType } from "./actions";

const createAccountSubAccountsListResponseReducer = (
  accountId: number
): Reducer<Redux.IListResponseStore<ISubAccount>> =>
  createListResponseReducer(
    {
      Response: ActionType.Account.SubAccounts.Response,
      Loading: ActionType.Account.SubAccounts.Loading,
      Select: ActionType.Account.SubAccounts.Select,
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
  );

const createSubAccountSubAccountsListResponseReducer = (
  subaccountId: number
): Reducer<Redux.IListResponseStore<ISubAccount>> =>
  createListResponseReducer(
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
  );

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

const rootReducer = combineReducers({
  budget: createDetailResponseReducer<IBudget, Redux.IDetailResponseStore<IBudget>, Redux.Budget.IAction>({
    Response: ActionType.Budget.Response,
    Loading: ActionType.Budget.Loading,
    Request: ActionType.Budget.Request
  }),
  subaccounts: subaccountsIndexedDetailsReducer,
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
