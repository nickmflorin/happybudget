import { combineReducers } from "redux";

import { redux, budgeting } from "lib";
import { SubAccountsTable, FringesTable, ActualsTable } from "components/tabling";

import * as actions from "./actions";
import initialState, { initialHeaderTemplatesState } from "./initialState";

const headerTemplatesRootReducer: Redux.Reducer<Modules.Budget.HeaderTemplatesStore> = (
  state: Modules.Budget.HeaderTemplatesStore = initialHeaderTemplatesState,
  action: Redux.Action
): Modules.Budget.HeaderTemplatesStore => {
  const listResponseReducer = redux.reducers.createModelListResponseReducer<
    Model.SimpleHeaderTemplate,
    Pick<
      Redux.ModelListResponseActionMap<Model.SimpleHeaderTemplate>,
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
  comments: redux.reducers.createCommentsListResponseReducer({
    actions: {
      request: actions.accounts.requestCommentsAction,
      response: actions.accounts.responseCommentsAction,
      loading: actions.accounts.loadingCommentsAction,
      submit: actions.accounts.createCommentAction,
      delete: actions.accounts.deleteCommentAction,
      edit: actions.accounts.updateCommentAction,
      updating: actions.accounts.updatingCommentAction,
      deleting: actions.accounts.deletingCommentAction,
      creating: actions.accounts.creatingCommentAction,
      replying: actions.accounts.replyingToCommentAction,
      removeFromState: actions.accounts.removeCommentFromStateAction,
      updateInState: actions.accounts.updateCommentInStateAction,
      addToState: actions.accounts.addCommentToStateAction
    }
  }),
  history: redux.reducers.createListResponseReducer<Model.HistoryEvent>({
    initialState: redux.initialState.initialModelListResponseState,
    actions: {
      response: actions.accounts.responseHistoryAction,
      loading: actions.accounts.loadingHistoryAction
    }
  }),
  commentsHistoryDrawerOpen: redux.reducers.createSimpleBooleanReducer({
    actions: { set: actions.setCommentsHistoryDrawerVisibilityAction }
  }),
  account: budgeting.reducers.createAccountDetailReducer({
    initialState: initialState.account,
    actions: {
      loading: actions.account.loadingAccountAction,
      response: actions.account.responseAccountAction,
      setId: actions.account.setAccountIdAction,
      tableChanged: actions.account.handleTableChangeEventAction,
      fringesTableChanged: actions.handleFringesTableChangeEventAction,
      updateInState: actions.account.updateInStateAction // Only used for post Markup create/update.
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
          setSearch: actions.account.setSearchAction
        },
        tableId: "account-subaccounts-table",
        columns: SubAccountsTable.Columns,
        fringesTableChangedAction: actions.handleFringesTableChangeEventAction,
        getModelRowChildren: (m: Model.SubAccount) => m.children,
        fringes: budgeting.reducers.createAuthenticatedFringesTableReducer({
          tableId: "fringes-table",
          initialState: initialState.account.table.fringes,
          columns: FringesTable.Columns,
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
      }),
      comments: redux.reducers.createCommentsListResponseReducer({
        actions: {
          request: actions.account.requestCommentsAction,
          response: actions.account.responseCommentsAction,
          loading: actions.account.loadingCommentsAction,
          submit: actions.account.createCommentAction,
          delete: actions.account.deleteCommentAction,
          edit: actions.account.updateCommentAction,
          updating: actions.account.updatingCommentAction,
          deleting: actions.account.deletingCommentAction,
          creating: actions.account.creatingCommentAction,
          replying: actions.account.replyingToCommentAction,
          removeFromState: actions.account.removeCommentFromStateAction,
          updateInState: actions.account.updateCommentInStateAction,
          addToState: actions.account.addCommentToStateAction
        }
      }),
      history: redux.reducers.createListResponseReducer<Model.HistoryEvent>({
        initialState: redux.initialState.initialModelListResponseState,
        actions: {
          response: actions.account.responseHistoryAction,
          loading: actions.account.loadingHistoryAction
        }
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
      fringesTableChanged: actions.handleFringesTableChangeEventAction,
      updateInState: actions.subAccount.updateInStateAction // Only used for post Markup create/update.
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
          setSearch: actions.subAccount.setSearchAction
        },
        columns: SubAccountsTable.Columns,
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
            clear: actions.clearFringesAction,
            loading: actions.loadingFringesAction,
            response: actions.responseFringesAction,
            saving: actions.savingFringesTableAction,
            addModelsToState: actions.addFringeModelsToStateAction,
            setSearch: actions.setFringesSearchAction
          }
        })
      }),
      comments: redux.reducers.createCommentsListResponseReducer({
        actions: {
          request: actions.subAccount.requestCommentsAction,
          response: actions.subAccount.responseCommentsAction,
          loading: actions.subAccount.loadingCommentsAction,
          submit: actions.subAccount.createCommentAction,
          delete: actions.subAccount.deleteCommentAction,
          edit: actions.subAccount.updateCommentAction,
          updating: actions.subAccount.updatingCommentAction,
          deleting: actions.subAccount.deletingCommentAction,
          creating: actions.subAccount.creatingCommentAction,
          replying: actions.subAccount.replyingToCommentAction,
          removeFromState: actions.subAccount.removeCommentFromStateAction,
          updateInState: actions.subAccount.updateCommentInStateAction,
          addToState: actions.subAccount.addCommentToStateAction
        }
      }),
      history: redux.reducers.createListResponseReducer<Model.HistoryEvent>({
        initialState: redux.initialState.initialModelListResponseState,
        actions: {
          response: actions.subAccount.responseHistoryAction,
          loading: actions.subAccount.loadingHistoryAction
        }
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
      setSearch: actions.actuals.setSearchAction
    },
    columns: ActualsTable.Columns,
    subAccountsTree: redux.reducers.createModelListResponseReducer<
      Model.SubAccountTreeNode,
      Pick<
        Redux.ModelListResponseActionMap<Model.SubAccountTreeNode>,
        "loading" | "response" | "restoreSearchCache" | "setSearch"
      >
    >({
      initialState: redux.initialState.initialModelListResponseState,
      actions: {
        loading: actions.actuals.loadingSubAccountsTreeAction,
        response: actions.actuals.responseSubAccountsTreeAction,
        restoreSearchCache: actions.actuals.restoreSubAccountsTreeSearchCacheAction,
        setSearch: actions.actuals.setSubAccountsTreeSearchAction
      }
    })
  }),
  headerTemplates: headerTemplatesRootReducer
});

const rootReducer: Redux.Reducer<Modules.Budget.Store> = (
  state: Modules.Budget.Store = initialState,
  action: Redux.Action
): Modules.Budget.Store => {
  let newState = { ...state };
  if (action.type === actions.wipeStateAction.toString()) {
    newState = initialState;
  }
  return genericReducer(newState, action);
};

export default rootReducer;
