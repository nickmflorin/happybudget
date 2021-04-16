import { includes, isNil } from "lodash";
import { SagaIterator } from "redux-saga";
import { spawn, takeLatest, debounce, takeEvery, select, take, put } from "redux-saga/effects";
import { ActionType, deleteContactAction } from "./actions";
import {
  getBudgetsTask,
  getTemplatesTask,
  deleteBudgetTask,
  deleteTemplateTask,
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
    const action: Redux.Action<number[]> = yield take(ActionType.Contacts.DeleteMultiple);
    if (!isNil(action.payload)) {
      const deleting = yield select((state: Redux.ApplicationStore) => state.dashboard.contacts.deleting);
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

function* watchForTemplatesRefreshSaga(): SagaIterator {
  yield takeLatest(
    [
      ActionType.Templates.Request,
      ActionType.Templates.SetPage,
      ActionType.Templates.SetPageSize,
      ActionType.Templates.SetPageAndSize
    ],
    getTemplatesTask
  );
}

function* watchForSearchBudgetsSaga(): SagaIterator {
  yield debounce(250, ActionType.Budgets.SetSearch, getBudgetsTask);
}

function* watchForSearchTemplatesSaga(): SagaIterator {
  yield debounce(250, ActionType.Templates.SetSearch, getTemplatesTask);
}

function* watchForDeleteBudgetSaga(): SagaIterator {
  yield takeEvery(ActionType.Budgets.Delete, deleteBudgetTask);
}

function* watchForDeleteTemplateSaga(): SagaIterator {
  yield takeEvery(ActionType.Templates.Delete, deleteTemplateTask);
}

export default function* rootSaga(): SagaIterator {
  yield spawn(watchForTemplatesRefreshSaga);
  yield spawn(watchForSearchTemplatesSaga);
  yield spawn(watchForDeleteTemplateSaga);
  yield spawn(watchForBudgetsRefreshSaga);
  yield spawn(watchForSearchBudgetsSaga);
  yield spawn(watchForDeleteBudgetSaga);
  yield spawn(watchForContactsRefreshSaga);
  yield spawn(watchForSearchContactsSaga);
  yield spawn(watchForDeleteContactSaga);
  yield spawn(watchForUpdateContactSaga);
  yield spawn(watchForCreateContactSaga);
  yield spawn(watchForDeleteContactsSaga);
}
