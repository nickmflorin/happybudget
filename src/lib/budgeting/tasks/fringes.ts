import axios from "axios";
import { SagaIterator } from "redux-saga";
import { put, call, cancelled, fork, select, all } from "redux-saga/effects";
import { map, isNil } from "lodash";

import * as api from "api";
import * as tabling from "../../tabling";
import * as util from "../../util";

type R = Tables.FringeRowData;
type M = Model.Fringe;
type P = Http.FringePayload;

export interface FringeServiceSet {
  request: (id: ID, query: Http.ListQuery, options: Http.RequestOptions) => Promise<Http.ListResponse<M>>;
}

export type FringesTableActionMap<B extends Model.Template | Model.Budget> = Redux.AuthenticatedTableActionMap<R, M> & {
  readonly loadingBudget: boolean;
  readonly updateBudgetInState: Redux.UpdateActionPayload<B>;
  readonly responseFringeColors: Http.ListResponse<string>;
};

export type FringeTableServiceSet<B extends Model.Template | Model.Budget> = FringeServiceSet & {
  bulkDelete: (id: ID, ids: ID[], options: Http.RequestOptions) => Promise<Http.BulkModelResponse<B>>;
  bulkUpdate: (
    id: ID,
    data: Http.BulkUpdatePayload<Http.FringePayload>,
    options: Http.RequestOptions
  ) => Promise<Http.BulkModelResponse<B>>;
  bulkCreate: (
    id: ID,
    p: Http.BulkCreatePayload<P>,
    options: Http.RequestOptions
  ) => Promise<Http.BulkCreateChildrenResponse<B, Model.Fringe>>;
};

export type FringesTaskConfig = Redux.TaskConfig<{ loading: boolean; response: Http.ListResponse<Model.Fringe> }> & {
  readonly services: FringeServiceSet;
  readonly selectObjId: (state: Application.Authenticated.Store) => number | null;
};

export type FringesTableTaskConfig<B extends Model.Template | Model.Budget> = Table.TaskConfig<
  R,
  M,
  Model.Group,
  FringesTableActionMap<B>
> & {
  readonly services: FringeTableServiceSet<B>;
  readonly selectObjId: (state: Application.Authenticated.Store) => number | null;
};

