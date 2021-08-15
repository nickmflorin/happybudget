import axios from "axios";
import { SagaIterator } from "redux-saga";
import { all, put, call, cancelled, fork } from "redux-saga/effects";
import { map, isNil } from "lodash";

import * as api from "api";
import { tabling } from "lib";
import { actions } from "store";

type R = Tables.ContactRow;
type M = Model.Contact;
type P = Http.ContactPayload;

export function* getContactsTask(action: Redux.Action<any>): SagaIterator {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  yield put(actions.loadingContactsAction(true));
  try {
    const response: Http.ListResponse<Model.Contact> = yield call(api.getContacts, {}, { cancelToken: source.token });
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

const createContactsTaskMap = (): Redux.TableTaskMap<R, M> => {
  function* bulkCreateTask(e: Table.RowAddEvent<R, M>, errorMessage: string): SagaIterator {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();

    const requestPayload: Http.BulkCreatePayload<P> = tabling.util.createBulkCreatePayload<R, M, P>(e.payload);
    yield put(actions.creatingContactAction(true));
    try {
      const response: Http.BulkCreateResponse<M> = yield call(api.bulkCreateContacts, requestPayload, {
        cancelToken: source.token
      });
      yield all(response.data.map((contact: M) => put(actions.addContactToStateAction(contact))));
    } catch (err) {
      if (!(yield cancelled())) {
        api.handleRequestError(err, errorMessage);
      }
    } finally {
      yield put(actions.creatingContactAction(false));
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }

  function* bulkUpdateTask(
    e: Table.ChangeEvent<R, M>,
    requestPayload: Http.BulkUpdatePayload<P>[],
    errorMessage: string
  ): SagaIterator {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    yield all(
      requestPayload.map((p: Http.BulkUpdatePayload<P>) =>
        put(actions.updatingContactAction({ id: p.id, value: true }))
      )
    );
    try {
      yield call(api.bulkUpdateContacts, requestPayload, { cancelToken: source.token });
    } catch (err) {
      if (!(yield cancelled())) {
        api.handleRequestError(err, errorMessage);
      }
    } finally {
      yield all(
        requestPayload.map((p: Http.BulkUpdatePayload<P>) =>
          put(actions.updatingContactAction({ id: p.id, value: false }))
        )
      );
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }

  function* bulkDeleteTask(e: Table.RowDeleteEvent<R, M>, errorMessage: string): SagaIterator {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();

    const rows: R[] = Array.isArray(e.payload.rows) ? e.payload.rows : [e.payload.rows];
    if (rows.length !== 0) {
      const ids = map(rows, (row: R) => row.id);
      yield all(ids.map((id: number) => put(actions.deletingContactAction({ id, value: true }))));
      try {
        yield call(api.bulkDeleteContacts, ids, { cancelToken: source.token });
      } catch (err) {
        if (!(yield cancelled())) {
          api.handleRequestError(err, errorMessage);
        }
      } finally {
        yield all(ids.map((id: number) => put(actions.deletingContactAction({ id, value: false }))));
        if (yield cancelled()) {
          source.cancel();
        }
      }
    }
  }

  function* handleRowAddEvent(action: Redux.Action<Table.RowAddEvent<R, M>>): SagaIterator {
    if (!isNil(action.payload)) {
      const e: Table.RowAddEvent<R, M> = action.payload;
      yield fork(bulkCreateTask, e, "There was an error creating the contacts.");
    }
  }

  function* handleRowDeleteEvent(action: Redux.Action<Table.RowDeleteEvent<R, M>>): SagaIterator {
    if (!isNil(action.payload)) {
      const e: Table.RowDeleteEvent<R, M> = action.payload;
      yield fork(bulkDeleteTask, e, "There was an error deleting the contacts.");
    }
  }

  function* handleDataChangeEvent(action: Redux.Action<Table.DataChangeEvent<R, M>>): SagaIterator {
    if (!isNil(action.payload)) {
      const e: Table.DataChangeEvent<R, M> = action.payload;
      const merged = tabling.util.consolidateTableChange(e.payload);
      if (merged.length !== 0) {
        const requestPayload: Http.BulkUpdatePayload<P>[] = map(merged, (change: Table.RowChange<R, M>) => ({
          id: change.id,
          ...tabling.util.payload(change)
        }));
        yield fork(bulkUpdateTask, e, requestPayload, "There was an error updating the contacts.");
      }
    }
  }

  return {
    handleRowAddEvent: handleRowAddEvent,
    handleRowDeleteEvent: handleRowDeleteEvent,
    handleDataChangeEvent: handleDataChangeEvent,
    request: getContactsTask
  };
};

export default createContactsTaskMap;
