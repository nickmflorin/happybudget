import { combineReducers } from "redux";
import { filter, intersection } from "lodash";

import { redux, budgeting } from "lib";
import { SubAccountsTable, FringesTable } from "components/tabling";

import * as actions from "./actions";
import initialState from "./initialState";

const genericReducer = combineReducers({
  id: redux.reducers.createSimplePayloadReducer<number | null>({
    initialState: null,
    actions: { set: actions.setTemplateIdAction }
  }),
  detail: redux.reducers.createDetailResponseReducer<Model.Template>({
    initialState: redux.initialState.initialDetailResponseState,
    actions: {
      loading: actions.loadingTemplateAction,
      response: actions.responseTemplateAction,
      updateInState: actions.updateTemplateInStateAction
    }
  }),
  account: budgeting.reducers.createAccountDetailReducer({
    initialState: initialState.account,
    actions: {
      loading: actions.account.loadingAccountAction,
      response: actions.account.responseAccountAction,
      setId: actions.account.setAccountIdAction,
      updateInState: actions.account.updateInStateAction
    },
    reducers: {
      table: budgeting.reducers.createAuthenticatedSubAccountsTableReducer({
        tableId: "account-subaccounts-table",
        initialState: initialState.account.table,
        actions: {
          tableChanged: actions.account.handleTableChangeEventAction,
          loading: actions.account.loadingAction,
          response: actions.account.responseAction,
          responseSubAccountUnits: actions.responseSubAccountUnitsAction,
          saving: actions.account.savingTableAction,
          addModelsToState: actions.account.addModelsToStateAction,
          setSearch: actions.account.setSearchAction,
          clear: actions.account.clearAction
        },
        getModelRowChildren: (m: Model.SubAccount) => m.children,
        columns: filter(
          SubAccountsTable.Columns as Table.Column<Tables.SubAccountRowData, Model.SubAccount>[],
          (c: Table.Column<Tables.SubAccountRowData, Model.SubAccount>) =>
            intersection([c.field, c.colId], ["variance", "contact", "actual"]).length === 0
        ),
        fringesTableChangedAction: actions.handleFringesTableChangeEventAction,
        fringes: budgeting.reducers.createAuthenticatedFringesTableReducer({
          tableId: "fringes-table",
          initialState: initialState.account.table.fringes,
          columns: FringesTable.Columns,
          actions: {
            responseFringeColors: actions.responseFringeColorsAction,
            tableChanged: actions.handleFringesTableChangeEventAction,
            request: actions.requestFringesAction,
            loading: actions.loadingFringesAction,
            response: actions.responseFringesAction,
            saving: actions.savingFringesTableAction,
            addModelsToState: actions.addFringeModelsToStateAction,
            setSearch: actions.setFringesSearchAction,
            clear: actions.clearFringesAction
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
      response: actions.subAccount.responseSubAccountAction,
      updateInState: actions.subAccount.updateInStateAction
    },
    reducers: {
      table: budgeting.reducers.createAuthenticatedSubAccountsTableReducer({
        tableId: "subaccount-subaccounts-table",
        initialState: initialState.subaccount.table,
        actions: {
          tableChanged: actions.subAccount.handleTableChangeEventAction,
          responseSubAccountUnits: actions.responseSubAccountUnitsAction,
          loading: actions.subAccount.loadingAction,
          response: actions.subAccount.responseAction,
          saving: actions.subAccount.savingTableAction,
          addModelsToState: actions.subAccount.addModelsToStateAction,
          setSearch: actions.subAccount.setSearchAction,
          clear: actions.subAccount.clearAction
        },
        columns: filter(
          SubAccountsTable.Columns as Table.Column<Tables.SubAccountRowData, Model.SubAccount>[],
          (c: Table.Column<Tables.SubAccountRowData, Model.SubAccount>) =>
            intersection([c.field, c.colId], ["variance", "contact", "actual"]).length === 0
        ),
        getModelRowChildren: (m: Model.SubAccount) => m.children,
        fringesTableChangedAction: actions.handleFringesTableChangeEventAction,
        fringes: budgeting.reducers.createAuthenticatedFringesTableReducer({
          tableId: "fringes-table",
          initialState: initialState.subaccount.table.fringes,
          columns: FringesTable.Columns,
          actions: {
            responseFringeColors: actions.responseFringeColorsAction,
            tableChanged: actions.handleFringesTableChangeEventAction,
            request: actions.requestFringesAction,
            loading: actions.loadingFringesAction,
            response: actions.responseFringesAction,
            saving: actions.savingFringesTableAction,
            addModelsToState: actions.addFringeModelsToStateAction,
            setSearch: actions.setFringesSearchAction,
            clear: actions.clearFringesAction
          }
        })
      })
    }
  })
});

const rootReducer: Redux.Reducer<Modules.Template.Store> = (
  state: Modules.Template.Store = initialState,
  action: Redux.Action
): Modules.Template.Store => {
  return genericReducer(state, action);
};

export default rootReducer;
