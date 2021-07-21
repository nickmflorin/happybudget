import axios from "axios";
import { SagaIterator } from "redux-saga";
import { call, put, select, fork, cancelled, all } from "redux-saga/effects";
import { isNil, filter, includes, map } from "lodash";

import * as api from "api";

import { consolidateTableChange, createBulkCreatePayload, payload } from "lib/model/util";

type R = BudgetTable.FringeRow;
type M = Model.Fringe;

export interface FringeTasksActionMap {
  response: Redux.ActionCreator<Http.ListResponse<M>>;
  loading: Redux.ActionCreator<boolean>;
  deleting: Redux.ActionCreator<Redux.ModelListActionPayload>;
  creating: Redux.ActionCreator<boolean>;
  updating: Redux.ActionCreator<Redux.ModelListActionPayload>;
  addToState: Redux.ActionCreator<M>;
  requestBudget: Redux.ActionCreator<null>;
}

export interface FringeServiceSet<MB extends Model.Template | Model.Budget> {
  request: (id: number, query: Http.ListQuery, options: Http.RequestOptions) => Promise<Http.ListResponse<M>>;
  create: (id: number, p: Http.FringePayload, options: Http.RequestOptions) => Promise<M>;
  bulkDelete: (id: number, ids: number[], options: Http.RequestOptions) => Promise<MB>;
  bulkUpdate: (
    id: number,
    data: Http.BulkUpdatePayload<Http.FringePayload>[],
    options: Http.RequestOptions
  ) => Promise<MB>;
  bulkCreate: (id: number, p: Http.BulkCreatePayload<Http.FringePayload>, options: Http.RequestOptions) => Promise<M[]>;
}

export interface FringeTaskSet {
  getFringes: Redux.Task<null>;
  handleRowAddEvent: Redux.Task<Table.RowAddEvent<R, M>>;
  handleRowDeleteEvent: Redux.Task<Table.RowDeleteEvent<R, M>>;
  handleDataChangeEvent: Redux.Task<Table.DataChangeEvent<R, M>>;
}

export const createFringeTaskSet = <MB extends Model.Template | Model.Budget>(
  actions: FringeTasksActionMap,
  services: FringeServiceSet<MB>,
  selectObjId: (state: Modules.ApplicationStore) => number | null,
  selectFringes: (state: Modules.ApplicationStore) => M[]
): FringeTaskSet => {
  function* bulkCreateTask(objId: number, p: Table.RowAddPayload<R, M>): SagaIterator {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    yield put(actions.creating(true));

    const requestPayload: Http.BulkCreatePayload<Http.FringePayload> = createBulkCreatePayload<
      R,
      M,
      Http.FringePayload
    >(p);

    try {
      const fringes: M[] = yield call(services.bulkCreate, objId, requestPayload, {
        cancelToken: source.token
      });
      yield all(fringes.map((fringe: M) => put(actions.addToState(fringe))));
    } catch (e) {
      if (!(yield cancelled())) {
        api.handleRequestError(e, "There was an error creating the fringes.");
      }
    } finally {
      yield put(actions.creating(false));
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }

  function* handleRowAddEvent(action: Redux.Action<Table.RowAddEvent<R, M>>): SagaIterator {
    const objId = yield select(selectObjId);
    if (!isNil(objId) && !isNil(action.payload)) {
      const event: Table.RowAddEvent<R, M> = action.payload;
      yield fork(bulkCreateTask, objId, event.payload);
    }
  }

  function* handleRowDeleteEvent(action: Redux.Action<Table.RowDeleteEvent<R, M>>): SagaIterator {
    const objId = yield select(selectObjId);
    if (!isNil(objId) && !isNil(action.payload)) {
      const event: Table.RowDeleteEvent<R, M> = action.payload;
      const ms: M[] = yield select(selectFringes);
      let rows: R[] = Array.isArray(event.payload.rows) ? event.payload.rows : [event.payload.rows];
      rows = filter(rows, (row: R) =>
        includes(
          map(ms, (m: M) => m.id),
          row.id
        )
      );
      if (rows.length !== 0) {
        let success = true;
        yield all(rows.map((row: R) => put(actions.deleting({ id: row.id, value: true }))));
        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();
        try {
          yield call(
            services.bulkDelete,
            objId,
            map(rows, (row: R) => row.id),
            { cancelToken: source.token }
          );
        } catch (e) {
          success = false;
          if (!(yield cancelled())) {
            api.handleRequestError(e, "There was an error deleting the fringes.");
          }
        } finally {
          yield all(rows.map((row: R) => put(actions.deleting({ id: row.id, value: false }))));
          if (yield cancelled()) {
            source.cancel();
          }
        }
        if (success === true) {
          yield put(actions.requestBudget(null));
        }
      }
    }
  }

  function* handleDataChangeEvent(action: Redux.Action<Table.DataChangeEvent<R, M>>): SagaIterator {
    const objId = yield select(selectObjId);
    if (!isNil(objId) && !isNil(action.payload)) {
      const event: Table.DataChangeEvent<R, M> = action.payload;

      const merged = consolidateTableChange(event.payload);
      if (merged.length !== 0) {
        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();

        const requestPayload: Http.BulkUpdatePayload<Http.FringePayload>[] = map(
          merged,
          (change: Table.RowChange<R, M>) => ({
            id: change.id,
            ...payload(change)
          })
        );
        yield all(merged.map((change: Table.RowChange<R, M>) => put(actions.updating({ id: change.id, value: true }))));
        let success = true;
        try {
          yield call(services.bulkUpdate, objId, requestPayload, { cancelToken: source.token });
        } catch (e) {
          success = false;
          if (!(yield cancelled())) {
            api.handleRequestError(e, "There was an error updating the fringes.");
          }
        } finally {
          yield all(
            merged.map((change: Table.RowChange<R, M>) => put(actions.updating({ id: change.id, value: false })))
          );
          if (yield cancelled()) {
            source.cancel();
          }
        }
        if (success === true) {
          yield put(actions.requestBudget(null));
        }
      }
    }
  }

  function* getFringesTask(action: Redux.Action<null>): SagaIterator {
    const objId = yield select(selectObjId);
    if (!isNil(objId)) {
      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();
      yield put(actions.loading(true));
      try {
        const response = yield call(services.request, objId, { no_pagination: true }, { cancelToken: source.token });
        yield put(actions.response(response));
        if (response.data.length === 0) {
          yield call(bulkCreateTask, objId, 2);
        }
      } catch (e) {
        if (!(yield cancelled())) {
          api.handleRequestError(e, "There was an error retrieving fringes.");
          yield put(actions.response({ count: 0, data: [] }, { error: e }));
        }
      } finally {
        yield put(actions.loading(false));
        if (yield cancelled()) {
          source.cancel();
        }
      }
    }
  }

  return {
    getFringes: getFringesTask,
    handleDataChangeEvent: handleDataChangeEvent,
    handleRowAddEvent: handleRowAddEvent,
    handleRowDeleteEvent: handleRowDeleteEvent
  };
};
