import { SagaIterator } from "redux-saga";
import { put, takeLatest, spawn } from "redux-saga/effects";

import * as api from "api";
import { tabling, notifications, http } from "lib";
import * as store from "store";

import {
  account as actions,
  responseFringesAction,
  responseSubAccountUnitsAction,
  responseFringeColorsAction
} from "../../actions/public";

function* getAccount(action: Redux.Action<number>): SagaIterator {
  try {
    const response: Model.Account = yield http.request(api.getAccount, action.context, action.payload);
    yield put(actions.responseAccountAction(response));
  } catch (e: unknown) {
    notifications.ui.banner.handleRequestError(e as Error);
    yield put(actions.responseAccountAction(null));
  }
}

const ActionMap = {
  loading: actions.loadingAction,
  response: actions.responseAction,
  setSearch: actions.setSearchAction,
  responseFringes: responseFringesAction,
  responseFringeColors: responseFringeColorsAction,
  responseSubAccountUnits: responseSubAccountUnitsAction
};

export const createTableSaga = (table: Table.TableInstance<Tables.SubAccountRowData, Model.SubAccount>) =>
  tabling.sagas.createPublicTableSaga<Tables.SubAccountRowData,
	Model.SubAccount,
	Tables.SubAccountTableStore, Tables.SubAccountTableContext>({
    actions: { ...ActionMap, request: actions.requestAction },
		selectStore: (state: Application.Store) => state.public.budget.account.table,
    tasks: store.tasks.subaccounts.createPublicTableTaskSet({
      table,
      actions: ActionMap,
			selectStore: (state: Application.Store) => state.public.budget.account.table,
      services: {
        request: api.getAccountChildren,
        requestGroups: api.getAccountGroups,
        requestMarkups: api.getAccountMarkups
      }
    })
  });

function* watchForRequestAction(): SagaIterator {
  yield takeLatest([actions.requestAccountAction.toString()], getAccount);
}

function* rootSaga(): SagaIterator {
  yield spawn(watchForRequestAction);
}

export default rootSaga;
