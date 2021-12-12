import { SagaIterator } from "redux-saga";
import { spawn, debounce } from "redux-saga/effects";
import { ActionCreatorWithPayload } from "@reduxjs/toolkit";

import { tabling, budgeting } from "lib";
import { ActualsTable } from "components/tabling";

import { updateBudgetInStateAction } from "../actions";
import { actuals as actions } from "../actions";

const ActionMap: Redux.ActionMapObject<budgeting.tasks.actuals.ActualsTableActionMap> & {
  readonly request: ActionCreatorWithPayload<Redux.TableRequestPayload>;
} = {
  tableChanged: actions.handleTableChangeEventAction,
  updateBudgetInState: updateBudgetInStateAction,
  loading: actions.loadingAction,
  request: actions.requestAction,
  response: actions.responseAction,
  saving: actions.savingTableAction,
  addModelsToState: actions.addModelsToStateAction,
  setSearch: actions.setSearchAction,
  responseActualOwners: actions.responseActualOwnersAction,
  loadingActualOwners: actions.loadingActualOwnersAction,
  responseActualTypes: actions.responseActualTypesAction
};

const tasks = budgeting.tasks.actuals.createTableTaskSet({
  columns: ActualsTable.Columns,
  selectStore: (state: Application.Authenticated.Store) => state.budget.actuals,
  selectObjId: (state: Application.Authenticated.Store) => state.budget.id,
  selectOwnersSearch: (state: Application.Authenticated.Store) => state.budget.actuals.owners.search,
  actions: ActionMap
});

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
  yield debounce(250, actions.setActualOwnersSearchAction.toString(), tasks.requestActualOwners);
}
