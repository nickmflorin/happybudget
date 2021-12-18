import { SagaIterator } from "redux-saga";
import { spawn, takeLatest, put } from "redux-saga/effects";

import * as api from "api";
import { budgeting, tabling, notifications } from "lib";

import * as actions from "../actions";

import pdfSaga from "./pdf";
import analysisSaga from "./analysis";
import accountSaga from "./account";
import subAccountSaga from "./subAccount";

export * as accounts from "./accounts";
export * as actuals from "./actuals";
export * as account from "./account";
export * as subAccount from "./subAccount";

const FringesActionMap = {
  requestAccount: actions.account.requestAccountAction,
  requestSubAccount: actions.subAccount.requestSubAccountAction,
  requestAccountTableData: actions.account.requestAction,
  requestSubAccountTableData: actions.subAccount.requestAction,
  tableChanged: actions.handleFringesTableChangeEventAction,
  loading: actions.loadingFringesAction,
  response: actions.responseFringesAction,
  saving: actions.savingFringesTableAction,
  addModelsToState: actions.addFringeModelsToStateAction,
  loadingBudget: actions.loadingBudgetAction,
  updateBudgetInState: actions.updateBudgetInStateAction,
  setSearch: actions.setFringesSearchAction,
  responseFringeColors: actions.responseFringeColorsAction
};

function* getBudgetTask(action: Redux.Action<number>): SagaIterator {
  yield put(actions.loadingBudgetAction(true));
  try {
    const response: Model.Budget = yield api.request(api.getBudget, action.payload);
    yield put(actions.responseBudgetAction(response));
  } catch (e: unknown) {
    // TODO: We need to build in banner notifications for this event.
    notifications.requestError(e as Error);
    yield put(actions.responseBudgetAction(null));
  } finally {
    yield put(actions.loadingBudgetAction(false));
  }
}

export const createFringesTableSaga = (table: Table.TableInstance<Tables.FringeRowData, Model.Fringe>) =>
  tabling.sagas.createAuthenticatedTableSaga<Tables.FringeRowData, Model.Fringe, Tables.FringeTableContext>({
    actions: { ...FringesActionMap, request: actions.requestFringesAction },
    tasks: budgeting.tasks.fringes.createTableTaskSet<Model.Budget>({
      table,
      selectAccountTableStore: (state: Application.AuthenticatedStore) => state.budget.account.table,
      selectSubAccountTableStore: (state: Application.AuthenticatedStore) => state.budget.subaccount.table,
      actions: FringesActionMap,
      services: {
        create: api.createBudgetFringe,
        request: api.getBudgetFringes,
        bulkCreate: api.bulkCreateBudgetFringes,
        bulkDelete: api.bulkDeleteBudgetFringes,
        bulkUpdate: api.bulkUpdateBudgetFringes
      }
    })
  });

export default function* rootSaga(): SagaIterator {
  yield spawn(pdfSaga);
  yield spawn(analysisSaga);
  yield spawn(accountSaga);
  yield spawn(subAccountSaga);
  yield takeLatest(actions.requestBudgetAction.toString(), getBudgetTask);
}
