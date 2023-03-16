import { SagaIterator } from "redux-saga";
import { spawn, debounce } from "redux-saga/effects";

import { tabling } from "lib";
import * as store from "store";

import { actuals as actions, updateBudgetInStateAction } from "../../actions/budget";

type R = Tables.ActualRowData;
type M = Model.Actual;
type C = ActualsTableActionContext;

const ActionMap = {
  handleEvent: actions.handleTableEventAction,
  updateBudgetInState: updateBudgetInStateAction,
  loading: actions.loadingAction,
  request: actions.requestAction,
  response: actions.responseAction,
  setSearch: actions.setSearchAction,
  responseActualOwners: actions.responseActualOwnersAction,
  loadingActualOwners: actions.loadingActualOwnersAction,
};

export const createTableSaga = (table: Table.TableInstance<R, M>) => {
  const tasks = store.tasks.actuals.createTableTaskSet({
    table,
    selectStore: (state: Application.Store) => state.budget.actuals,
    selectOwnersSearch: (state: Application.Store) => state.budget.actuals.owners.search,
    actions: ActionMap,
  });

  const tableSaga = tabling.sagas.createAuthenticatedTableSaga<R, M, Tables.ActualTableStore, C>({
    actions: ActionMap,
    tasks: tasks,
    selectStore: (state: Application.Store) => state.budget.actuals,
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
