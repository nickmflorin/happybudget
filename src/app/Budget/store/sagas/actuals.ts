import { SagaIterator } from "redux-saga";
import { spawn, debounce } from "redux-saga/effects";

import { tabling, budgeting } from "lib";

import { updateBudgetInStateAction } from "../actions";
import { actuals as actions } from "../actions";

const ActionMap: budgeting.tasks.actuals.ActualsTableActionMap & {
  readonly request: Redux.ContextActionCreator<Redux.TableRequestPayload, Tables.ActualTableContext>;
} = {
  tableChanged: actions.handleTableChangeEventAction,
  updateBudgetInState: updateBudgetInStateAction,
  loading: actions.loadingAction,
  request: actions.requestAction,
  response: actions.responseAction,
  addModelsToState: actions.addModelsToStateAction,
  setSearch: actions.setSearchAction,
  responseActualOwners: actions.responseActualOwnersAction,
  loadingActualOwners: actions.loadingActualOwnersAction,
  responseActualTypes: actions.responseActualTypesAction
};

export const createTableSaga = (table: Table.TableInstance<Tables.ActualRowData, Model.Actual>) => {
  const tasks = budgeting.tasks.actuals.createTableTaskSet({
    table,
    selectStore: (state: Application.AuthenticatedStore) => state.budget.actuals,
    selectOwnersSearch: (state: Application.AuthenticatedStore) => state.budget.actuals.owners.search,
    actions: ActionMap
  });

  const tableSaga = tabling.sagas.createAuthenticatedTableSaga<
    Tables.ActualRowData,
    Model.Actual,
    Tables.ActualTableContext,
    Redux.AuthenticatedTableActionMap<Tables.ActualRowData, Model.Actual, Tables.ActualTableContext>
  >({
    actions: ActionMap,
    tasks: tasks
  });

  function* listenForSearchSaga(): SagaIterator {
    yield debounce(250, actions.setActualOwnersSearchAction.toString(), tasks.requestActualOwners);
  }

  function* rootSaga(): SagaIterator {
    yield spawn(tableSaga);
    yield spawn(listenForSearchSaga);
  }
  return rootSaga;
};