export const createTableTaskSet = <B extends Model.Template | Model.Budget>(
  config: FringesTableTaskConfig<B>
): Partial<Redux.TaskMapObject<Redux.TableTaskMap<R, M>>> => {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();

  function* request(action: Redux.Action<null>): SagaIterator {
    const objId = yield select(config.selectObjId);
    if (!isNil(objId)) {
      yield put(config.actions.loading(true));
      try {
        yield all([call(requestFringes, objId), call(requestFringeColors)]);
      } catch (e: unknown) {
        if (!(yield cancelled())) {
          api.handleRequestError(e as Error, "There was an error retrieving the table data.");
          yield put(config.actions.response({ models: { count: 0, data: [] }, groups: { count: 0, data: [] } }));
        }
      } finally {
        yield put(config.actions.loading(false));
        if (yield cancelled()) {
          source.cancel();
        }
      }
    }
  }

  function* requestFringes(objId: number): SagaIterator {
    const response: Http.ListResponse<M> = yield call(
      config.services.request,
      objId,
      { no_pagination: true },
      { cancelToken: source.token }
    );
    yield put(config.actions.response({ models: response, groups: { count: 0, data: [] } }));
    if (response.data.length === 0) {
      const event: Table.RowAddEvent<R, M> = {
        type: "rowAdd",
        payload: [
          { id: `placeholder-${util.generateRandomNumericId()}`, data: {} },
          { id: `placeholder-${util.generateRandomNumericId()}`, data: {} }
        ]
      };
      // Tag the event as artificial so it does not re-trigger this same task.
      yield put({ type: config.actions.tableChanged.toString(), payload: { ...event, artificial: true } });
      yield fork(bulkCreateTask, objId, event, "There was an error creating the rows.");
    }
  }

  function* requestFringeColors(): SagaIterator {
    const response = yield call(api.getFringeColors, { cancelToken: source.token });
    yield put(config.actions.responseFringeColors(response));
  }

  function* bulkCreateTask(objId: number, e: Table.RowAddEvent<R, M>, errorMessage: string): SagaIterator {
    const requestPayload: Http.BulkCreatePayload<P> = tabling.http.createBulkCreatePayload<R, P, M>(
      e.payload,
      config.columns
    );

    yield put(config.actions.saving(true));
    yield put(config.actions.loadingBudget(true));
    try {
      const response: Http.BulkCreateChildrenResponse<B, M> = yield call(
        config.services.bulkCreate,
        objId,
        requestPayload,
        { cancelToken: source.token }
      );
      yield put(config.actions.updateBudgetInState({ id: response.data.id, data: response.data }));
      // Note: We also have access to the updated budget here, we should use that.
      // Note: The logic in the reducer for activating the placeholder rows with real data relies on the
      // assumption that the models in the response are in the same order as the placeholder IDs.
      const placeholderIds: Table.PlaceholderRowId[] = map(
        Array.isArray(e.payload) ? e.payload : [e.payload],
        (rowAdd: Table.RowAdd<R, M>) => rowAdd.id
      );
      yield put(config.actions.addModelsToState({ placeholderIds: placeholderIds, models: response.children }));
    } catch (err: unknown) {
      if (!(yield cancelled())) {
        api.handleRequestError(err as Error, errorMessage);
      }
    } finally {
      yield put(config.actions.saving(false));
      yield put(config.actions.loadingBudget(false));
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }

  function* bulkUpdateTask(
    objId: number,
    e: Table.ChangeEvent<R, M>,
    requestPayload: Http.BulkUpdatePayload<P>,
    errorMessage: string
  ): SagaIterator {
    yield put(config.actions.saving(true));
    if (!tabling.typeguards.isGroupEvent(e)) {
      yield put(config.actions.loadingBudget(true));
    }
    try {
      const response: Http.BulkModelResponse<B> = yield call(config.services.bulkUpdate, objId, requestPayload, {
        cancelToken: source.token
      });
      yield put(config.actions.updateBudgetInState({ id: response.data.id, data: response.data }));
    } catch (err: unknown) {
      if (!(yield cancelled())) {
        api.handleRequestError(err as Error, errorMessage);
      }
    } finally {
      if (!tabling.typeguards.isGroupEvent(e)) {
        yield put(config.actions.loadingBudget(false));
      }
      yield put(config.actions.saving(false));
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }

  function* bulkDeleteTask(objId: number, e: Table.RowDeleteEvent<R, M>, errorMessage: string): SagaIterator {
    const ids = Array.isArray(e.payload.rows) ? e.payload.rows : [e.payload.rows];
    if (ids.length !== 0) {
      yield put(config.actions.saving(true));
      yield put(config.actions.loadingBudget(true));
      try {
        const response: Http.BulkModelResponse<B> = yield call(config.services.bulkDelete, objId, ids, {
          cancelToken: source.token
        });
        yield put(config.actions.updateBudgetInState({ id: response.data.id, data: response.data }));
      } catch (err: unknown) {
        if (!(yield cancelled())) {
          api.handleRequestError(err as Error, errorMessage);
        }
      } finally {
        yield put(config.actions.saving(false));
        yield put(config.actions.loadingBudget(false));
        if (yield cancelled()) {
          source.cancel();
        }
      }
    }
  }

  function* handleRowAddEvent(action: Redux.Action<Table.RowAddEvent<R, M>>): SagaIterator {
    const objId = yield select(config.selectObjId);
    if (!isNil(objId) && !isNil(action.payload)) {
      const e: Table.RowAddEvent<R, M> = action.payload;
      yield fork(bulkCreateTask, objId, e, "There was an error creating the fringes.");
    }
  }

  function* handleRowDeleteEvent(action: Redux.Action<Table.RowDeleteEvent<R, M>>): SagaIterator {
    const objId = yield select(config.selectObjId);
    if (!isNil(objId) && !isNil(action.payload)) {
      const e: Table.RowDeleteEvent<R, M> = action.payload;
      yield fork(bulkDeleteTask, objId, e, "There was an error deleting the fringes.");
    }
  }

  // ToDo: This is an EDGE case, but we need to do it for smooth operation - we need to filter out the
  // changes that correspond to placeholder rows.
  function* handleDataChangeEvent(action: Redux.Action<Table.DataChangeEvent<R, M>>): SagaIterator {
    const objId = yield select(config.selectObjId);
    if (!isNil(objId) && !isNil(action.payload)) {
      const e: Table.DataChangeEvent<R, M> = action.payload;
      const merged = tabling.events.consolidateTableChange<R, M>(e.payload);
      if (merged.length !== 0) {
        const requestPayload = tabling.http.createBulkUpdatePayload<R, P, M>(merged, config.columns);
        yield fork(bulkUpdateTask, objId, e, requestPayload, "There was an error updating the rows.");
      }
    }
  }

  return {
    request,
    handleDataChangeEvent,
    handleRowAddEvent,
    handleRowDeleteEvent
  };
};
