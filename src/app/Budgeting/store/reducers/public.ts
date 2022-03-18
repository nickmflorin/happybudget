import { combineReducers } from "redux";

import { redux, budgeting, tabling } from "lib";
import { SubAccountsTable, FringesTable, AccountsTable } from "tabling";

import * as actions from "../actions/public";
import { initialPublicBudgetState } from "../initialState";

const SubAccountColumns = tabling.columns.filterModelColumns(SubAccountsTable.Columns);
const AccountColumns = tabling.columns.filterModelColumns(AccountsTable.Columns);
const FringesColumns = tabling.columns.filterModelColumns(FringesTable.Columns);

const genericReducer = combineReducers({
  detail: redux.reducers.createDetailResponseReducer<Model.Budget>({
    initialState: redux.initialDetailResponseState,
    actions: {
      loading: actions.loadingBudgetAction,
      response: actions.responseBudgetAction
    }
  }),
  account: budgeting.reducers.createAccountDetailReducer({
    initialState: initialPublicBudgetState.account,
    actions: {
      loading: actions.account.loadingAccountAction,
      response: actions.account.responseAccountAction
    },
    reducers: {
      table: budgeting.reducers.createPublicSubAccountsTableReducer({
        initialState: initialPublicBudgetState.account.table,
        clearOn: [
          {
            action: actions.account.requestAction,
            payload: (p: Redux.TableRequestPayload) => !redux.isListRequestIdsPayload(p)
          }
        ],
        actions: {
          loading: actions.account.loadingAction,
          response: actions.account.responseAction,
          responseSubAccountUnits: actions.responseSubAccountUnitsAction,
          setSearch: actions.account.setSearchAction
        },
        columns: SubAccountColumns,
        getModelRowChildren: (m: Model.SubAccount) => m.children,
        fringes: budgeting.reducers.createPublicFringesTableReducer({
          initialState: initialPublicBudgetState.account.table.fringes,
          columns: FringesColumns,
          clearOn: [actions.requestFringesAction],
          actions: {
            responseFringeColors: actions.responseFringeColorsAction,
            loading: actions.loadingFringesAction,
            response: actions.responseFringesAction,
            setSearch: actions.setFringesSearchAction
          }
        })
      })
    }
  }),
  accounts: budgeting.reducers.createPublicAccountsTableReducer({
    initialState: initialPublicBudgetState.account.table,
    clearOn: [
      {
        action: actions.accounts.requestAction,
        payload: (p: Redux.TableRequestPayload) => !redux.isListRequestIdsPayload(p)
      }
    ],
    actions: {
      loading: actions.accounts.loadingAction,
      response: actions.accounts.responseAction,
      setSearch: actions.accounts.setSearchAction
    },
    columns: AccountColumns,
    getModelRowChildren: (m: Model.Account) => m.children
  }),
  subaccount: budgeting.reducers.createSubAccountDetailReducer({
    initialState: initialPublicBudgetState.subaccount,
    actions: {
      loading: actions.subAccount.loadingSubAccountAction,
      response: actions.subAccount.responseSubAccountAction
    },
    reducers: {
      table: budgeting.reducers.createPublicSubAccountsTableReducer({
        initialState: initialPublicBudgetState.subaccount.table,
        clearOn: [
          {
            action: actions.subAccount.requestAction,
            payload: (p: Redux.TableRequestPayload) => !redux.isListRequestIdsPayload(p)
          }
        ],
        actions: {
          responseSubAccountUnits: actions.responseSubAccountUnitsAction,
          loading: actions.subAccount.loadingAction,
          response: actions.subAccount.responseAction,
          setSearch: actions.subAccount.setSearchAction
        },
        columns: SubAccountColumns,
        getModelRowChildren: (m: Model.SubAccount) => m.children,
        fringes: budgeting.reducers.createPublicFringesTableReducer({
          initialState: initialPublicBudgetState.subaccount.table.fringes,
          columns: FringesColumns,
          clearOn: [actions.requestFringesAction],
          actions: {
            responseFringeColors: actions.responseFringeColorsAction,
            loading: actions.loadingFringesAction,
            response: actions.responseFringesAction,
            setSearch: actions.setFringesSearchAction
          }
        })
      })
    }
  })
});

const rootReducer: Redux.Reducer<Modules.PublicBudget.Store> = (
  state: Modules.PublicBudget.Store = initialPublicBudgetState,
  action: Redux.Action
): Modules.PublicBudget.Store => {
  return genericReducer(state, action);
};

export default rootReducer;
