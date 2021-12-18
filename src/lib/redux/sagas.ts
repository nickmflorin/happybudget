import { SagaIterator } from "redux-saga";
import { take, cancel, call, spawn, debounce } from "redux-saga/effects";
import { isNil } from "lodash";

export const createListResponseSaga = <P extends Redux.ActionPayload = null>(
  config: Redux.SagaConfig<Redux.ListResponseTaskMap<P>, { request: Redux.ActionCreator<P> }>
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

export const createModelListResponseSaga = <M extends Model.HttpModel, P extends Redux.ActionPayload = null>(
  config: Redux.SagaConfig<Redux.ModelListResponseTaskMap<P>, Pick<Redux.ModelListResponseActionMap<M>, "request">>
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

export const createAuthenticatedModelListResponseSaga = <
  M extends Model.HttpModel,
  P extends Redux.ActionPayload = null
>(
  config: Redux.SagaConfig<
    Redux.ModelListResponseTaskMap,
    Pick<Redux.AuthenticatedModelListResponseActionMap<M, P>, "request" | "setSearch">
  >
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

  function* watchForSearchSaga(): SagaIterator {
    if (!isNil(config.actions.setSearch)) {
      yield debounce(250, config.actions.setSearch.toString(), config.tasks.request);
    }
  }

  function* rootSaga(): SagaIterator {
    yield spawn(requestSaga);
    yield spawn(watchForSearchSaga);
  }
  return rootSaga;
};
