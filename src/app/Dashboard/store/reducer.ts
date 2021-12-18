import { combineReducers } from "redux";
import { redux, tabling } from "lib";
import { ContactsTable } from "tabling";

import initialState from "./initialState";
import * as actions from "./actions";

const rootReducer: Redux.Reducer<Modules.Dashboard.Store> = combineReducers({
  contacts: tabling.reducers.createAuthenticatedTableReducer<
    Tables.ContactRowData,
    Model.Contact,
    Tables.ContactTableStore,
    Tables.ContactTableContext
  >({
    columns: ContactsTable.Columns,
    clearOn: [actions.requestContactsAction],
    actions: {
      tableChanged: actions.handleContactsTableChangeEventAction,
      loading: actions.loadingContactsAction,
      response: actions.responseContactsAction,
      saving: actions.savingContactsTableAction,
      addModelsToState: actions.addContactModelsToStateAction,
      setSearch: actions.setContactsSearchAction,
      updateRowsInState: actions.updateContactRowsInStateAction
    },
    initialState: redux.initialState.initialTableState
  }),
  templates: redux.reducers.createAuthenticatedModelListResponseReducer<
    Model.SimpleTemplate,
    null,
    Tables.ContactTableContext,
    Redux.AuthenticatedModelListResponseStore<Model.SimpleTemplate>
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
      setPagination: actions.setTemplatesPaginationAction,
      updateOrdering: actions.updateTemplatesOrderingAction
    }
  }),
  community: redux.reducers.createAuthenticatedModelListResponseReducer<
    Model.SimpleTemplate,
    null,
    Tables.ContactTableContext,
    Redux.AuthenticatedModelListResponseStore<Model.SimpleTemplate>
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
      setPagination: actions.setCommunityTemplatesPaginationAction,
      updateOrdering: actions.updateCommunityTemplatesOrderingAction
    }
  }),
  budgets: redux.reducers.createAuthenticatedModelListResponseReducer<
    Model.SimpleBudget,
    null,
    Tables.ContactTableContext,
    Redux.AuthenticatedModelListResponseStore<Model.SimpleBudget>
  >({
    initialState: initialState.budgets,
    actions: {
      request: actions.requestBudgetsAction,
      response: actions.responseBudgetsAction,
      loading: actions.loadingBudgetsAction,
      setSearch: actions.setBudgetsSearchAction,
      addToState: actions.addBudgetToStateAction,
      removeFromState: actions.removeBudgetFromStateAction,
      updateInState: actions.updateBudgetInStateAction,
      setPagination: actions.setBudgetsPaginationAction,
      updateOrdering: actions.updateBudgetsOrderingAction
    }
  })
});

export default rootReducer;
