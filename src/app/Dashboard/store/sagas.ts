import { includes, isNil } from "lodash";
import { SagaIterator } from "redux-saga";
import { spawn, takeLatest, debounce, takeEvery, select, take, put, cancel, fork } from "redux-saga/effects";
import { ActionType, deleteContactAction } from "./actions";
import * as tasks from "./tasks";

function* watchForContactsRefreshSaga(): SagaIterator {
  yield takeLatest(
    [
      ActionType.Contacts.Request,
      ActionType.Contacts.SetPage,
      ActionType.Contacts.SetPageSize,
      ActionType.Contacts.SetPageAndSize
    ],
    tasks.getContactsTask
  );
}

function* watchForSearchContactsSaga(): SagaIterator {
  yield debounce(250, ActionType.Contacts.SetSearch, tasks.getContactsTask);
}

function* watchForDeleteContactSaga(): SagaIterator {
  yield takeEvery(ActionType.Contacts.Delete, tasks.deleteContactTask);
}

function* watchForDeleteContactsSaga(): SagaIterator {
  while (true) {
    const action: Redux.Action<number[]> = yield take(ActionType.Contacts.DeleteMultiple);
    if (!isNil(action.payload)) {
      /* eslint-disable no-loop-func */
      const deleting = yield select((state: Modules.ApplicationStore) => state.dashboard.contacts.deleting);
      for (let i = 0; i < action.payload.length; i++) {
        const id: number = action.payload[i];
        if (!includes(deleting, id)) {
          yield put(deleteContactAction(id));
        }
      }
    }
  }
}

function* watchForBudgetsRefreshSaga(): SagaIterator {
  yield takeLatest(
    [
      ActionType.Budgets.Request,
      ActionType.Budgets.SetPage,
      ActionType.Budgets.SetPageSize,
      ActionType.Budgets.SetPageAndSize
    ],
    tasks.getBudgetsTask
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
    tasks.getTemplatesTask
  );
}

function* watchForCommunityTemplatesRefreshSaga(): SagaIterator {
  yield takeLatest(
    [
      ActionType.Community.Request,
      ActionType.Community.SetPage,
      ActionType.Community.SetPageSize,
      ActionType.Community.SetPageAndSize
    ],
    tasks.getCommunityTemplatesTask
  );
}

function* watchForSearchBudgetsSaga(): SagaIterator {
  yield debounce(250, ActionType.Budgets.SetSearch, tasks.getBudgetsTask);
}

function* watchForSearchTemplatesSaga(): SagaIterator {
  yield debounce(250, ActionType.Templates.SetSearch, tasks.getTemplatesTask);
}

function* watchForSearchCommunityTemplatesSaga(): SagaIterator {
  yield debounce(250, ActionType.Community.SetSearch, tasks.getCommunityTemplatesTask);
}

function* watchForDeleteBudgetSaga(): SagaIterator {
  let lastTasks: { [key: number]: any[] } = {};
  while (true) {
    const action: Redux.Action<number> = yield take(ActionType.Budgets.Delete);
    if (!isNil(action.payload)) {
      if (isNil(lastTasks[action.payload])) {
        lastTasks[action.payload] = [];
      }
      if (lastTasks[action.payload].length !== 0) {
        const cancellable = lastTasks[action.payload];
        lastTasks = { ...lastTasks, [action.payload]: [] };
        yield cancel(cancellable);
      }
      const task = yield fork(tasks.deleteBudgetTask, action);
      lastTasks[action.payload].push(task);
    }
  }
}

function* watchForDeleteTemplateSaga(): SagaIterator {
  let lastTasks: { [key: number]: any[] } = {};
  while (true) {
    const action: Redux.Action<number> = yield take(ActionType.Templates.Delete);
    if (!isNil(action.payload)) {
      if (isNil(lastTasks[action.payload])) {
        lastTasks[action.payload] = [];
      }
      if (lastTasks[action.payload].length !== 0) {
        const cancellable = lastTasks[action.payload];
        lastTasks = { ...lastTasks, [action.payload]: [] };
        yield cancel(cancellable);
      }
      const task = yield fork(tasks.deleteTemplateTask, action);
      lastTasks[action.payload].push(task);
    }
  }
}

