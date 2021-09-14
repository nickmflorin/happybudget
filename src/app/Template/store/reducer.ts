import { combineReducers } from "redux";
import { filter } from "lodash";

import { redux, budgeting } from "lib";
import { SubAccountsTable, FringesTable } from "components/tabling";

import * as actions from "./actions";
import initialState from "./initialState";
import { includes } from "lodash";

const genericReducer = combineReducers({
  id: redux.reducers.createSimplePayloadReducer<ID | null>({
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
  autoIndex: redux.reducers.createSimpleBooleanReducer({
    actions: { set: actions.setTemplateAutoIndex }
  }),
  account: budgeting.reducers.createAccountDetailReducer({
    initialState: initialState.account,
    actions: {
      loading: actions.account.loadingAccountAction,
      response: actions.account.responseAccountAction,
      setId: actions.account.setAccountIdAction,
      tableChanged: actions.account.handleTableChangeEventAction,
      fringesTableChanged: actions.handleFringesTableChangeEventAction
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
        getModelRowLabel: (r: Tables.SubAccountRowData) => r.identifier || r.description,
        getPlaceholderRowLabel: (r: Tables.SubAccountRowData) => r.identifier || r.description,
        getModelRowChildren: (m: Model.SubAccount) => m.subaccounts,
        getModelRowName: "Sub Account",
        getPlaceholderRowName: "Sub Account",
        columns: filter(
          SubAccountsTable.Columns,
          (c: Table.Column<Tables.SubAccountRowData, Model.SubAccount>) =>
            !includes(["contact", "actual", "variance"], c.field)
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
      tableChanged: actions.subAccount.handleTableChangeEventAction,
      fringesTableChanged: actions.handleFringesTableChangeEventAction
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
          SubAccountsTable.Columns,
          (c: Table.Column<Tables.SubAccountRowData, Model.SubAccount>) =>
            !includes(["contact", "actual", "variance"], c.field)
        ),
        getModelRowLabel: (r: Tables.SubAccountRowData) => r.identifier || r.description,
        getPlaceholderRowLabel: (r: Tables.SubAccountRowData) => r.identifier || r.description,
        getModelRowChildren: (m: Model.SubAccount) => m.subaccounts,
        getModelRowName: "Sub Account",
        getPlaceholderRowName: "Sub Account",
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
  let newState = { ...state };
  if (action.type === actions.wipeStateAction.toString()) {
    newState = initialState;
  }
  return genericReducer(newState, action);
};

export default rootReducer;
