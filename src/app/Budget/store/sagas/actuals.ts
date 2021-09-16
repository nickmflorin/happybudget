import { SagaIterator } from "redux-saga";
import { spawn, debounce } from "redux-saga/effects";

import { tabling, budgeting } from "lib";
import { ActualsTable } from "components/tabling";

import { actuals as actions } from "../actions";

const ActionMap: Redux.ActionMapObject<budgeting.tasks.actuals.ActualsTableActionMap> = {
  tableChanged: actions.handleTableChangeEventAction,
  request: actions.requestAction,
  clear: actions.clearAction,
  loading: actions.loadingAction,
  response: actions.responseAction,
  saving: actions.savingTableAction,
  addModelsToState: actions.addModelsToStateAction,
  setSearch: actions.setSearchAction,
  responseSubAccountsTree: actions.responseSubAccountsTreeAction,
  restoreSubAccountsTreeSearchCache: actions.restoreSubAccountsTreeSearchCacheAction,
  loadingSubAccountsTree: actions.loadingSubAccountsTreeAction
};

const tasks = budgeting.tasks.actuals.createTableTaskSet({
  columns: ActualsTable.Columns,
  selectObjId: (state: Application.Authenticated.Store) => state.budget.id,
  selectTreeCache: (state: Application.Authenticated.Store) => state.budget.actuals.subAccountsTree.cache,
  selectTreeSearch: (state: Application.Authenticated.Store) => state.budget.actuals.subAccountsTree.search,
  actions: ActionMap
});

function* searchTreeSaga(): SagaIterator {
  yield debounce(250, actions.setSubAccountsTreeSearchAction.toString(), tasks.requestSubAccountsTree);
}

const tableSaga = tabling.sagas.createAuthenticatedTableSaga<
  Tables.ActualRowData,
  Model.Actual,
  Redux.AuthenticatedTableActionMap<Tables.ActualRowData, Model.Actual>
>({
  actions: ActionMap,
  tasks: tasks
});

export default function* rootSaga(): SagaIterator {
  yield spawn(tableSaga);
  yield spawn(searchTreeSaga);
}
