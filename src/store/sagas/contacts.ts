import axios from "axios";
import { SagaIterator } from "redux-saga";
import { all, put, call, cancelled, fork } from "redux-saga/effects";
import { map, isNil } from "lodash";

import * as api from "api";
import { tabling } from "lib";
import { getContactsTask } from "store/tasks";
import { actions } from "store";

type R = Tables.ContactRow;
type M = Model.Contact;
type P = Http.ContactPayload;

export const createReadOnlyContactsTaskSet = (): Redux.ReadOnlyTableTaskMap<R, M> => {
  return { request: getContactsTask };
};

export const createContactsTaskSet = (): Redux.TableTaskMap<R, M> => {
  function* bulkCreateTask(e: Table.RowAddEvent<R, M>, errorMessage: string): SagaIterator {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();

    const requestPayload: Http.BulkCreatePayload<P> = tabling.util.createBulkCreatePayload<R, M, P>(e.payload);
    yield put(actions.authenticated.creatingContactAction(true));
    try {
      const response: Http.BulkCreateResponse<M> = yield call(api.bulkCreateContacts, requestPayload, {
        cancelToken: source.token
      });
      yield all(response.data.map((contact: M) => put(actions.authenticated.addContactToStateAction(contact))));
    } catch (err) {
      if (!(yield cancelled())) {
        api.handleRequestError(err, errorMessage);
      }
    } finally {
      yield put(actions.authenticated.creatingContactAction(false));
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
        put(actions.authenticated.updatingContactAction({ id: p.id, value: true }))
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
          put(actions.authenticated.updatingContactAction({ id: p.id, value: false }))
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
      yield all(ids.map((id: number) => put(actions.authenticated.deletingContactAction({ id, value: true }))));
      try {
        yield call(api.bulkDeleteContacts, ids, { cancelToken: source.token });
      } catch (err) {
        if (!(yield cancelled())) {
          api.handleRequestError(err, errorMessage);
        }
      } finally {
        yield all(ids.map((id: number) => put(actions.authenticated.deletingContactAction({ id, value: false }))));
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
    ...createReadOnlyContactsTaskSet(),
    handleRowAddEvent: handleRowAddEvent,
    handleRowDeleteEvent: handleRowDeleteEvent,
    handleDataChangeEvent: handleDataChangeEvent
  };
};
