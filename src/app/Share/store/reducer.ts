import { combineReducers } from "redux";
import { filter } from "lodash";

import { redux, budgeting, tabling } from "lib";
import { SubAccountsTable, FringesTable } from "tabling";

import * as actions from "./actions";
import initialState from "./initialState";

const genericReducer = combineReducers({
  detail: redux.reducers.createDetailResponseReducer<Model.Budget>({
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
      response: actions.account.responseAccountAction
    },
    reducers: {
      table: budgeting.reducers.createUnauthenticatedSubAccountsTableReducer({
        initialState: initialState.account.table,
        clearOn: [
          {
            action: actions.account.requestAction,
            payload: (p: Redux.TableRequestPayload) => !redux.typeguards.isListRequestIdsPayload(p)
          }
        ],
        actions: {
          loading: actions.account.loadingAction,
          response: actions.account.responseAction,
          responseSubAccountUnits: actions.responseSubAccountUnitsAction,
          setSearch: actions.account.setSearchAction
        },
        getModelRowChildren: (m: Model.SubAccount) => m.children,
        columns: filter(
          SubAccountsTable.Columns as Table.Column<Tables.SubAccountRowData, Model.SubAccount>[],
          (c: Table.Column<Tables.SubAccountRowData, Model.SubAccount>) =>
            tabling.typeguards.isModelColumn(c) &&
            ((!tabling.typeguards.isFakeColumn(c) && c.requiresAuthentication !== true) ||
              tabling.typeguards.isFakeColumn(c))
        ) as Table.ModelColumn<Tables.SubAccountRowData, Model.SubAccount>[],
        fringes: budgeting.reducers.createUnauthenticatedFringesTableReducer({
          initialState: initialState.account.table.fringes,
          columns: filter(FringesTable.Columns, (c: Table.Column<Tables.FringeRowData, Model.Fringe>) =>
            tabling.typeguards.isModelColumn(c)
          ) as Table.ModelColumn<Tables.FringeRowData, Model.Fringe>[],
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
  subaccount: budgeting.reducers.createSubAccountDetailReducer({
    initialState: initialState.subaccount,
    actions: {
      loading: actions.subAccount.loadingSubAccountAction,
      response: actions.subAccount.responseSubAccountAction
    },
    reducers: {
      table: budgeting.reducers.createUnauthenticatedSubAccountsTableReducer({
        initialState: initialState.account.table,
        clearOn: [
          {
            action: actions.subAccount.requestAction,
            payload: (p: Redux.TableRequestPayload) => !redux.typeguards.isListRequestIdsPayload(p)
          }
        ],
        actions: {
          loading: actions.subAccount.loadingAction,
          response: actions.subAccount.responseAction,
          responseSubAccountUnits: actions.responseSubAccountUnitsAction,
          setSearch: actions.subAccount.setSearchAction
        },
        getModelRowChildren: (m: Model.SubAccount) => m.children,
        columns: filter(
          SubAccountsTable.Columns as Table.Column<Tables.SubAccountRowData, Model.SubAccount>[],
          (c: Table.Column<Tables.SubAccountRowData, Model.SubAccount>) =>
            tabling.typeguards.isModelColumn(c) &&
            ((!tabling.typeguards.isFakeColumn(c) && c.requiresAuthentication !== true) ||
              tabling.typeguards.isFakeColumn(c))
        ) as Table.ModelColumn<Tables.SubAccountRowData, Model.SubAccount>[],
        fringes: budgeting.reducers.createUnauthenticatedFringesTableReducer({
          initialState: initialState.subaccount.table.fringes,
          columns: filter(FringesTable.Columns, (c: Table.Column<Tables.FringeRowData, Model.Fringe>) =>
            tabling.typeguards.isModelColumn(c)
          ) as Table.ModelColumn<Tables.FringeRowData, Model.Fringe>[],
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

const rootReducer: Redux.Reducer<Modules.Share.Store> = (
  state: Modules.Share.Store = initialState,
  action: Redux.Action
): Modules.Share.Store => {
  return genericReducer(state, action);
};

export default rootReducer;
