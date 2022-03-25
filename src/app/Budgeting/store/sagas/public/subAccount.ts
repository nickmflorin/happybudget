import { SagaIterator } from "redux-saga";
import { put, takeLatest, spawn } from "redux-saga/effects";

import * as api from "api";
import { tabling, notifications, http } from "lib";
import * as store from "store";

import {
  subAccount as actions,
  responseFringeColorsAction,
  responseFringesAction,
  responseSubAccountUnitsAction
} from "../../actions/public";

function* getSubAccount(action: Redux.Action<number>): SagaIterator {
  try {
    const response: Model.SubAccount = yield http.request(api.getSubAccount, action.context, action.payload);
    yield put(actions.responseSubAccountAction(response));
  } catch (e: unknown) {
    notifications.ui.banner.handleRequestError(e as Error);
    yield put(actions.responseSubAccountAction(null));
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
		selectStore: (state: Application.Store) => state.public.budget.subaccount.table,
    tasks: store.tasks.subaccounts.createPublicTableTaskSet({
      table,
      actions: ActionMap,
			selectStore: (state: Application.Store) => state.public.budget.subaccount.table,
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
