import axios from "axios";
import { SagaIterator } from "redux-saga";
import { put, call, cancelled, fork } from "redux-saga/effects";
import { map, isNil } from "lodash";

import * as api from "api";
import { tabling } from "lib";

import * as actions from "../actions";

type R = Tables.ContactRowData;
type M = Model.Contact;
type P = Http.ContactPayload;

export function* request(action: Redux.Action): SagaIterator {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  yield put(actions.loadingContactsAction(true));
  try {
    const response: Http.ListResponse<M> = yield call(api.getContacts, {}, { cancelToken: source.token });
    yield put(actions.responseContactsAction(response));
  } catch (e: unknown) {
    if (!(yield cancelled())) {
      api.handleRequestError(e as Error, "There was an error retrieving the contacts.");
      yield put(actions.responseContactsAction({ count: 0, data: [] }));
    }
  } finally {
    yield put(actions.loadingContactsAction(false));
    if (yield cancelled()) {
      source.cancel();
    }
  }
}

export const createTableTaskSet = (
  config: Table.TaskConfig<R, M, Model.Group, Redux.AuthenticatedTableActionMap<R, M, Model.Group>>
): Redux.TaskMapObject<Redux.TableTaskMap<R, M>> => {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();

  function* tableRequest(action: Redux.Action): SagaIterator {
    yield put(config.actions.loading(true));
    try {
      const response: Http.ListResponse<M> = yield call(api.getContacts, {}, { cancelToken: source.token });
      yield put(config.actions.response({ models: response, groups: { count: 0, data: [] } }));
    } catch (e: unknown) {
      if (!(yield cancelled())) {
        api.handleRequestError(e as Error, "There was an error retrieving the contacts.");
        yield put(config.actions.response({ models: { count: 0, data: [] }, groups: { count: 0, data: [] } }));
      }
    } finally {
      yield put(config.actions.loading(false));
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }

  function* bulkCreateTask(e: Table.RowAddEvent<R>, errorMessage: string): SagaIterator {
    const requestPayload: Http.BulkCreatePayload<P> = tabling.http.createBulkCreatePayload<R, P, M>(
      e.payload,
      config.columns
    );
    yield put(config.actions.saving(true));
    try {
      const response: Http.BulkCreateResponse<M> = yield call(api.bulkCreateContacts, requestPayload, {
        cancelToken: source.token
      });
      // Note: The logic in the reducer for activating the placeholder rows with real data relies on the
      // assumption that the models in the response are in the same order as the placeholder IDs.
      const placeholderIds: Table.PlaceholderRowId[] = map(
        Array.isArray(e.payload) ? e.payload : [e.payload],
        (rowAdd: Table.RowAdd<R>) => rowAdd.id
      );
      yield put(config.actions.addModelsToState({ placeholderIds: placeholderIds, models: response.data }));
    } catch (err: unknown) {
      if (!(yield cancelled())) {
        api.handleRequestError(err as Error, errorMessage);
      }
    } finally {
      yield put(config.actions.saving(false));
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }

  function* bulkUpdateTask(
    e: Table.ChangeEvent<R, M>,
    requestPayload: Http.BulkUpdatePayload<P>,
    errorMessage: string
  ): SagaIterator {
    yield put(config.actions.saving(true));
    try {
      yield call(api.bulkUpdateContacts, requestPayload, { cancelToken: source.token });
    } catch (err: unknown) {
      if (!(yield cancelled())) {
        api.handleRequestError(err as Error, errorMessage);
      }
    } finally {
      yield put(config.actions.saving(false));
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }

  function* bulkDeleteTask(e: Table.RowDeleteEvent<R, M>, errorMessage: string): SagaIterator {
    const ids = Array.isArray(e.payload.rows) ? e.payload.rows : [e.payload.rows];
    if (ids.length !== 0) {
      yield put(config.actions.saving(true));
      try {
        yield call(api.bulkDeleteContacts, ids, { cancelToken: source.token });
      } catch (err: unknown) {
        if (!(yield cancelled())) {
          api.handleRequestError(err as Error, errorMessage);
        }
      } finally {
        yield put(config.actions.saving(false));
        if (yield cancelled()) {
          source.cancel();
        }
      }
    }
  }

  function* handleRowAddEvent(action: Redux.Action<Table.RowAddEvent<R>>): SagaIterator {
    if (!isNil(action.payload)) {
      const e: Table.RowAddEvent<R> = action.payload;
      yield fork(bulkCreateTask, e, "There was an error creating the rows.");
    }
  }

  function* handleRowDeleteEvent(action: Redux.Action<Table.RowDeleteEvent<R, M>>): SagaIterator {
    if (!isNil(action.payload)) {
      const e: Table.RowDeleteEvent<R, M> = action.payload;
      yield fork(bulkDeleteTask, e, "There was an error deleting the rows.");
    }
  }

  // ToDo: This is an EDGE case, but we need to do it for smooth operation - we need to filter out the
  // changes that correspond to placeholder rows.
  function* handleDataChangeEvent(action: Redux.Action<Table.DataChangeEvent<R, M>>): SagaIterator {
    if (!isNil(action.payload)) {
      const e: Table.DataChangeEvent<R, M> = action.payload;
      const merged = tabling.events.consolidateTableChange(e.payload);
      if (merged.length !== 0) {
        const requestPayload = tabling.http.createBulkUpdatePayload<R, P, M>(merged, config.columns);
        yield fork(bulkUpdateTask, e, requestPayload, "There was an error updating the rows.");
      }
    }
  }

  return {
    request: tableRequest,
    handleRowAddEvent,
    handleRowDeleteEvent,
    handleDataChangeEvent
  };
};
