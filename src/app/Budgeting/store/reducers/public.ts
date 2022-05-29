import { combineReducers } from "redux";

import { redux, budgeting, tabling } from "lib";
import { SubAccountsTable, FringesTable, AccountsTable } from "tabling";

import * as actions from "../actions/public";
import * as initialState from "../initialState";

const SubAccountColumns = tabling.columns.filterModelColumns(SubAccountsTable.Columns);
const AccountColumns = tabling.columns.filterModelColumns(AccountsTable.Columns);
const FringesColumns = tabling.columns.filterModelColumns(FringesTable.Columns);

const rootReducer: Redux.Reducer<
  Modules.PublicBudget.Store,
  | BudgetActionContext<Model.Budget, true>
  | SubAccountActionContext<Model.Budget, true>
  | AccountActionContext<Model.Budget, true>
  | AccountsTableActionContext<Model.Budget, true>
  | SubAccountsTableActionContext<Model.Budget, Model.SubAccount | Model.Account, true>
> = combineReducers({
  detail: redux.reducers.createDetailReducer<Model.Budget, BudgetActionContext<Model.Budget, true>>({
    initialState: redux.initialDetailResponseState,
    actions: {
      loading: actions.loadingBudgetAction,
      response: actions.responseBudgetAction
    }
  }),
  fringes: budgeting.reducers.createPublicFringesTableReducer<Model.Budget>({
    initialState: redux.initialTableState,
    columns: FringesColumns,
    actions: {
      loading: actions.loadingFringesAction,
      response: actions.responseFringesAction,
      setSearch: actions.setFringesSearchAction
    }
  }),
  account: redux.reducers.createModelIndexedReducer<
    Modules.AccountOrSubAccountStore<Model.Account>,
    SubAccountActionContext<Model.Budget, true>
  >(
    budgeting.reducers.createPublicAccountSubAccountStoreReducer<Model.Budget, Model.Account>({
      initialState: initialState.initialAccountState,
      columns: SubAccountColumns,
      actions: {
        loading: actions.account.loadingAccountAction,
        response: actions.account.responseAccountAction
      },
      tableActions: {
        request: actions.account.requestAction,
        loading: actions.account.loadingAction,
        response: actions.account.responseAction,
        setSearch: actions.account.setSearchAction
      }
    }),
    {
      initialState: initialState.initialAccountState,
      includeAction: (a: Redux.AnyPayloadAction<SubAccountActionContext<Model.Budget, true>>) =>
        a.label === "public.account",
      getId: (a: Redux.AnyPayloadAction<SubAccountActionContext<Model.Budget, true>>) => a.context.id
    }
  ),
  subaccount: redux.reducers.createModelIndexedReducer<
    Modules.AccountOrSubAccountStore<Model.SubAccount>,
    SubAccountActionContext<Model.Budget, true>
  >(
    budgeting.reducers.createPublicAccountSubAccountStoreReducer<Model.Budget, Model.SubAccount>({
      initialState: initialState.initialSubAccountState,
      columns: SubAccountColumns,
      actions: {
        loading: actions.subAccount.loadingSubAccountAction,
        response: actions.subAccount.responseSubAccountAction
      },
      tableActions: {
        request: actions.subAccount.requestAction,
        loading: actions.subAccount.loadingAction,
        response: actions.subAccount.responseAction,
        setSearch: actions.subAccount.setSearchAction
      }
    }),
    {
      initialState: initialState.initialSubAccountState,
      includeAction: (a: Redux.AnyPayloadAction<SubAccountActionContext<Model.Budget, true>>) =>
        a.label === "public.subaccount",
      getId: (a: Redux.AnyPayloadAction<SubAccountActionContext<Model.Budget, true>>) => a.context.id
    }
  ),
  accounts: budgeting.reducers.createPublicAccountsTableReducer<Model.Budget>({
    initialState: initialState.initialBudgetState.accounts,
    columns: AccountColumns,
    actions: {
      loading: actions.loadingAction,
      response: actions.responseAction,
      setSearch: actions.setSearchAction
    }
  })
});

export default rootReducer;
