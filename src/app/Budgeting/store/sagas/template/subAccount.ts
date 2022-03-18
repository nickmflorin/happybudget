import { SagaIterator } from "redux-saga";
import { put, takeLatest, spawn } from "redux-saga/effects";

import * as api from "api";
import { tabling, notifications, http } from "lib";
import * as store from "store";

import {
  subAccount as actions,
  updateBudgetInStateAction,
  responseFringeColorsAction,
  responseFringesAction,
  responseSubAccountUnitsAction
} from "../../actions/template";

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
  updateParentInState: actions.updateInStateAction,
  handleEvent: actions.handleTableEventAction,
  loading: actions.loadingAction,
  response: actions.responseAction,
  updateBudgetInState: updateBudgetInStateAction,
  setSearch: actions.setSearchAction,
  responseFringes: responseFringesAction,
  responseFringeColors: responseFringeColorsAction,
  responseSubAccountUnits: responseSubAccountUnitsAction
};

export const createTableSaga = (table: Table.TableInstance<Tables.SubAccountRowData, Model.SubAccount>) =>
  tabling.sagas.createAuthenticatedTableSaga<
    Tables.SubAccountRowData,
    Model.SubAccount,
    Tables.SubAccountTableStore,
    Tables.SubAccountTableContext
  >({
    actions: { ...ActionMap, request: actions.requestAction },
    selectStore: (state: Application.Store) => state.template.subaccount.table,
    tasks: store.tasks.subaccounts.createAuthenticatedTableTaskSet<Model.SubAccount, Model.Template>({
      table,
      selectStore: (state: Application.Store) => state.template.subaccount.table,
      actions: ActionMap,
      services: {
        create: api.createSubAccountChild,
        createGroup: api.createSubAccountGroup,
        createMarkup: api.createSubAccountMarkup,
        request: api.getSubAccountChildren,
        requestGroups: api.getSubAccountGroups,
        requestMarkups: api.getSubAccountMarkups,
        bulkCreate: api.bulkCreateSubAccountChildren,
        bulkDelete: api.bulkDeleteSubAccountChildren,
        bulkUpdate: api.bulkUpdateSubAccountChildren,
        bulkDeleteMarkups: api.bulkDeleteSubAccountMarkups
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
