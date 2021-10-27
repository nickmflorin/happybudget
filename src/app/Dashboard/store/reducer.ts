import { combineReducers } from "redux";
import { redux } from "lib";
import * as actions from "./actions";

const rootReducer: Redux.Reducer<Modules.Dashboard.Store> = combineReducers({
  templates: redux.reducers.createAuthenticatedModelListResponseReducer<
    Model.SimpleTemplate,
    Omit<
      Redux.AuthenticatedModelListResponseActionMap<Model.SimpleTemplate>,
      "restoreSearchCache" | "updating" | "deleting" | "creating"
    >
  >({
    initialState: redux.initialState.initialAuthenticatedModelListResponseState,
    actions: {
      request: actions.requestTemplatesAction,
      response: actions.responseTemplatesAction,
      loading: actions.loadingTemplatesAction,
      setSearch: actions.setTemplatesSearchAction,
      addToState: actions.addTemplateToStateAction,
      removeFromState: actions.removeTemplateFromStateAction,
      updateInState: actions.updateTemplateInStateAction
    }
  }),
  community: redux.reducers.createAuthenticatedModelListResponseReducer<
    Model.SimpleTemplate,
    Omit<
      Redux.AuthenticatedModelListResponseActionMap<Model.SimpleTemplate>,
      "restoreSearchCache" | "updating" | "deleting" | "creating"
    >
  >({
    initialState: redux.initialState.initialAuthenticatedModelListResponseState,
    actions: {
      request: actions.requestCommunityTemplatesAction,
      response: actions.responseCommunityTemplatesAction,
      loading: actions.loadingCommunityTemplatesAction,
      setSearch: actions.setCommunityTemplatesSearchAction,
      addToState: actions.addCommunityTemplateToStateAction,
      removeFromState: actions.removeCommunityTemplateFromStateAction,
      updateInState: actions.updateCommunityTemplateInStateAction
    }
  }),
  budgets: redux.reducers.createAuthenticatedModelListResponseReducer<
    Model.SimpleBudget,
    Omit<
      Redux.AuthenticatedModelListResponseActionMap<Model.SimpleBudget>,
      "restoreSearchCache" | "updating" | "deleting" | "creating"
    >
  >({
    initialState: redux.initialState.initialAuthenticatedModelListResponseState,
    actions: {
      request: actions.requestBudgetsAction,
      response: actions.responseBudgetsAction,
      loading: actions.loadingBudgetsAction,
      setSearch: actions.setBudgetsSearchAction,
      addToState: actions.addBudgetToStateAction,
      removeFromState: actions.removeBudgetFromStateAction,
      updateInState: actions.updateBudgetInStateAction
    }
  })
});

export default rootReducer;
