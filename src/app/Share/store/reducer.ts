import { combineReducers } from "redux";
import { filter } from "lodash";

import { redux, budgeting } from "lib";
import { SubAccountsTable, FringesTable } from "components/tabling";

import * as actions from "./actions";
import initialState from "./initialState";

const genericReducer = combineReducers({
  id: redux.reducers.createSimplePayloadReducer<ID | null>({
    initialState: null,
    actions: { set: actions.setBudgetIdAction }
  }),
  detail: redux.reducers.createDetailResponseReducer<
    Model.Budget,
    Omit<Redux.ModelDetailResponseActionMap<Model.Budget>, "updateInState">
  >({
    initialState: redux.initialState.initialDetailResponseState,
    actions: {
      request: actions.requestBudgetAction,
      loading: actions.loadingBudgetAction,
      response: actions.responseBudgetAction
    }
  }),
  account: combineReducers({
    id: redux.reducers.createSimplePayloadReducer<ID | null>({
      initialState: null,
      actions: { set: actions.account.setAccountIdAction }
    }),
    detail: redux.reducers.createDetailResponseReducer<
      Model.Account,
      Omit<Redux.ModelDetailResponseActionMap<Model.Account>, "updateInState">
    >({
      initialState: redux.initialState.initialDetailResponseState,
      actions: {
        request: actions.account.requestAccountAction,
        loading: actions.account.loadingAccountAction,
        response: actions.account.responseAccountAction
      }
    }),
    table: budgeting.reducers.createUnauthenticatedSubAccountsTableReducer({
      initialState: initialState.account.table,
      actions: {
        request: actions.account.requestAction,
        loading: actions.account.loadingAction,
        response: actions.account.responseAction,
        responseSubAccountUnits: actions.responseSubAccountUnitsAction,
        setSearch: actions.account.setSearchAction
      },
      getModelRowLabel: (r: Tables.SubAccountRowData) => r.identifier || r.description,
      getPlaceholderRowLabel: (r: Tables.SubAccountRowData) => r.identifier || r.description,
      getModelRowChildren: (m: Model.SubAccount) => m.subaccounts,
      getModelRowName: "Sub Account",
      getPlaceholderRowName: "Sub Account",
      columns: filter(
        SubAccountsTable.Columns,
        (c: Table.Column<Tables.SubAccountRowData, Model.SubAccount>) => c.requiresAuthentication !== true
      ),
      fringes: budgeting.reducers.createUnauthenticatedFringesTableReducer({
        initialState: initialState.account.table.fringes,
        columns: FringesTable.Columns,
        actions: {
          responseFringeColors: actions.responseFringeColorsAction,
          request: actions.requestFringesAction,
          loading: actions.loadingFringesAction,
          response: actions.responseFringesAction,
          setSearch: actions.setFringesSearchAction
        }
      })
    })
  }),
  subaccount: combineReducers({
    id: redux.reducers.createSimplePayloadReducer<ID | null>({
      initialState: null,
      actions: { set: actions.account.setAccountIdAction }
    }),
    detail: redux.reducers.createDetailResponseReducer<
      Model.SubAccount,
      Omit<Redux.ModelDetailResponseActionMap<Model.SubAccount>, "updateInState">
    >({
      initialState: redux.initialState.initialDetailResponseState,
      actions: {
        request: actions.subAccount.requestSubAccountAction,
        loading: actions.subAccount.loadingSubAccountAction,
        response: actions.subAccount.responseSubAccountAction
      }
    }),
    table: budgeting.reducers.createUnauthenticatedSubAccountsTableReducer({
      initialState: initialState.account.table,
      actions: {
        request: actions.subAccount.requestAction,
        loading: actions.subAccount.loadingAction,
        response: actions.subAccount.responseAction,
        responseSubAccountUnits: actions.responseSubAccountUnitsAction,

        setSearch: actions.subAccount.setSearchAction
      },
      getModelRowLabel: (r: Tables.SubAccountRowData) => r.identifier || r.description,
      getPlaceholderRowLabel: (r: Tables.SubAccountRowData) => r.identifier || r.description,
      getModelRowChildren: (m: Model.SubAccount) => m.subaccounts,
      getModelRowName: "Sub Account",
      getPlaceholderRowName: "Sub Account",
      columns: filter(
        SubAccountsTable.Columns,
        (c: Table.Column<Tables.SubAccountRowData, Model.SubAccount>) => c.requiresAuthentication !== true
      ),
      fringes: budgeting.reducers.createUnauthenticatedFringesTableReducer({
        initialState: initialState.subaccount.table.fringes,
        columns: FringesTable.Columns,
        actions: {
          responseFringeColors: actions.responseFringeColorsAction,
          request: actions.requestFringesAction,
          loading: actions.loadingFringesAction,
          response: actions.responseFringesAction,
          setSearch: actions.setFringesSearchAction
        }
      })
    })
  })
});

const rootReducer: Redux.Reducer<Modules.Share.Store> = (
  state: Modules.Share.Store = initialState,
  action: Redux.Action
): Modules.Share.Store => {
  let newState = { ...state };
  if (action.type === actions.wipeStateAction.toString()) {
    newState = initialState;
  }
  return genericReducer(newState, action);
};

export default rootReducer;
