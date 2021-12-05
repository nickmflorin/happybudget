import { combineReducers } from "redux";
import { redux, tabling } from "lib";
import { ContactsTable } from "components/tabling";

import * as actions from "./actions";

const rootReducer: Redux.Reducer<Modules.Dashboard.Store> = combineReducers({
  contacts: tabling.reducers.createAuthenticatedTableReducer<
    Tables.ContactRowData,
    Model.Contact,
    Tables.ContactTableStore
  >({
    tableId: "contacts-table",
    columns: ContactsTable.Columns,
    actions: {
      tableChanged: actions.handleContactsTableChangeEventAction,
      request: actions.requestContactsAction,
      loading: actions.loadingContactsAction,
      response: actions.responseContactsAction,
      saving: actions.savingContactsTableAction,
      addModelsToState: actions.addContactModelsToStateAction,
      setSearch: actions.setContactsSearchAction,
      clear: actions.clearContactsAction,
      updateRowsInState: actions.updateContactRowsInStateAction
    },
    initialState: redux.initialState.initialTableState
  }),
  templates: redux.reducers.createAuthenticatedModelListResponseReducer<
    Model.SimpleTemplate,
    Omit<Redux.AuthenticatedModelListResponseActionMap<Model.SimpleTemplate>, "updating" | "deleting" | "creating">
  >({
    initialState: redux.initialState.initialAuthenticatedModelListResponseState,
    actions: {
      request: actions.requestTemplatesAction,
      response: actions.responseTemplatesAction,
      loading: actions.loadingTemplatesAction,
      setSearch: actions.setTemplatesSearchAction,
      addToState: actions.addTemplateToStateAction,
      removeFromState: actions.removeTemplateFromStateAction,
      updateInState: actions.updateTemplateInStateAction,
      setPagination: actions.setTemplatesPaginationAction
    }
  }),
  community: redux.reducers.createAuthenticatedModelListResponseReducer<
    Model.SimpleTemplate,
    Omit<Redux.AuthenticatedModelListResponseActionMap<Model.SimpleTemplate>, "updating" | "deleting" | "creating">
  >({
    initialState: redux.initialState.initialAuthenticatedModelListResponseState,
    actions: {
      request: actions.requestCommunityTemplatesAction,
      response: actions.responseCommunityTemplatesAction,
      loading: actions.loadingCommunityTemplatesAction,
      setSearch: actions.setCommunityTemplatesSearchAction,
      addToState: actions.addCommunityTemplateToStateAction,
      removeFromState: actions.removeCommunityTemplateFromStateAction,
      updateInState: actions.updateCommunityTemplateInStateAction,
      setPagination: actions.setCommunityTemplatesPaginationAction
    }
  }),
  budgets: redux.reducers.createAuthenticatedModelListResponseReducer<
    Model.SimpleBudget,
    Omit<Redux.AuthenticatedModelListResponseActionMap<Model.SimpleBudget>, "updating" | "deleting" | "creating">
  >({
    initialState: redux.initialState.initialAuthenticatedModelListResponseState,
    actions: {
      request: actions.requestBudgetsAction,
      response: actions.responseBudgetsAction,
      loading: actions.loadingBudgetsAction,
      setSearch: actions.setBudgetsSearchAction,
      addToState: actions.addBudgetToStateAction,
      removeFromState: actions.removeBudgetFromStateAction,
      updateInState: actions.updateBudgetInStateAction,
      setPagination: actions.setBudgetsPaginationAction
    }
  })
});

export default rootReducer;
