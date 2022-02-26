import { SagaIterator } from "redux-saga";
import { spawn, debounce } from "redux-saga/effects";

import { tabling, budgeting } from "lib";

import { updateBudgetInStateAction } from "../../actions/budget";
import { actuals as actions } from "../../actions/budget";

const ActionMap: budgeting.tasks.actuals.ActualsTableActionMap & {
  readonly request: Redux.TableActionCreator<Redux.TableRequestPayload, Tables.ActualTableContext>;
} = {
  tableChanged: actions.handleTableEventAction,
  updateBudgetInState: updateBudgetInStateAction,
  loading: actions.loadingAction,
  request: actions.requestAction,
  response: actions.responseAction,
  setSearch: actions.setSearchAction,
  responseActualOwners: actions.responseActualOwnersAction,
  loadingActualOwners: actions.loadingActualOwnersAction,
  responseActualTypes: actions.responseActualTypesAction
};

export const createTableSaga = (table: Table.TableInstance<Tables.ActualRowData, Model.Actual>) => {
  const tasks = budgeting.tasks.actuals.createTableTaskSet({
    table,
    selectStore: (state: Application.Store) => state.budget.actuals,
    selectOwnersSearch: (state: Application.Store) => state.budget.actuals.owners.search,
    actions: ActionMap
  });

  const tableSaga = tabling.sagas.createAuthenticatedTableSaga<
    Tables.ActualRowData,
    Model.Actual,
    Tables.ActualTableContext
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
