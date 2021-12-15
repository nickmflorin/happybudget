import { SagaIterator } from "redux-saga";
import { put, fork, select } from "redux-saga/effects";
import { filter } from "lodash";

import * as api from "api";
import * as actions from "../actions";
import { tabling, notifications } from "lib";

type R = Tables.ContactRowData;
type M = Model.Contact;
type P = Http.ContactPayload;

export const createTaskSet = (config: { readonly authenticated: boolean }): Redux.ModelListResponseTaskMap => {
  function* request(action: Redux.Action<null>): SagaIterator {
    yield put(actions.loadingContactsAction(true));
    try {
      const response: Http.ListResponse<M> = yield api.request(api.getContacts, {});
      yield put(actions.responseContactsAction(response));
      if (config.authenticated) {
        yield put(actions.authenticated.responseFilteredContactsAction(response));
      }
    } catch (e: unknown) {
      notifications.requestError(e as Error, { message: "There was an error retrieving the contacts." });
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

export const createFilteredTaskSet = (): Redux.ModelListResponseTaskMap => {
  function* request(action: Redux.Action<null>): SagaIterator {
    yield put(actions.authenticated.loadingFilteredContactsAction(true));
    let query: Http.ListQuery = yield select((state: Application.Authenticated.Store) => ({
      search: state.filteredContacts.search
    }));
    try {
      const response: Http.ListResponse<M> = yield api.request(api.getContacts, query);
      yield put(actions.authenticated.responseFilteredContactsAction(response));
    } catch (e: unknown) {
      notifications.requestError(e as Error, { message: "There was an error retrieving the contacts." });
      yield put(actions.authenticated.responseFilteredContactsAction({ count: 0, data: [] }));
    } finally {
      yield put(actions.authenticated.loadingFilteredContactsAction(false));
    }
  }
  return { request };
};

export const createTableTaskSet = (
  config: Table.TaskConfig<R, M, Redux.AuthenticatedTableActionMap<R, M>> & {
    readonly selectStore: (state: Application.Authenticated.Store) => Tables.ContactTableStore;
  }
): Redux.TableTaskMap<R> => {
  function* tableRequest(action: Redux.Action): SagaIterator {
    yield put(config.actions.loading(true));
    try {
      const response: Http.ListResponse<M> = yield api.request(api.getContacts, {});
      yield put(config.actions.response({ models: response.data }));
    } catch (e: unknown) {
      notifications.requestError(e as Error, { message: "There was an error retrieving the contacts." });
      yield put(config.actions.response({ models: [] }));
    } finally {
      yield put(config.actions.loading(false));
    }
  }

  const bulkCreateTask: Redux.TableBulkCreateTask<R, []> = tabling.tasks.createBulkTask<
    R,
    M,
    Tables.ContactTableStore,
    P,
    Http.BulkModelResponse<M>
  >({
    columns: config.columns,
    selectStore: config.selectStore,
    loadingActions: [config.actions.saving],
    responseActions: (r: Http.BulkModelResponse<M>, e: Table.RowAddEvent<R>) => [
      config.actions.addModelsToState({ placeholderIds: e.placeholderIds, models: r.data })
    ],
    bulkCreate: () => [api.bulkCreateContacts]
  });

  function* bulkUpdateTask(
    e: Table.ChangeEvent<R, M>,
    requestPayload: Http.BulkUpdatePayload<P>,
    errorMessage: string
  ): SagaIterator {
    yield put(config.actions.saving(true));
    try {
      yield api.request(api.bulkUpdateContacts, requestPayload);
    } catch (err: unknown) {
      notifications.requestError(err as Error, { message: errorMessage });
    } finally {
      yield put(config.actions.saving(false));
    }
  }

  function* bulkDeleteTask(ids: number[], errorMessage: string): SagaIterator {
    yield put(config.actions.saving(true));
    try {
      yield api.request(api.bulkDeleteContacts, ids);
    } catch (err: unknown) {
      notifications.requestError(err as Error, { message: errorMessage });
    } finally {
      yield put(config.actions.saving(false));
    }
  }

  function* handleRowInsertEvent(e: Table.RowInsertEvent<R>): SagaIterator {
    yield put(config.actions.saving(true));
    try {
      const response: M = yield api.request(api.createContact, {
        previous: e.payload.previous,
        ...tabling.http.postPayload(e.payload.data, config.columns)
      });
      yield put(
        config.actions.tableChanged({
          type: "modelAdded",
          payload: { model: response }
        })
      );
    } catch (err: unknown) {
      notifications.requestError(err as Error, { message: "There was an error adding the row." });
    } finally {
      yield put(config.actions.saving(false));
    }
  }

  function* handleRowPositionChangedEvent(e: Table.RowPositionChangedEvent): SagaIterator {
    yield put(config.actions.saving(true));
    try {
      const response: M = yield api.request(api.updateContact, e.payload.id, {
        previous: e.payload.previous
      });
      yield put(
        config.actions.tableChanged({
          type: "modelUpdated",
          payload: { model: response }
        })
      );
    } catch (err: unknown) {
      notifications.requestError(err as Error, { message: "There was an error moving the row." });
    } finally {
      yield put(config.actions.saving(false));
    }
  }

  function* handleRowAddEvent(e: Table.RowAddEvent<R>): SagaIterator {
    yield fork(bulkCreateTask, e, "There was an error creating the rows.");
  }

  function* handleRowDeleteEvent(e: Table.RowDeleteEvent): SagaIterator {
    const ids: Table.RowId[] = Array.isArray(e.payload.rows) ? e.payload.rows : [e.payload.rows];
    const modelRowIds = filter(ids, (id: Table.RowId) => tabling.typeguards.isModelRowId(id)) as number[];
    if (modelRowIds.length !== 0) {
      yield fork(bulkDeleteTask, modelRowIds, "There was an error deleting the rows.");
    }
  }

  function* handleDataChangeEvent(e: Table.DataChangeEvent<R, Table.ModelRowId>): SagaIterator {
    const merged = tabling.events.consolidateRowChanges(e.payload);
    if (merged.length !== 0) {
      const requestPayload = tabling.http.createBulkUpdatePayload<R, P, M>(merged, config.columns);
      if (requestPayload.data.length !== 0) {
        yield fork(bulkUpdateTask, e, requestPayload, "There was an error updating the rows.");
      }
    }
  }

  return {
    request: tableRequest,
    handleChangeEvent: tabling.tasks.createChangeEventHandler({
      rowAdd: handleRowAddEvent,
      rowInsert: handleRowInsertEvent,
      rowDelete: handleRowDeleteEvent,
      rowPositionChanged: handleRowPositionChangedEvent,
      /* It is safe to assume that the ID of the row for which data is being
			   changed will always be a ModelRowId - but we have to force coerce that
				 here. */
      dataChange: handleDataChangeEvent as Redux.TableEventTask<Table.DataChangeEvent<R>>
    })
  };
};
