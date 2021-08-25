import { SagaIterator } from "redux-saga";
import { spawn, takeLatest, debounce } from "redux-saga/effects";
import { ActionType } from "./actions";
import * as tasks from "./tasks";

function* watchForBudgetsRefreshSaga(): SagaIterator {
  yield takeLatest([ActionType.Budgets.Request], tasks.getBudgetsTask);
}

function* watchForTemplatesRefreshSaga(): SagaIterator {
  yield takeLatest([ActionType.Templates.Request], tasks.getTemplatesTask);
}

function* watchForCommunityTemplatesRefreshSaga(): SagaIterator {
  yield takeLatest([ActionType.Community.Request], tasks.getCommunityTemplatesTask);
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

export default function* rootSaga(): SagaIterator {
  yield spawn(watchForTemplatesRefreshSaga);
  yield spawn(watchForSearchTemplatesSaga);
  yield spawn(watchForBudgetsRefreshSaga);
  yield spawn(watchForSearchBudgetsSaga);
  yield spawn(watchForCommunityTemplatesRefreshSaga);
  yield spawn(watchForSearchCommunityTemplatesSaga);
}
