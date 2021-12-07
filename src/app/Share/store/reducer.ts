import { combineReducers } from "redux";
import { filter } from "lodash";

import { redux, budgeting } from "lib";
import { SubAccountsTable, FringesTable } from "components/tabling";

import * as actions from "./actions";
import initialState from "./initialState";

const genericReducer = combineReducers({
  id: redux.reducers.createSimplePayloadReducer<number | null>({
    initialState: null,
    actions: { set: actions.setBudgetIdAction }
  }),
  detail: redux.reducers.createDetailResponseReducer<
    Model.Budget,
    Omit<Redux.ModelDetailResponseActionMap<Model.Budget>, "updateInState">
  >({
    initialState: redux.initialState.initialDetailResponseState,
    actions: {
      loading: actions.loadingBudgetAction,
      response: actions.responseBudgetAction
    }
  }),
  account: budgeting.reducers.createAccountDetailReducer({
    initialState: initialState.account,
    actions: {
      loading: actions.account.loadingAccountAction,
      response: actions.account.responseAccountAction,
      setId: actions.account.setAccountIdAction
    },
    reducers: {
      table: budgeting.reducers.createUnauthenticatedSubAccountsTableReducer({
        initialState: initialState.account.table,
        actions: {
          clear: actions.account.clearAction,
          request: actions.account.requestAction,
          loading: actions.account.loadingAction,
          response: actions.account.responseAction,
          responseSubAccountUnits: actions.responseSubAccountUnitsAction,
          setSearch: actions.account.setSearchAction
        },
        getModelRowChildren: (m: Model.SubAccount) => m.children,
        columns: filter(
          SubAccountsTable.Columns as Table.Column<Tables.SubAccountRowData, Model.SubAccount>[],
          (c: Table.Column<Tables.SubAccountRowData, Model.SubAccount>) => c.requiresAuthentication !== true
        ),
        fringes: budgeting.reducers.createUnauthenticatedFringesTableReducer({
          initialState: initialState.account.table.fringes,
          columns: FringesTable.Columns,
          actions: {
            clear: actions.clearFringesAction,
            responseFringeColors: actions.responseFringeColorsAction,
            request: actions.requestFringesAction,
            loading: actions.loadingFringesAction,
            response: actions.responseFringesAction,
            setSearch: actions.setFringesSearchAction
          }
        })
      })
    }
  }),
  subaccount: budgeting.reducers.createSubAccountDetailReducer({
    initialState: initialState.subaccount,
    actions: {
      setId: actions.subAccount.setSubAccountIdAction,
      loading: actions.subAccount.loadingSubAccountAction,
      response: actions.subAccount.responseSubAccountAction
    },
    reducers: {
      table: budgeting.reducers.createUnauthenticatedSubAccountsTableReducer({
        initialState: initialState.account.table,
        actions: {
          request: actions.subAccount.requestAction,
          loading: actions.subAccount.loadingAction,
          response: actions.subAccount.responseAction,
          responseSubAccountUnits: actions.responseSubAccountUnitsAction,
          clear: actions.subAccount.clearAction,
          setSearch: actions.subAccount.setSearchAction
        },
        getModelRowChildren: (m: Model.SubAccount) => m.children,
        columns: filter(
          SubAccountsTable.Columns as Table.Column<Tables.SubAccountRowData, Model.SubAccount>[],
          (c: Table.Column<Tables.SubAccountRowData, Model.SubAccount>) => c.requiresAuthentication !== true
        ),
        fringes: budgeting.reducers.createUnauthenticatedFringesTableReducer({
          initialState: initialState.subaccount.table.fringes,
          columns: FringesTable.Columns,
          actions: {
            responseFringeColors: actions.responseFringeColorsAction,
            request: actions.requestFringesAction,
            clear: actions.clearFringesAction,
            loading: actions.loadingFringesAction,
            response: actions.responseFringesAction,
            setSearch: actions.setFringesSearchAction
          }
        })
      })
    }
  })
});

const rootReducer: Redux.Reducer<Modules.Share.Store> = (
  state: Modules.Share.Store = initialState,
  action: Redux.Action
): Modules.Share.Store => {
  return genericReducer(state, action);
};

export default rootReducer;
