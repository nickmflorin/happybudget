import { combineReducers } from "redux";
import { redux, tabling } from "lib";

import ActionType from "./actions";
import { initialAccountState, initialSubAccountState, initialBudgetState } from "./initialState";

type ReducerFactoryActionMap = {
  SetId: string;
  Request: string;
  Response: string;
  Loading: string;
};

export const createBudgetReducer = (
  mapping: ReducerFactoryActionMap & { Table: Redux.ReadOnlyBudgetTableActionMap },
  initialState: Modules.Unauthenticated.Share.BudgetStore
): Redux.Reducer<Modules.Unauthenticated.Share.BudgetStore> => {
  /* eslint-disable indent */
  const genericReducer: Redux.Reducer<Modules.Unauthenticated.Share.BudgetStore> = combineReducers({
    id: redux.reducers.factories.createSimplePayloadReducer<number | null>(mapping.SetId, null),
    detail: redux.reducers.factories.createDetailResponseReducer<
      Model.Budget,
      Redux.ReadOnlyModelDetailResponseStore<Model.Budget>
    >({
      Response: mapping.Response,
      Loading: mapping.Loading,
      Request: mapping.Request
    }),
    table: tabling.reducers.createReadOnlyBudgetTableReducer<Model.Account>(mapping.Table, initialState.table)
  });

  return genericReducer;
};

const createAccountSubAccountReducer = <M extends Model.Account | Model.SubAccount>(
  /* eslint-disable indent */
  mapping: ReducerFactoryActionMap & {
    Table: Redux.ReadOnlyBudgetTableWithFringesActionMap;
  },
  initialState: Modules.Unauthenticated.Share.AccountOrSubAccountStore<M>
): Redux.Reducer<Modules.Unauthenticated.Share.AccountOrSubAccountStore<M>> => {
  /* eslint-disable indent */
  const genericReducer: Redux.Reducer<Modules.Unauthenticated.Share.AccountOrSubAccountStore<M>> = combineReducers({
    id: redux.reducers.factories.createSimplePayloadReducer<number | null>(mapping.SetId, initialState.id),
    detail: redux.reducers.factories.createDetailResponseReducer<M, Redux.ModelDetailResponseStore<M>>(
      {
        Response: mapping.Response,
        Loading: mapping.Loading,
        Request: mapping.Request
      },
      { initialState: initialState.detail }
    ),
    table: tabling.reducers.createReadOnlyBudgetTableWithFringesReducer<Model.SubAccount>(
      mapping.Table,
      initialState.table
    )
  });
  return genericReducer;
};

export const createAccountReducer = (
  mapping: ReducerFactoryActionMap & {
    Table: Redux.ReadOnlyBudgetTableWithFringesActionMap;
  },
  initialState: Modules.Unauthenticated.Share.AccountStore
): Redux.Reducer<Modules.Unauthenticated.Share.AccountStore> =>
  createAccountSubAccountReducer<Model.Account>(mapping, initialState);

export const createSubAccountReducer = (
  mapping: ReducerFactoryActionMap & {
    Table: Redux.ReadOnlyBudgetTableWithFringesActionMap;
  },
  initialState: Modules.Unauthenticated.Share.SubAccountStore
): Redux.Reducer<Modules.Unauthenticated.Share.SubAccountStore> =>
  createAccountSubAccountReducer<Model.SubAccount>(mapping, initialState);

const rootReducer: Redux.Reducer<Modules.Unauthenticated.Share.Store> = combineReducers({
  account: createAccountReducer(
    {
      SetId: ActionType.Budget.Account.SetId,
      Response: ActionType.Budget.Account.Response,
      Loading: ActionType.Budget.Account.Loading,
      Request: ActionType.Budget.Account.Request,
      Table: {
        Response: ActionType.Budget.Account.SubAccounts.Response,
        Request: ActionType.Budget.Account.SubAccounts.Request,
        Loading: ActionType.Budget.Account.SubAccounts.Loading,
        SetSearch: ActionType.Budget.Account.SubAccounts.SetSearch,
        Groups: {
          Response: ActionType.Budget.Account.Groups.Response,
          Request: ActionType.Budget.Account.Groups.Request,
          Loading: ActionType.Budget.Account.Groups.Loading
        },
        Fringes: {
          Response: ActionType.Budget.Account.Fringes.Response,
          Request: ActionType.Budget.Account.Fringes.Request,
          Loading: ActionType.Budget.Account.Fringes.Loading
        }
      }
    },
    initialAccountState
  ),
  subaccount: createSubAccountReducer(
    {
      SetId: ActionType.Budget.SubAccount.SetId,
      Response: ActionType.Budget.SubAccount.Response,
      Loading: ActionType.Budget.SubAccount.Loading,
      Request: ActionType.Budget.SubAccount.Request,
      Table: {
        Response: ActionType.Budget.SubAccount.SubAccounts.Response,
        Request: ActionType.Budget.SubAccount.SubAccounts.Request,
        Loading: ActionType.Budget.SubAccount.SubAccounts.Loading,
        SetSearch: ActionType.Budget.SubAccount.SubAccounts.SetSearch,
        Groups: {
          Response: ActionType.Budget.SubAccount.Groups.Response,
          Request: ActionType.Budget.SubAccount.Groups.Request,
          Loading: ActionType.Budget.SubAccount.Groups.Loading
        },
        Fringes: {
          Response: ActionType.Budget.SubAccount.Fringes.Response,
          Request: ActionType.Budget.SubAccount.Fringes.Request,
          Loading: ActionType.Budget.SubAccount.Fringes.Loading
        }
      }
    },
    initialSubAccountState
  ),
  budget: createBudgetReducer(
    {
      Response: ActionType.Budget.Response,
      Loading: ActionType.Budget.Loading,
      Request: ActionType.Budget.Request,
      SetId: ActionType.Budget.SetId,
      Table: {
        Response: ActionType.Budget.Accounts.Response,
        Request: ActionType.Budget.Accounts.Request,
        Loading: ActionType.Budget.Accounts.Loading,
        SetSearch: ActionType.Budget.Accounts.SetSearch,
        Groups: {
          Response: ActionType.Budget.Groups.Response,
          Request: ActionType.Budget.Groups.Request,
          Loading: ActionType.Budget.Groups.Loading
        }
      }
    },
    initialBudgetState
  )
});

export default rootReducer;
