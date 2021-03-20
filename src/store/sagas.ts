import { SagaIterator, Saga } from "redux-saga";
import { select, spawn, takeEvery, put } from "redux-saga/effects";
import { isNil } from "lodash";

import { ApplicationActionTypes, setOverallApplicationLoadingAction } from "./actions";

function* handleLoadingTask(action: Redux.IAction<{ id: string; value: boolean }>): SagaIterator {
  if (!isNil(action.payload)) {
    const elementsLoading = yield select((state: Redux.IApplicationStore) => state.loading.elements);
    const loading = yield select((state: Redux.IApplicationStore) => state.loading.loading);
    if (elementsLoading.length === 0 && loading === true) {
      yield put(setOverallApplicationLoadingAction(false));
    } else if (elementsLoading.length !== 0 && loading === false) {
      yield put(setOverallApplicationLoadingAction(true));
    }
  }
}

function* watchForLoadingChangedSaga(): SagaIterator {
  yield takeEvery(ApplicationActionTypes.SetApplicationLoading, handleLoadingTask);
}

export function* RootSaga(): SagaIterator {
  yield spawn(watchForLoadingChangedSaga);
}

const createApplicationSaga = (config: Redux.IApplicationConfig): Saga => {
  function* applicationSaga(): SagaIterator {
    for (var i = 0; i < config.length; i++) {
      const moduleConfig: Redux.IModuleConfig<any, any> = config[i];
      if (!isNil(moduleConfig.rootSaga)) {
        yield spawn(moduleConfig.rootSaga);
      }
    }
    // Spawn the main application saga.
    yield spawn(RootSaga);
  }
  return applicationSaga;
};

export default createApplicationSaga;
