import { SagaIterator } from "redux-saga";
import { spawn, take, call, cancel, takeEvery } from "redux-saga/effects";
import { isNil } from "lodash";
import { takeWithCancellableById } from "lib/redux/sagas";

type MapConfig<T> = {
  task: Redux.ActionTask<T>;
  actionType: string;
};

interface ActionMap<R extends Table.Row<G>, G extends Model.Group = Model.Group> {
  Request: MapConfig<null>;
  RequestGroups: MapConfig<null>;
  RequestComments?: MapConfig<null>;
  RequestHistory?: MapConfig<null>;
  BulkUpdate: MapConfig<Table.RowChange<R>[]>;
  BulkCreate: MapConfig<number>;
  Delete: MapConfig<number>;
  Update: MapConfig<Table.RowChange<R>>;
  SubmitComment?: MapConfig<{ parent?: number; data: Http.CommentPayload }>;
  DeleteComment?: MapConfig<number>;
  EditComment?: MapConfig<Redux.UpdateModelActionPayload<Model.Comment>>;
  DeleteGroup: MapConfig<number>;
  RemoveModelFromGroup: MapConfig<number>;
}

export const createStandardSaga = <R extends Table.Row<G>, G extends Model.Group = Model.Group>(
  map: ActionMap<R, G>,
  ...args: (() => SagaIterator)[]
) => {
  function* watchForRequestModelsSaga(): SagaIterator {
    let lastTasks;
    while (true) {
      const action = yield take(map.Request.actionType);
      if (lastTasks) {
        yield cancel(lastTasks);
      }
      lastTasks = yield call(map.Request.task, action);
    }
  }

  function* watchForRequestGroupsSaga(): SagaIterator {
    let lastTasks;
    while (true) {
      const action = yield take(map.RequestGroups.actionType);
      if (lastTasks) {
        yield cancel(lastTasks);
      }
      lastTasks = yield call(map.RequestGroups.task, action);
    }
  }

  function* watchForBulkUpdateModelsSaga(): SagaIterator {
    yield takeEvery(map.BulkUpdate.actionType, map.BulkUpdate.task);
  }

  function* watchForBulkCreateModelsSaga(): SagaIterator {
    let lastTasks;
    while (true) {
      const action: Redux.Action<number> = yield take(map.BulkCreate.actionType);
      if (!isNil(action.payload)) {
        if (lastTasks) {
          yield cancel(lastTasks);
        }
        lastTasks = yield call(map.BulkCreate.task, action);
      }
    }
  }

  function* watchForRemoveModelSaga(): SagaIterator {
    yield takeWithCancellableById<number>(map.Delete.actionType, map.Delete.task, (p: number) => p);
  }

  function* watchForUpdateModelSaga(): SagaIterator {
    yield takeEvery(map.Update.actionType, map.Update.task);
  }

  function* watchForRequestCommentsSaga(): SagaIterator {
    if (!isNil(map.RequestComments)) {
      let lastTasks;
      while (true) {
        const action = yield take(map.RequestComments.actionType);
        if (lastTasks) {
          yield cancel(lastTasks);
        }
        lastTasks = yield call(map.RequestComments.task, action);
      }
    }
  }

  function* watchForSubmitCommentSaga(): SagaIterator {
    if (!isNil(map.SubmitComment)) {
      let lastTasks;
      while (true) {
        const action = yield take(map.SubmitComment.actionType);
        if (lastTasks) {
          yield cancel(lastTasks);
        }
        lastTasks = yield call(map.SubmitComment.task, action);
      }
    }
  }

  function* watchForRemoveCommentSaga(): SagaIterator {
    if (!isNil(map.DeleteComment)) {
      yield takeWithCancellableById<number>(map.DeleteComment.actionType, map.DeleteComment.task, (p: number) => p);
    }
  }

  function* watchForEditCommentSaga(): SagaIterator {
    if (!isNil(map.EditComment)) {
      yield takeWithCancellableById<Redux.UpdateModelActionPayload<Model.Comment>>(
        map.EditComment.actionType,
        map.EditComment.task,
        (p: Redux.UpdateModelActionPayload<Model.Comment>) => p.id
      );
    }
  }

  function* watchForRequestHistorySaga(): SagaIterator {
    if (!isNil(map.RequestHistory)) {
      let lastTasks;
      while (true) {
        const action = yield take(map.RequestHistory.actionType);
        if (lastTasks) {
          yield cancel(lastTasks);
        }
        lastTasks = yield call(map.RequestHistory.task, action);
      }
    }
  }

  function* watchForDeleteGroupSaga(): SagaIterator {
    yield takeWithCancellableById<number>(map.DeleteGroup.actionType, map.DeleteGroup.task, (p: number) => p);
  }

  function* watchForRemoveAccountFromGroupSaga(): SagaIterator {
    yield takeWithCancellableById<number>(
      map.RemoveModelFromGroup.actionType,
      map.RemoveModelFromGroup.task,
      (p: number) => p
    );
  }

  function* rootSaga(): SagaIterator {
    yield spawn(watchForRequestModelsSaga);
    yield spawn(watchForRequestGroupsSaga);
    yield spawn(watchForBulkUpdateModelsSaga);
    yield spawn(watchForRemoveModelSaga);
    yield spawn(watchForUpdateModelSaga);
    yield spawn(watchForRequestCommentsSaga);
    yield spawn(watchForSubmitCommentSaga);
    yield spawn(watchForRemoveCommentSaga);
    yield spawn(watchForEditCommentSaga);
    yield spawn(watchForBulkCreateModelsSaga);
    yield spawn(watchForRequestHistorySaga);
    yield spawn(watchForDeleteGroupSaga);
    yield spawn(watchForRemoveAccountFromGroupSaga);
    for (let i = 0; i < args.length; i++) {
      yield spawn(args[i]);
    }
  }
  return rootSaga;
};
