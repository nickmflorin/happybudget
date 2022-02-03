import { combineReducers } from "redux";

import { redux, budgeting, tabling } from "lib";
import { SubAccountsTable, FringesTable, ActualsTable, AccountsTable } from "tabling";

import * as actions from "../actions/budget";
import { initialBudgetState } from "../initialState";

const SubAccountColumns = tabling.columns.filterModelColumns(SubAccountsTable.Columns);
const ActualColumns = tabling.columns.filterModelColumns(ActualsTable.Columns);
const AccountColumns = tabling.columns.filterModelColumns(AccountsTable.Columns);
const FringesColumns = tabling.columns.filterModelColumns(FringesTable.Columns);

const headerTemplatesRootReducer: Redux.Reducer<Modules.Budget.HeaderTemplatesStore> = (
  state: Modules.Budget.HeaderTemplatesStore = initialBudgetState.headerTemplates,
  action: Redux.Action
): Modules.Budget.HeaderTemplatesStore => {
  const listResponseReducer = redux.reducers.createAuthenticatedModelListResponseReducer<
    Model.SimpleHeaderTemplate,
    null,
    Table.Context,
    Modules.Budget.HeaderTemplatesStore
  >({
    initialState: initialBudgetState.headerTemplates,
    actions: {
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
  state: Modules.Budget.AnalysisStore = initialBudgetState.analysis,
  action: Redux.Action
): Modules.Budget.AnalysisStore => {
  if (action.type === actions.analysis.loadingAction.toString()) {
    return { ...state, loading: action.payload };
  } else if (action.type === actions.analysis.requestAction.toString()) {
    return { ...state, responseWasReceived: false };
  } else if (action.type === actions.analysis.responseAction.toString()) {
    const response: {
      groups: Http.ListResponse<Model.Group>;
      accounts: Http.ListResponse<Model.Account>;
      actuals: Http.ListResponse<Model.Actual>;
    } = action.payload;
    return {
      ...state,
      responseWasReceived: true,
      accounts: response.accounts,
      groups: response.groups,
      actuals: response.actuals
    };
  }
  return state;
};

const genericReducer = combineReducers({
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
    initialState: initialBudgetState.account,
    actions: {
      loading: actions.account.loadingAccountAction,
      response: actions.account.responseAccountAction,
      updateInState: actions.account.updateInStateAction
    },
    reducers: {
      table: budgeting.reducers.createAuthenticatedSubAccountsTableReducer({
        initialState: initialBudgetState.account.table,
        clearOn: [
          {
            action: actions.account.requestAction,
            payload: (p: Redux.TableRequestPayload) => !redux.typeguards.isListRequestIdsPayload(p)
          }
        ],
        actions: {
          tableChanged: actions.account.handleTableChangeEventAction,
          loading: actions.account.loadingAction,
          response: actions.account.responseAction,
          responseSubAccountUnits: actions.responseSubAccountUnitsAction,
          addModelsToState: actions.account.addModelsToStateAction,
          updateRowsInState: actions.account.updateRowsInStateAction,
          setSearch: actions.account.setSearchAction
        },
        columns: SubAccountColumns,
        getModelRowChildren: (m: Model.SubAccount) => m.children,
        fringes: budgeting.reducers.createAuthenticatedFringesTableReducer({
          initialState: initialBudgetState.account.table.fringes,
          columns: FringesColumns,
          clearOn: [actions.requestFringesAction],
          actions: {
            responseFringeColors: actions.responseFringeColorsAction,
            tableChanged: actions.handleFringesTableChangeEventAction,
            loading: actions.loadingFringesAction,
            response: actions.responseFringesAction,
            addModelsToState: actions.addFringeModelsToStateAction,
            setSearch: actions.setFringesSearchAction
          }
        })
      })
    }
  }),
  accounts: budgeting.reducers.createAuthenticatedAccountsTableReducer({
    initialState: initialBudgetState.account.table,
    clearOn: [
      {
        action: actions.accounts.requestAction,
        payload: (p: Redux.TableRequestPayload) => !redux.typeguards.isListRequestIdsPayload(p)
      }
    ],

    actions: {
      tableChanged: actions.accounts.handleTableChangeEventAction,
      loading: actions.accounts.loadingAction,
      response: actions.accounts.responseAction,
      addModelsToState: actions.accounts.addModelsToStateAction,
      setSearch: actions.accounts.setSearchAction
    },
    columns: AccountColumns,
    getModelRowChildren: (m: Model.Account) => m.children
  }),
  subaccount: budgeting.reducers.createSubAccountDetailReducer({
    initialState: initialBudgetState.subaccount,
    actions: {
      loading: actions.subAccount.loadingSubAccountAction,
      response: actions.subAccount.responseSubAccountAction,
      updateInState: actions.subAccount.updateInStateAction
    },
    reducers: {
      table: budgeting.reducers.createAuthenticatedSubAccountsTableReducer({
        initialState: initialBudgetState.subaccount.table,
        clearOn: [
          {
            action: actions.subAccount.requestAction,
            payload: (p: Redux.TableRequestPayload) => !redux.typeguards.isListRequestIdsPayload(p)
          }
        ],
        actions: {
          tableChanged: actions.subAccount.handleTableChangeEventAction,
          responseSubAccountUnits: actions.responseSubAccountUnitsAction,
          loading: actions.subAccount.loadingAction,
          response: actions.subAccount.responseAction,
          addModelsToState: actions.subAccount.addModelsToStateAction,
          updateRowsInState: actions.subAccount.updateRowsInStateAction,
          setSearch: actions.subAccount.setSearchAction
        },
        columns: SubAccountColumns,
        getModelRowChildren: (m: Model.SubAccount) => m.children,
        fringes: budgeting.reducers.createAuthenticatedFringesTableReducer({
          initialState: initialBudgetState.subaccount.table.fringes,
          columns: FringesColumns,
          clearOn: [actions.requestFringesAction],
          actions: {
            responseFringeColors: actions.responseFringeColorsAction,
            tableChanged: actions.handleFringesTableChangeEventAction,
            loading: actions.loadingFringesAction,
            response: actions.responseFringesAction,
            addModelsToState: actions.addFringeModelsToStateAction,
            setSearch: actions.setFringesSearchAction
          }
        })
      })
    }
  }),
  actuals: budgeting.reducers.createAuthenticatedActualsTableReducer({
    initialState: initialBudgetState.actuals,
    clearOn: [actions.actuals.requestAction],
    actions: {
      tableChanged: actions.actuals.handleTableChangeEventAction,
      loading: actions.actuals.loadingAction,
      response: actions.actuals.responseAction,
      addModelsToState: actions.actuals.addModelsToStateAction,
      setSearch: actions.actuals.setSearchAction,
      responseActualTypes: actions.actuals.responseActualTypesAction,
      updateRowsInState: actions.actuals.updateRowsInStateAction
    },
    columns: ActualColumns,
    owners: redux.reducers.createAuthenticatedModelListResponseReducer<
      Model.ActualOwner,
      null,
      Tables.ActualTableContext,
      Redux.AuthenticatedModelListResponseStore<Model.ActualOwner>
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
  state: Modules.Budget.Store = initialBudgetState,
  action: Redux.Action
): Modules.Budget.Store => {
  return genericReducer(state, action);
};

export default rootReducer;
