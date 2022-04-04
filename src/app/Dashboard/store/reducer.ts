import { combineReducers } from "redux";
import { isNil, reduce } from "lodash";

import { redux, tabling } from "lib";
import { ContactsTable } from "tabling";

import initialState from "./initialState";
import * as actions from "./actions";

const rootBudgetsReducer = redux.reducers.createAuthenticatedModelListResponseReducer<Model.SimpleBudget>({
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

const rootArchiveReducer = redux.reducers.createAuthenticatedModelListResponseReducer<Model.SimpleBudget>({
  initialState: initialState.archive,
  actions: {
    request: actions.requestArchiveAction,
    response: actions.responseArchiveAction,
    loading: actions.loadingArchiveAction,
    setSearch: actions.setArchiveSearchAction,
    removeFromState: actions.removeArchiveFromStateAction,
    updateInState: actions.updateArchiveInStateAction,
    setPagination: actions.setArchivePaginationAction,
    updateOrdering: actions.updateArchiveOrderingAction,
    addToState: actions.addArchiveToStateAction
  }
});

const createBudgetsReducer = <L extends "budgets" | "archive">(location: L) => {
  const root = location === "budgets" ? rootBudgetsReducer : rootArchiveReducer;
  const repermissionAction =
    location === "budgets" ? actions.responsePermissionedBudgetsAction : actions.responsePermissionedArchiveAction;
  return (state: Modules.Dashboard.Store[L] = initialState[location], action: Redux.Action) => {
    const newState = root(state, action);
    if (action.type === repermissionAction.toString()) {
      const repermissioned: Model.SimpleBudget[] = action.payload.data;
      return {
        ...newState,
        data: reduce(
          newState.data,
          (curr: Model.SimpleBudget[], m: Model.SimpleBudget) => {
            const reperm = redux.findModelInData(repermissioned, m.id);
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
};

const rootReducer: Redux.Reducer<Modules.Dashboard.Store> = combineReducers({
  budgets: createBudgetsReducer("budgets"),
  archive: createBudgetsReducer("archive"),
  collaborating: redux.reducers.createAuthenticatedModelListResponseReducer<Model.SimpleCollaboratingBudget>({
    initialState: redux.initialAuthenticatedModelListResponseState,
    actions: {
      request: actions.requestCollaboratingAction,
      response: actions.responseCollaboratingAction,
      loading: actions.loadingCollaboratingAction,
      setSearch: actions.setCollaboratingSearchAction,
      setPagination: actions.setCollaboratingPaginationAction,
      updateOrdering: actions.updateCollaboratingOrderingAction
    }
  }),
  contacts: tabling.reducers.createAuthenticatedTableReducer<
    Tables.ContactRowData,
    Model.Contact,
    Tables.ContactTableStore,
    Tables.ContactTableContext
  >({
    columns: tabling.columns.filterModelColumns(ContactsTable.Columns),
    clearOn: [actions.requestContactsAction],
    actions: {
      handleEvent: actions.handleContactsTableEventAction,
      loading: actions.loadingContactsAction,
      response: actions.responseContactsAction,
      setSearch: actions.setContactsSearchAction
    },
    initialState: redux.initialTableState
  }),
  templates: redux.reducers.createAuthenticatedModelListResponseReducer<Model.SimpleTemplate>({
    initialState: redux.initialAuthenticatedModelListResponseState,
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
  community: redux.reducers.createAuthenticatedModelListResponseReducer<Model.SimpleTemplate>({
    initialState: redux.initialAuthenticatedModelListResponseState,
    actions: {
      request: actions.requestCommunityAction,
      response: actions.responseCommunityAction,
      loading: actions.loadingCommunityAction,
      setSearch: actions.setCommunitySearchAction,
      addToState: actions.addCommunityToStateAction,
      removeFromState: actions.removeCommunityFromStateAction,
      updateInState: actions.updateCommunityInStateAction,
      setPagination: actions.setCommunityPaginationAction,
      updateOrdering: actions.updateCommunityOrderingAction
    }
  })
});

export default rootReducer;
