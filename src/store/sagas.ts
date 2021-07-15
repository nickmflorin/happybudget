import { SagaIterator, Saga } from "redux-saga";
import { spawn, takeLatest, debounce, takeEvery, select, take, put } from "redux-saga/effects";
import { isNil, includes } from "lodash";
import * as actions from "./actions";
import * as tasks from "./tasks";

function* watchForContactsRefreshSaga(): SagaIterator {
  yield takeLatest(
    [
      actions.ApplicationActionTypes.User.Contacts.Request,
      actions.ApplicationActionTypes.User.Contacts.SetPage,
      actions.ApplicationActionTypes.User.Contacts.SetPageSize,
      actions.ApplicationActionTypes.User.Contacts.SetPageAndSize
    ],
    tasks.getContactsTask
  );
}

function* watchForSearchContactsSaga(): SagaIterator {
  yield debounce(250, actions.ApplicationActionTypes.User.Contacts.SetSearch, tasks.getContactsTask);
}

function* watchForDeleteContactSaga(): SagaIterator {
  yield takeEvery(actions.ApplicationActionTypes.User.Contacts.Delete, tasks.deleteContactTask);
}

function* watchForDeleteContactsSaga(): SagaIterator {
  while (true) {
    const action: Redux.Action<number[]> = yield take(actions.ApplicationActionTypes.User.Contacts.DeleteMultiple);
    if (!isNil(action.payload)) {
      /* eslint-disable no-loop-func */
      const deleting = yield select((state: Modules.ApplicationStore) => state.user.contacts.deleting);
      for (let i = 0; i < action.payload.length; i++) {
        const id: number = action.payload[i];
        if (!includes(deleting, id)) {
          yield put(actions.deleteContactAction(id));
        }
      }
    }
  }
}

function* ContactsRootSaga(): SagaIterator {
  yield spawn(watchForContactsRefreshSaga);
  yield spawn(watchForSearchContactsSaga);
  yield spawn(watchForDeleteContactSaga);
  yield spawn(watchForDeleteContactsSaga);
}

export function* RootSaga(): SagaIterator {
  yield spawn(ContactsRootSaga);
}

const createApplicationSaga = (config: Modules.ApplicationConfig): Saga => {
  function* applicationSaga(): SagaIterator {
    for (var i = 0; i < config.length; i++) {
      const moduleConfig: Modules.ModuleConfig<any, any> = config[i];
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
