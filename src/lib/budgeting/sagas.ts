import { SagaIterator } from "redux-saga";
import { spawn, call, cancel, take } from "redux-saga/effects";

import * as redux from "../redux";

export const createCommentsListResponseSaga = (
  config: Redux.SagaConfig<Redux.CommentsListResponseTaskMap, Redux.CommentsListResponseActionMap>
) => {
  const baseSaga = redux.sagas.createModelListResponseSaga(config);

  function* submitSaga(): SagaIterator {
    let lastTasks;
    while (true) {
      const action = yield take(config.actions.submit.toString());
      if (lastTasks) {
        yield cancel(lastTasks);
      }
      lastTasks = yield call(config.tasks.submit, action);
    }
  }

  function* deleteSaga(): SagaIterator {
    yield redux.sagas.takeWithCancellableById<ID>(config.actions.delete.toString(), config.tasks.delete, (p: ID) => p);
  }

  function* editSaga(): SagaIterator {
    yield redux.sagas.takeWithCancellableById<Redux.UpdateActionPayload<Model.Comment>>(
      config.actions.edit.toString(),
      config.tasks.edit,
      (p: Redux.UpdateActionPayload<Model.Comment>) => p.id
    );
  }

  function* rootSaga(): SagaIterator {
    yield spawn(baseSaga);
    yield spawn(submitSaga);
    yield spawn(deleteSaga);
    yield spawn(editSaga);
  }
  return rootSaga;
};
