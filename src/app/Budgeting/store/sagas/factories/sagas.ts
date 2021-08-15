import { SagaIterator } from "redux-saga";
import { spawn, take, call, cancel } from "redux-saga/effects";
import { isNil } from "lodash";

import { redux } from "lib";

interface CommentsActionMap {
  Request: string;
  Submit: string;
  Delete: string;
  Edit: string;
}

interface HistoryActionMap {
  Request: string;
}

type ActionMap = Redux.BudgetTableSideEffectActionMap & {
  Comments?: CommentsActionMap;
  History?: HistoryActionMap;
};

type CommentsTaskMap = {
  readonly request: Redux.Task<null>;
  readonly submit: Redux.Task<{ parent?: number; data: Http.CommentPayload }>;
  readonly delete: Redux.Task<number>;
  readonly edit: Redux.Task<Redux.UpdateModelActionPayload<Model.Comment>>;
};

type HistoryTaskMap = {
  readonly request: Redux.Task<null>;
};

type TaskMap<R extends Table.Row, M extends Model.Model> = Redux.BudgetTableTaskMap<R, M> & {
  readonly history?: HistoryTaskMap;
  readonly comments?: CommentsTaskMap;
};

const createStandardCommentsSaga = (actions: CommentsActionMap, tasks: CommentsTaskMap) => {
  function* requestSaga(): SagaIterator {
    if (!isNil(actions.Request)) {
      let lastTasks;
      while (true) {
        const action = yield take(actions.Request);
        if (lastTasks) {
          yield cancel(lastTasks);
        }
        lastTasks = yield call(tasks.request, action);
      }
    }
  }

  function* submitSaga(): SagaIterator {
    if (!isNil(actions.Submit)) {
      let lastTasks;
      while (true) {
        const action = yield take(actions.Submit);
        if (lastTasks) {
          yield cancel(lastTasks);
        }
        lastTasks = yield call(tasks.submit, action);
      }
    }
  }

  function* deleteSaga(): SagaIterator {
    if (!isNil(actions.Delete)) {
      yield redux.sagas.takeWithCancellableById<number>(actions.Delete, tasks.delete, (p: number) => p);
    }
  }

  function* editSaga(): SagaIterator {
    if (!isNil(actions.Edit)) {
      yield redux.sagas.takeWithCancellableById<Redux.UpdateModelActionPayload<Model.Comment>>(
        actions.Edit,
        tasks.edit,
        (p: Redux.UpdateModelActionPayload<Model.Comment>) => p.id
      );
    }
  }

  function* rootSaga(): SagaIterator {
    yield spawn(requestSaga);
    yield spawn(submitSaga);
    yield spawn(deleteSaga);
    yield spawn(editSaga);
  }
  return rootSaga;
};

export const createStandardSaga = <R extends Table.Row, M extends Model.Model>(
  actions: ActionMap,
  tasks: TaskMap<R, M>,
  ...args: (() => SagaIterator)[]
) => {
  const tableSaga = redux.sagas.factories.createBudgetTableSaga(actions, tasks);
  const groupsSaga = redux.sagas.factories.createStandardRequestSaga(actions.Groups.Request, tasks.requestGroups);

  function* rootSaga(): SagaIterator {
    yield spawn(tableSaga);
    yield spawn(groupsSaga);
    for (let i = 0; i < args.length; i++) {
      yield spawn(args[i]);
    }
    if (!isNil(actions.History) && !isNil(tasks.history)) {
      const requestHistorySaga = redux.sagas.factories.createStandardRequestSaga(
        actions.History.Request,
        tasks.history.request
      );
      yield spawn(requestHistorySaga);
    }
    if (!isNil(actions.Comments) && !isNil(tasks.comments)) {
      const commentsSaga = createStandardCommentsSaga(actions.Comments, tasks.comments);
      yield spawn(commentsSaga);
    }
  }
  return rootSaga;
};
