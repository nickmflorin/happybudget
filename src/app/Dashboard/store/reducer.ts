import { combineReducers } from "redux";
import { redux } from "lib";
import * as actions from "./actions";

const rootReducer: Redux.Reducer<Modules.Dashboard.Store> = combineReducers({
  templates: redux.reducers.createModelListResponseReducer<
    Model.SimpleTemplate,
    Omit<
      Redux.ModelListResponseActionMap<Model.SimpleTemplate>,
      "restoreSearchCache" | "updating" | "deleting" | "creating"
    >
  >({
    initialState: redux.initialState.initialModelListResponseState,
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
  community: redux.reducers.createModelListResponseReducer<
    Model.SimpleTemplate,
    Omit<
      Redux.ModelListResponseActionMap<Model.SimpleTemplate>,
      "restoreSearchCache" | "updating" | "deleting" | "creating"
    >
  >({
    initialState: redux.initialState.initialModelListResponseState,
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
  budgets: redux.reducers.createModelListResponseReducer<
    Model.SimpleBudget,
    Omit<
      Redux.ModelListResponseActionMap<Model.SimpleBudget>,
      "restoreSearchCache" | "updating" | "deleting" | "creating"
    >
  >({
    initialState: redux.initialState.initialModelListResponseState,
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
