import { SagaIterator } from "redux-saga";
import { put, takeLatest, spawn } from "redux-saga/effects";
import { isNil } from "lodash";

import * as api from "api";
import { budgeting, tabling, notifications } from "lib";

import {
  account as actions,
  responseFringesAction,
  updateBudgetInStateAction,
  responseSubAccountUnitsAction,
  responseFringeColorsAction
} from "../../actions/budget";

function* getAccount(action: Redux.Action<number>): SagaIterator {
  try {
    const response: Model.Account = yield api.request(api.getAccount, action.context, action.payload);
    yield put(actions.responseAccountAction(response));
  } catch (e: unknown) {
    const err = e as Error;
    if (
      err instanceof api.ClientError &&
      !isNil(err.permissionError) &&
      err.permissionError.code === api.ErrorCodes.PRODUCT_PERMISSION_ERROR
    ) {
      notifications.ui.banner.lookupAndNotify("budgetSubscriptionPermissionError");
    } else {
      notifications.ui.banner.handleRequestError(e as Error);
    }
    yield put(actions.responseAccountAction(null));
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
    selectStore: (state: Application.Store) => state.budget.account.table,
    tasks: budgeting.tasks.subaccounts.createAuthenticatedTableTaskSet<Model.Account, Model.Budget>({
      table,
      selectStore: (state: Application.Store) => state.budget.account.table,
      actions: ActionMap,
      services: {
        create: api.createAccountChild,
        createGroup: api.createAccountGroup,
        createMarkup: api.createAccountMarkup,
        request: api.getAccountChildren,
        requestGroups: api.getAccountGroups,
        requestMarkups: api.getAccountMarkups,
        bulkCreate: api.bulkCreateAccountChildren,
        bulkDelete: api.bulkDeleteAccountChildren,
        bulkUpdate: api.bulkUpdateAccountChildren,
        bulkDeleteMarkups: api.bulkDeleteAccountMarkups
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
