import { includes, isNil } from "lodash";
import { SagaIterator } from "redux-saga";
import { spawn, takeLatest, debounce, takeEvery, select, take, put } from "redux-saga/effects";
import { ActionType, deleteContactAction } from "./actions";
import {
  getBudgetsTask,
  deleteBudgetTask,
  restoreBudgetTask,
  permanentlyDeleteBudgetTask,
  getContactsTask,
  deleteContactTask,
  updateContactTask,
  createContactTask
} from "./tasks";

function* watchForContactsRefreshSaga(): SagaIterator {
  yield takeLatest(
    [
      ActionType.Contacts.Request,
      ActionType.Contacts.SetPage,
      ActionType.Contacts.SetPageSize,
      ActionType.Contacts.SetPageAndSize
    ],
    getContactsTask
  );
}

function* watchForSearchContactsSaga(): SagaIterator {
  yield debounce(250, ActionType.Contacts.SetSearch, getContactsTask);
}

function* watchForDeleteContactSaga(): SagaIterator {
  yield takeEvery(ActionType.Contacts.Delete, deleteContactTask);
}

function* watchForDeleteContactsSaga(): SagaIterator {
  while (true) {
    const action: Redux.IAction<number[]> = yield take(ActionType.Contacts.DeleteMultiple);
    if (!isNil(action.payload)) {
      const deleting = yield select((state: Redux.IApplicationStore) => state.dashboard.contacts.deleting);
      for (let i = 0; i < action.payload.length; i++) {
        const id: number = action.payload[i];
        if (!includes(deleting, id)) {
          yield put(deleteContactAction(id));
        }
      }
    }
  }
}

function* watchForUpdateContactSaga(): SagaIterator {
  yield takeEvery(ActionType.Contacts.Update, updateContactTask);
}

function* watchForCreateContactSaga(): SagaIterator {
  yield takeEvery(ActionType.Contacts.Create, createContactTask);
}

function* watchForBudgetsRefreshSaga(): SagaIterator {
  yield takeLatest(
    [
      ActionType.Budgets.Request,
      ActionType.Budgets.SetPage,
      ActionType.Budgets.SetPageSize,
      ActionType.Budgets.SetPageAndSize
    ],
    getBudgetsTask
  );
}

function* watchForSearchBudgetsSaga(): SagaIterator {
  yield debounce(250, ActionType.Budgets.SetSearch, getBudgetsTask);
}

function* watchForDeleteBudgetSaga(): SagaIterator {
  yield takeEvery(ActionType.Budgets.Delete, deleteBudgetTask);
}

function* watchForPermanentlyDeleteBudgetSaga(): SagaIterator {
  yield takeEvery(ActionType.Budgets.PermanentlyDelete, permanentlyDeleteBudgetTask);
}

function* watchForRestoreBudgetSaga(): SagaIterator {
  yield takeEvery(ActionType.Budgets.Restore, restoreBudgetTask);
}

export default function* rootSaga(): SagaIterator {
  yield spawn(watchForBudgetsRefreshSaga);
  yield spawn(watchForSearchBudgetsSaga);
  yield spawn(watchForDeleteBudgetSaga);
  yield spawn(watchForPermanentlyDeleteBudgetSaga);
  yield spawn(watchForRestoreBudgetSaga);
  yield spawn(watchForContactsRefreshSaga);
  yield spawn(watchForSearchContactsSaga);
  yield spawn(watchForDeleteContactSaga);
  yield spawn(watchForUpdateContactSaga);
  yield spawn(watchForCreateContactSaga);
  yield spawn(watchForDeleteContactsSaga);
}