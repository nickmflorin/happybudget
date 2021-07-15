import axios from "axios";
import { isNil, includes } from "lodash";
import { SagaIterator } from "redux-saga";
import { call, put, select, cancelled } from "redux-saga/effects";

import * as api from "api";
import * as actions from "./actions";

export function* getContactsTask(action: Redux.Action<any>): SagaIterator {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  const query: Http.ListQuery = yield select((state: Modules.ApplicationStore) => {
    return {
      page: state.user.contacts.page,
      page_size: state.user.contacts.pageSize,
      search: state.user.contacts.search
    };
  });
  yield put(actions.loadingContactsAction(true));
  try {
    let response: Http.ListResponse<Model.Contact> = yield call(api.getContacts, query, { cancelToken: source.token });
    yield put(actions.responseContactsAction(response));
  } catch (e) {
    if (!(yield cancelled())) {
      api.handleRequestError(e, "There was an error retrieving the contacts.");
      yield put(actions.responseContactsAction({ count: 0, data: [] }, { error: e }));
    }
  } finally {
    yield put(actions.loadingContactsAction(false));
    if (yield cancelled()) {
      source.cancel();
    }
  }
}

export function* deleteContactTask(action: Redux.Action<number>): SagaIterator {
  if (!isNil(action.payload)) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    const deleting = yield select((state: Modules.ApplicationStore) => state.user.contacts.deleting);
    if (!includes(deleting, action.payload)) {
      yield put(actions.deletingContactAction({ id: action.payload, value: true }));
      try {
        yield call(api.deleteContact, action.payload, { cancelToken: source.token });
        yield put(actions.removeContactFromStateAction(action.payload));
      } catch (e) {
        if (!(yield cancelled())) {
          api.handleRequestError(e, "There was an error deleting the contact.");
        }
      } finally {
        yield put(actions.deletingContactAction({ id: action.payload, value: false }));
        if (yield cancelled()) {
          source.cancel();
        }
      }
    }
  }
}
