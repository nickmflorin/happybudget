import { combineReducers } from "redux";

import { redux, budgeting } from "lib";
import { SubAccountsTable, FringesTable, ActualsTable, AccountsTable } from "components/tabling";

import * as actions from "./actions";
import initialState, { initialHeaderTemplatesState } from "./initialState";

const SubAccountColumns = SubAccountsTable.Columns;
const ActualColumns = ActualsTable.Columns;
const AccountColumns = AccountsTable.Columns;
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

const analysisReducer: Redux.Reducer<Modules.Budget.AnalysisStore> = (
  state: Modules.Budget.AnalysisStore = initialState.analysis,
  action: Redux.Action<any>
): Modules.Budget.AnalysisStore => {
  if (action.type === actions.analysis.loadingAction.toString()) {
    return { ...state, loading: action.payload };
  } else if (action.type === actions.analysis.requestAction.toString()) {
    return { ...state, responseWasReceived: false };
  } else if (action.type === actions.analysis.responseAction.toString()) {
    const response: { groups: Http.ListResponse<Model.Group>; accounts: Http.ListResponse<Model.Account> } =
      action.payload;
    return {
      ...state,
      responseWasReceived: true,
      accounts: response.accounts,
      groups: response.groups
    };
  }
  return state;
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
  analysis: analysisReducer,
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
        clearOn: [actions.account.requestAction, actions.account.setAccountIdAction],
        actions: {
          tableChanged: actions.account.handleTableChangeEventAction,
          loading: actions.account.loadingAction,
          response: actions.account.responseAction,
          responseSubAccountUnits: actions.responseSubAccountUnitsAction,
          saving: actions.account.savingTableAction,
          addModelsToState: actions.account.addModelsToStateAction,
          updateRowsInState: actions.account.updateRowsInStateAction,
          setSearch: actions.account.setSearchAction
        },
        columns: SubAccountColumns,
        getModelRowChildren: (m: Model.SubAccount) => m.children,
        fringes: budgeting.reducers.createAuthenticatedFringesTableReducer({
          initialState: initialState.account.table.fringes,
          columns: FringesColumns,
          clearOn: [actions.requestFringesAction],
          actions: {
            responseFringeColors: actions.responseFringeColorsAction,
            tableChanged: actions.handleFringesTableChangeEventAction,
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
  accounts: budgeting.reducers.createAuthenticatedAccountsTableReducer({
    initialState: initialState.account.table,
    clearOn: [actions.accounts.requestAction, actions.setBudgetIdAction],
    actions: {
      tableChanged: actions.accounts.handleTableChangeEventAction,
      loading: actions.accounts.loadingAction,
      response: actions.accounts.responseAction,
      saving: actions.accounts.savingTableAction,
      addModelsToState: actions.accounts.addModelsToStateAction,
      setSearch: actions.accounts.setSearchAction
    },
    columns: AccountColumns,
    getModelRowChildren: (m: Model.Account) => m.children
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
        initialState: initialState.subaccount.table,
        clearOn: [actions.subAccount.requestAction, actions.subAccount.setSubAccountIdAction],
        actions: {
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
          initialState: initialState.subaccount.table.fringes,
          columns: FringesColumns,
          clearOn: [actions.requestFringesAction],
          actions: {
            responseFringeColors: actions.responseFringeColorsAction,
            tableChanged: actions.handleFringesTableChangeEventAction,
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
    initialState: initialState.actuals,
    clearOn: [actions.actuals.requestAction, actions.setBudgetIdAction],
    actions: {
      tableChanged: actions.actuals.handleTableChangeEventAction,
      loading: actions.actuals.loadingAction,
      response: actions.actuals.responseAction,
      saving: actions.actuals.savingTableAction,
      addModelsToState: actions.actuals.addModelsToStateAction,
      setSearch: actions.actuals.setSearchAction,
      responseActualTypes: actions.actuals.responseActualTypesAction,
      updateRowsInState: actions.actuals.updateRowsInStateAction
    },
    columns: ActualColumns,
    owners: redux.reducers.createAuthenticatedModelListResponseReducer<
      Model.ActualOwner,
      Pick<Redux.AuthenticatedModelListResponseActionMap<Model.ActualOwner>, "loading" | "response" | "setSearch">
    >({
      initialState: redux.initialState.initialAuthenticatedModelListResponseState,
      actions: {
        loading: actions.actuals.loadingActualOwnersAction,
        response: actions.actuals.responseActualOwnersAction,
        setSearch: actions.actuals.setActualOwnersSearchAction
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
