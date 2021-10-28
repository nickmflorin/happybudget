import { SagaIterator } from "redux-saga";
import { put, fork, select } from "redux-saga/effects";
import { map, isNil, filter } from "lodash";

import * as api from "api";
import * as actions from "../actions";
import { tabling, notifications } from "lib";

type R = Tables.ContactRowData;
type M = Model.Contact;
type P = Http.ContactPayload;

export const createTaskSet = (config: {
  readonly authenticated: boolean;
}): Redux.TaskMapObject<Redux.ModelListResponseTaskMap> => {
  function* request(action: Redux.Action<null>): SagaIterator {
    yield put(actions.loadingContactsAction(true));
    try {
      const response: Http.ListResponse<M> = yield api.request(api.getContacts);
      yield put(actions.responseContactsAction(response));
      if (config.authenticated) {
        yield put(actions.authenticated.responseFilteredContactsAction(response));
      }
    } catch (e: unknown) {
      notifications.requestError(e as Error, "There was an error retrieving the contacts.");
      yield put(actions.responseContactsAction({ count: 0, data: [] }));
      if (config.authenticated) {
        yield put(actions.authenticated.responseFilteredContactsAction({ count: 0, data: [] }));
      }
    } finally {
      yield put(actions.loadingContactsAction(false));
    }
  }
  return { request };
};

export const createFilteredTaskSet = (): Redux.TaskMapObject<Redux.ModelListResponseTaskMap> => {
  function* request(action: Redux.Action<null>): SagaIterator {
    yield put(actions.authenticated.loadingFilteredContactsAction(true));
    let query: Http.ListQuery = yield select((state: Application.Authenticated.Store) => ({
      search: state.filteredContacts.search
    }));
    try {
      const response: Http.ListResponse<M> = yield api.request(api.getContacts, query);
      yield put(actions.authenticated.responseFilteredContactsAction(response));
    } catch (e: unknown) {
      notifications.requestError(e as Error, "There was an error retrieving the contacts.");
      yield put(actions.authenticated.responseFilteredContactsAction({ count: 0, data: [] }));
    } finally {
      yield put(actions.authenticated.loadingFilteredContactsAction(false));
    }
  }
  return { request };
};

export const createTableTaskSet = (
  config: Table.TaskConfig<R, M, Redux.AuthenticatedTableActionMap<R, M>>
): Redux.TaskMapObject<Redux.TableTaskMap<R>> => {
  function* tableRequest(action: Redux.Action): SagaIterator {
    yield put(config.actions.loading(true));
    try {
      const response: Http.ListResponse<M> = yield api.request(api.getContacts, { no_pagination: true });
      yield put(config.actions.response({ models: response.data }));
    } catch (e: unknown) {
      notifications.requestError(e as Error, "There was an error retrieving the contacts.");
      yield put(config.actions.response({ models: [] }));
    } finally {
      yield put(config.actions.loading(false));
    }
  }

  function* bulkCreateTask(e: Table.RowAddEvent<R>, errorMessage: string): SagaIterator {
    const requestPayload: Http.BulkCreatePayload<P> = tabling.http.createBulkCreatePayload<R, P, M>(
      e.payload,
      config.columns
    );
    yield put(config.actions.saving(true));
    try {
      const response: Http.BulkModelResponse<M> = yield api.request(api.bulkCreateContacts, requestPayload);
      // Note: The logic in the reducer for activating the placeholder rows with real data relies on the
      // assumption that the models in the response are in the same order as the placeholder IDs.
      const placeholderIds: Table.PlaceholderRowId[] = map(
        Array.isArray(e.payload) ? e.payload : [e.payload],
        (rowAdd: Table.RowAdd<R>) => rowAdd.id
      );
      yield put(config.actions.addModelsToState({ placeholderIds: placeholderIds, models: response.data }));
    } catch (err: unknown) {
      notifications.requestError(err as Error, errorMessage);
    } finally {
      yield put(config.actions.saving(false));
    }
  }

  function* bulkUpdateTask(
    e: Table.ChangeEvent<R, M>,
    requestPayload: Http.BulkUpdatePayload<P>,
    errorMessage: string
  ): SagaIterator {
    yield put(config.actions.saving(true));
    try {
      yield api.request(api.bulkUpdateContacts, requestPayload);
    } catch (err: unknown) {
      notifications.requestError(err as Error, errorMessage);
    } finally {
      yield put(config.actions.saving(false));
    }
  }

  function* bulkDeleteTask(ids: number[], errorMessage: string): SagaIterator {
    yield put(config.actions.saving(true));
    try {
      yield api.request(api.bulkDeleteContacts, ids);
    } catch (err: unknown) {
      notifications.requestError(err as Error, errorMessage);
    } finally {
      yield put(config.actions.saving(false));
    }
  }

  function* handleRowAddEvent(action: Redux.Action<Table.RowAddEvent<R>>): SagaIterator {
    if (!isNil(action.payload)) {
      const e: Table.RowAddEvent<R> = action.payload;
      yield fork(bulkCreateTask, e, "There was an error creating the rows.");
    }
  }

  function* handleRowDeleteEvent(action: Redux.Action<Table.RowDeleteEvent>): SagaIterator {
    if (!isNil(action.payload)) {
      const e: Table.RowDeleteEvent = action.payload;
      const ids: Table.RowId[] = Array.isArray(e.payload.rows) ? e.payload.rows : [e.payload.rows];
      const modelRowIds = filter(ids, (id: Table.RowId) => tabling.typeguards.isModelRowId(id)) as number[];
      if (modelRowIds.length !== 0) {
        yield fork(bulkDeleteTask, modelRowIds, "There was an error deleting the rows.");
      }
    }
  }

  function* handleDataChangeEvent(action: Redux.Action<Table.DataChangeEvent<R>>): SagaIterator {
    if (!isNil(action.payload)) {
      const e = action.payload as Table.DataChangeEvent<R, Table.ModelRowId>;
      const merged = tabling.events.consolidateRowChanges(e.payload);
      if (merged.length !== 0) {
        const requestPayload = tabling.http.createBulkUpdatePayload<R, P, M>(merged, config.columns);
        yield fork(bulkUpdateTask, e, requestPayload, "There was an error updating the rows.");
      }
    }
  }

  return {
    request: tableRequest,
    handleChangeEvent: tabling.tasks.createChangeEventHandler({
      rowAdd: handleRowAddEvent,
      rowDelete: handleRowDeleteEvent,
      dataChange: handleDataChangeEvent
    })
  };
};
