import { combineReducers } from "redux";
import { isNil, reduce } from "lodash";

import { redux, tabling } from "lib";
import { ContactsTable } from "tabling";

import initialState from "./initialState";
import * as actions from "./actions";

const rootBudgetsReducer = redux.reducers.createAuthenticatedModelListResponseReducer<
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
});

const budgetsReducer: Redux.Reducer<Modules.Dashboard.Store["budgets"]> = (
  state: Modules.Dashboard.Store["budgets"] = initialState.budgets,
  action: Redux.Action
) => {
  const newState = rootBudgetsReducer(state, action);
  if (action.type === actions.responsePermissionedBudgetsAction.toString()) {
    const repermissioned: Model.SimpleBudget[] = action.payload.data;
    return {
      ...newState,
      data: reduce(
        newState.data,
        (curr: Model.SimpleBudget[], m: Model.SimpleBudget) => {
          const reperm = redux.reducers.findModelInData(action, repermissioned, m.id, {
            modelName: "repermissioned budget"
          });
          if (!isNil(reperm)) {
            return [...curr, { ...m, is_permissioned: reperm.is_permissioned }];
          }
          return [...curr, m];
        },
        []
      )
    };
  }
  return newState;
};

const rootReducer: Redux.Reducer<Modules.Dashboard.Store> = combineReducers({
  budgets: budgetsReducer,
  contacts: tabling.reducers.createAuthenticatedTableReducer<
    Tables.ContactRowData,
    Model.Contact,
    Tables.ContactTableStore,
    Tables.ContactTableContext
  >({
    columns: tabling.columns.filterModelColumns(ContactsTable.Columns),
    clearOn: [actions.requestContactsAction],
    actions: {
      tableChanged: actions.handleContactsTableEventAction,
      loading: actions.loadingContactsAction,
      response: actions.responseContactsAction,
      setSearch: actions.setContactsSearchAction
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
  })
});

export default rootReducer;
