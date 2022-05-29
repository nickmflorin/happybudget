import { SagaIterator } from "redux-saga";
import { take, cancel, call, spawn, debounce } from "redux-saga/effects";
import { isNil } from "lodash";
import { Optional } from "utility-types";

export const convertContextTaskToTask = <
  P extends Redux.ActionPayload = Redux.ActionPayload,
  C extends Redux.ActionContext = Redux.ActionContext
>(
  contextTask: Redux.ContextTask<C>
): Redux.Task<P, C> => {
  function* task(action: Redux.Action<P, C>): SagaIterator {
    yield call(contextTask, action.context);
  }
  return task;
};

export const createListSaga = <T, C extends Redux.ActionContext = Redux.ActionContext>(
  config: Redux.SagaConfig<Redux.ListTaskMap<C>, Pick<Redux.ListActionCreatorMap<T, C>, "request">, C>
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

export const createModelListSaga = <M extends Model.HttpModel, C extends Redux.ActionContext = Redux.ActionContext>(
  config: Redux.SagaConfig<Redux.ModelListTaskMap<C>, Pick<Redux.ModelListActionCreatorMap<M, C>, "request">, C>
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

export const createAuthenticatedModelListSaga = <
  M extends Model.HttpModel,
  C extends Redux.ActionContext = Redux.ActionContext
>(
  config: Redux.SagaConfig<
    Redux.ModelListTaskMap,
    Optional<Pick<Redux.AuthenticatedModelListActionCreatorMap<M, C>, "setSearch" | "request">, "setSearch">,
    C
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
