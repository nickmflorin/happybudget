import { SagaIterator } from "redux-saga";
import { take, cancel, fork, call, spawn } from "redux-saga/effects";
import { isNil } from "lodash";

function* takeWithCancellableByIdSaga(actionType: string, task: any, getId: any): SagaIterator {
  let lastTasks: { [key: ID]: any[] } = {};
  while (true) {
    const action: Redux.Action = yield take(actionType);
    if (!isNil(action.payload)) {
      const actionId = getId(action.payload);
      if (isNil(lastTasks[actionId])) {
        lastTasks[actionId] = [];
      }
      // If there were any previously submitted tasks to delete the same group,
      // cancel them.
      if (lastTasks[actionId].length !== 0) {
        const cancellable = lastTasks[actionId];
        lastTasks = { ...lastTasks, [actionId]: [] };
        yield cancel(cancellable);
      }
      const forkedTask = yield fork(task, action);
      lastTasks[actionId].push(forkedTask);
    }
  }
}

export function takeWithCancellableById<P>(actionType: string, task: Redux.Task<P>, getId: (payload: P) => ID) {
  return call(takeWithCancellableByIdSaga, actionType, task, getId);
}

export const createListResponseSaga = (config: Redux.SagaConfig<Redux.ListResponseTaskMap, { request: null }>) => {
  function* requestSaga(): SagaIterator {
    let lastTasks;
    while (true) {
      const action = yield take(config.actions.request.toString());
      if (lastTasks) {
        yield cancel(lastTasks);
      }
      lastTasks = yield call(config.tasks.request, action);
    }
  }
  function* rootSaga(): SagaIterator {
    yield spawn(requestSaga);
  }
  return rootSaga;
};

export const createModelListResponseSaga = <M extends Model.Model>(
  config: Redux.SagaConfig<Redux.ModelListResponseTaskMap, Pick<Redux.ModelListResponseActionMap<M>, "request">>
) => {
  function* requestSaga(): SagaIterator {
    let lastTasks;
    while (true) {
      const action = yield take(config.actions.request.toString());
      if (lastTasks) {
        yield cancel(lastTasks);
      }
      lastTasks = yield call(config.tasks.request, action);
    }
  }
  function* rootSaga(): SagaIterator {
    yield spawn(requestSaga);
  }
  return rootSaga;
};