function* watchForDeleteCommunityTemplateSaga(): SagaIterator {
  yield takeEvery(ActionType.Community.Delete, tasks.deleteCommunityTemplateTask);
}

function* watchForMoveTemplateToCommunitySaga(): SagaIterator {
  let lastTasks: { [key: number]: any[] } = {};
  while (true) {
    const action: Redux.Action<number> = yield take(ActionType.Templates.MoveToCommunity);
    if (!isNil(action.payload)) {
      if (isNil(lastTasks[action.payload])) {
        lastTasks[action.payload] = [];
      }
      if (lastTasks[action.payload].length !== 0) {
        const cancellable = lastTasks[action.payload];
        lastTasks = { ...lastTasks, [action.payload]: [] };
        yield cancel(cancellable);
      }
      const task = yield fork(tasks.moveTemplateToCommunityTask, action);
      lastTasks[action.payload].push(task);
    }
  }
}

function* watchForDuplicateTemplateSaga(): SagaIterator {
  let lastTasks: { [key: number]: any[] } = {};
  while (true) {
    const action: Redux.Action<number> = yield take(ActionType.Templates.Duplicate);
    if (!isNil(action.payload)) {
      if (isNil(lastTasks[action.payload])) {
        lastTasks[action.payload] = [];
      }
      if (lastTasks[action.payload].length !== 0) {
        const cancellable = lastTasks[action.payload];
        lastTasks = { ...lastTasks, [action.payload]: [] };
        yield cancel(cancellable);
      }
      const task = yield fork(tasks.duplicateTemplateTask, action);
      lastTasks[action.payload].push(task);
    }
  }
}

function* watchForDuplicateCommunityTemplateSaga(): SagaIterator {
  let lastTasks: { [key: number]: any[] } = {};
  while (true) {
    const action: Redux.Action<number> = yield take(ActionType.Community.Duplicate);
    if (!isNil(action.payload)) {
      if (isNil(lastTasks[action.payload])) {
        lastTasks[action.payload] = [];
      }
      if (lastTasks[action.payload].length !== 0) {
        const cancellable = lastTasks[action.payload];
        lastTasks = { ...lastTasks, [action.payload]: [] };
        yield cancel(cancellable);
      }
      const task = yield fork(tasks.duplicateCommunityTemplateTask, action);
      lastTasks[action.payload].push(task);
    }
  }
}

function* watchForHideCommunityTemplateSaga(): SagaIterator {
  let lastTasks: { [key: number]: any[] } = {};
  while (true) {
    const action: Redux.Action<number> = yield take(ActionType.Community.Hide);
    if (!isNil(action.payload)) {
      if (isNil(lastTasks[action.payload])) {
        lastTasks[action.payload] = [];
      }
      if (lastTasks[action.payload].length !== 0) {
        const cancellable = lastTasks[action.payload];
        lastTasks = { ...lastTasks, [action.payload]: [] };
        yield cancel(cancellable);
      }
      const task = yield fork(tasks.hideCommunityTemplateTask, action);
      lastTasks[action.payload].push(task);
    }
  }
}

function* watchForShowCommunityTemplateSaga(): SagaIterator {
  let lastTasks: { [key: number]: any[] } = {};
  while (true) {
    const action: Redux.Action<number> = yield take(ActionType.Community.Show);
    if (!isNil(action.payload)) {
      if (isNil(lastTasks[action.payload])) {
        lastTasks[action.payload] = [];
      }
      if (lastTasks[action.payload].length !== 0) {
        const cancellable = lastTasks[action.payload];
        lastTasks = { ...lastTasks, [action.payload]: [] };
        yield cancel(cancellable);
      }
      const task = yield fork(tasks.showCommunityTemplateAction, action);
      lastTasks[action.payload].push(task);
    }
  }
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
  yield spawn(watchForDeleteContactsSaga);
  yield spawn(watchForCommunityTemplatesRefreshSaga);
  yield spawn(watchForSearchCommunityTemplatesSaga);
  yield spawn(watchForDeleteCommunityTemplateSaga);
  yield spawn(watchForMoveTemplateToCommunitySaga);
  yield spawn(watchForDuplicateTemplateSaga);
  yield spawn(watchForDuplicateCommunityTemplateSaga);
  yield spawn(watchForHideCommunityTemplateSaga);
  yield spawn(watchForShowCommunityTemplateSaga);
}
