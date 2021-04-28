import { SagaIterator } from "redux-saga";
import { take, cancel, fork, call } from "redux-saga/effects";
import { isNil } from "lodash";

function* takeWithCancellableByIdSaga(actionType: string, task: any, getId: any): SagaIterator {
  let lastTasks: { [key: number]: any[] } = {};
  while (true) {
    const action: Redux.Action<any> = yield take(actionType);
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

export function takeWithCancellableById<P>(actionType: string, task: Redux.Task<P>, getId: (payload: P) => number) {
  return call(takeWithCancellableByIdSaga, actionType, task, getId);
}
