import { combineReducers } from "redux";

import { redux, budgeting } from "lib";
import { SubAccountsTable, FringesTable, ActualsTable } from "components/tabling";

import * as actions from "./actions";
import initialState, { initialHeaderTemplatesState } from "./initialState";

const SubAccountColumns = SubAccountsTable.Columns;
const ActualColumns = ActualsTable.Columns;
const FringesColumns = FringesTable.Columns;

const headerTemplatesRootReducer: Redux.Reducer<Modules.Budget.HeaderTemplatesStore> = (
  state: Modules.Budget.HeaderTemplatesStore = initialHeaderTemplatesState,
  action: Redux.Action
): Modules.Budget.HeaderTemplatesStore => {
  const listResponseReducer = redux.reducers.createAuthenticatedModelListResponseReducer<
    Model.SimpleHeaderTemplate,
    Pick<
      Redux.AuthenticatedModelListResponseActionMap<Model.SimpleHeaderTemplate>,
      "request" | "loading" | "response" | "addToState" | "removeFromState"
    >,
    Modules.Budget.HeaderTemplatesStore
  >({
    initialState: initialHeaderTemplatesState,
    actions: {
      request: actions.pdf.requestHeaderTemplatesAction,
      loading: actions.pdf.loadingHeaderTemplatesAction,
      response: actions.pdf.responseHeaderTemplatesAction,
      addToState: actions.pdf.addHeaderTemplateToStateAction,
      removeFromState: actions.pdf.removeHeaderTemplateFromStateAction
    }
  });
  let newState = listResponseReducer(state, action);
  if (action.type === actions.pdf.displayHeaderTemplateAction.toString()) {
    const template: Model.HeaderTemplate = action.payload;
    newState = { ...newState, displayedTemplate: template };
  } else if (action.type === actions.pdf.loadHeaderTemplateAction.toString()) {
    newState = { ...newState, loadingDetail: action.payload };
  } else if (action.type === actions.pdf.clearHeaderTemplateAction.toString()) {
    newState = { ...newState, displayedTemplate: null };
  }
  return newState;
};

const genericReducer = combineReducers({
  id: redux.reducers.createSimplePayloadReducer<number | null>({
    initialState: null,
    actions: { set: actions.setBudgetIdAction }
  }),
  detail: redux.reducers.createDetailResponseReducer<Model.Budget>({
    initialState: redux.initialState.initialDetailResponseState,
    actions: {
      loading: actions.loadingBudgetAction,
      response: actions.responseBudgetAction,
      updateInState: actions.updateBudgetInStateAction
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
        initialState: initialState.account.table,
        actions: {
          clear: actions.account.clearAction,
          tableChanged: actions.account.handleTableChangeEventAction,
          loading: actions.account.loadingAction,
          response: actions.account.responseAction,
          responseSubAccountUnits: actions.responseSubAccountUnitsAction,
          saving: actions.account.savingTableAction,
          addModelsToState: actions.account.addModelsToStateAction,
          updateRowsInState: actions.account.updateRowsInStateAction,
          setSearch: actions.account.setSearchAction
        },
        tableId: "account-subaccounts-table",
        columns: SubAccountColumns,
        getModelRowChildren: (m: Model.SubAccount) => m.children,
        fringes: budgeting.reducers.createAuthenticatedFringesTableReducer({
          tableId: "fringes-table",
          initialState: initialState.account.table.fringes,
          columns: FringesColumns,
          actions: {
            clear: actions.clearFringesAction,
            responseFringeColors: actions.responseFringeColorsAction,
            tableChanged: actions.handleFringesTableChangeEventAction,
            request: actions.requestFringesAction,
            loading: actions.loadingFringesAction,
            response: actions.responseFringesAction,
            saving: actions.savingFringesTableAction,
            addModelsToState: actions.addFringeModelsToStateAction,
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
      response: actions.subAccount.responseSubAccountAction,
      updateInState: actions.subAccount.updateInStateAction
    },
    reducers: {
      table: budgeting.reducers.createAuthenticatedSubAccountsTableReducer({
        tableId: "subaccount-subaccounts-table",
        initialState: initialState.subaccount.table,
        actions: {
          clear: actions.subAccount.clearAction,
          tableChanged: actions.subAccount.handleTableChangeEventAction,
          responseSubAccountUnits: actions.responseSubAccountUnitsAction,
          loading: actions.subAccount.loadingAction,
          response: actions.subAccount.responseAction,
          saving: actions.subAccount.savingTableAction,
          addModelsToState: actions.subAccount.addModelsToStateAction,
          updateRowsInState: actions.subAccount.updateRowsInStateAction,
          setSearch: actions.subAccount.setSearchAction
        },
        columns: SubAccountColumns,
        getModelRowChildren: (m: Model.SubAccount) => m.children,
        fringes: budgeting.reducers.createAuthenticatedFringesTableReducer({
          tableId: "fringes-table",
          initialState: initialState.subaccount.table.fringes,
          columns: FringesColumns,
          actions: {
            responseFringeColors: actions.responseFringeColorsAction,
            tableChanged: actions.handleFringesTableChangeEventAction,
            request: actions.requestFringesAction,
            clear: actions.clearFringesAction,
            loading: actions.loadingFringesAction,
            response: actions.responseFringesAction,
            saving: actions.savingFringesTableAction,
            addModelsToState: actions.addFringeModelsToStateAction,
            setSearch: actions.setFringesSearchAction
          }
        })
      })
    }
  }),
  actuals: budgeting.reducers.createAuthenticatedActualsTableReducer({
    tableId: "actuals-table",
    initialState: initialState.actuals,
    actions: {
      clear: actions.actuals.clearAction,
      tableChanged: actions.actuals.handleTableChangeEventAction,
      request: actions.actuals.requestAction,
      loading: actions.actuals.loadingAction,
      response: actions.actuals.responseAction,
      saving: actions.actuals.savingTableAction,
      addModelsToState: actions.actuals.addModelsToStateAction,
      setSearch: actions.actuals.setSearchAction,
      responseActualTypes: actions.actuals.responseActualTypesAction,
      updateRowsInState: actions.actuals.updateRowsInStateAction
    },
    columns: ActualColumns,
    ownerTree: redux.reducers.createAuthenticatedModelListResponseReducer<
      Model.OwnerTreeNode,
      Pick<Redux.AuthenticatedModelListResponseActionMap<Model.OwnerTreeNode>, "loading" | "response" | "setSearch">
    >({
      initialState: redux.initialState.initialAuthenticatedModelListResponseState,
      actions: {
        loading: actions.actuals.loadingOwnerTreeAction,
        response: actions.actuals.responseOwnerTreeAction,
        setSearch: actions.actuals.setOwnerTreeSearchAction
      }
    })
  }),
  headerTemplates: headerTemplatesRootReducer
});

const rootReducer: Redux.Reducer<Modules.Budget.Store> = (
  state: Modules.Budget.Store = initialState,
  action: Redux.Action
): Modules.Budget.Store => {
  return genericReducer(state, action);
};

export default rootReducer;
