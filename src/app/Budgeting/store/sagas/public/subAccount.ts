import { SagaIterator } from "redux-saga";
import { put, takeLatest, spawn } from "redux-saga/effects";

import * as api from "api";
import { budgeting, tabling, notifications } from "lib";

import {
  subAccount as actions,
  loadingBudgetAction,
  responseFringeColorsAction,
  responseFringesAction,
  responseSubAccountUnitsAction
} from "../../actions/public";

function* getSubAccount(action: Redux.Action<number>): SagaIterator {
  try {
    const response: Model.SubAccount = yield api.request(api.getSubAccount, action.context, action.payload);
    yield put(actions.responseSubAccountAction(response));
  } catch (e: unknown) {
    notifications.ui.banner.handleRequestError(e as Error);
    yield put(actions.responseSubAccountAction(null));
  }
}

const ActionMap = {
  loading: actions.loadingAction,
  response: actions.responseAction,
  loadingBudget: loadingBudgetAction,
  setSearch: actions.setSearchAction,
  responseFringes: responseFringesAction,
  responseFringeColors: responseFringeColorsAction,
  responseSubAccountUnits: responseSubAccountUnitsAction
};

export const createTableSaga = (table: Table.TableInstance<Tables.SubAccountRowData, Model.SubAccount>) =>
  tabling.sagas.createPublicTableSaga<Model.SubAccount, Tables.SubAccountTableContext>({
    actions: { ...ActionMap, request: actions.requestAction },
    tasks: budgeting.tasks.subaccounts.createPublicTableTaskSet({
      table,
      actions: ActionMap,
      services: {
        request: api.getSubAccountChildren,
        requestGroups: api.getSubAccountGroups,
        requestMarkups: api.getSubAccountMarkups
      }
    })
  });

function* watchForRequestAction(): SagaIterator {
  yield takeLatest([actions.requestSubAccountAction.toString()], getSubAccount);
}

function* rootSaga(): SagaIterator {
  yield spawn(watchForRequestAction);
}

export default rootSaga;
