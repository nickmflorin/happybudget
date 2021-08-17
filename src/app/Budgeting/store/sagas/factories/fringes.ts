import axios from "axios";
import { SagaIterator } from "redux-saga";
import { call, put, select, fork, cancelled, all } from "redux-saga/effects";
import { isNil, map } from "lodash";

import * as api from "api";
import { tabling } from "lib";

type R = Tables.FringeRow;
type M = Model.Fringe;
type P = Http.FringePayload;

export interface FringeTasksActionMap<B extends Model.Template | Model.Budget> {
  response: Redux.ActionCreator<Http.ListResponse<M>>;
  loading: Redux.ActionCreator<boolean>;
  deleting: Redux.ActionCreator<Redux.ModelListActionPayload>;
  creating: Redux.ActionCreator<boolean>;
  updating: Redux.ActionCreator<Redux.ModelListActionPayload>;
  addToState: Redux.ActionCreator<M>;
  budget: {
    loading: Redux.ActionCreator<boolean>;
    updateInState: Redux.ActionCreator<Partial<B>>;
  };
}

export interface FringeServiceSet<B extends Model.Template | Model.Budget> {
  request: (id: number, query: Http.ListQuery, options: Http.RequestOptions) => Promise<Http.ListResponse<M>>;
  create: (id: number, p: Http.FringePayload, options: Http.RequestOptions) => Promise<M>;
  bulkDelete: (id: number, ids: number[], options: Http.RequestOptions) => Promise<Http.BulkModelResponse<B>>;
  bulkUpdate: (
    id: number,
    data: Http.BulkUpdatePayload<Http.FringePayload>[],
    options: Http.RequestOptions
  ) => Promise<Http.BulkModelResponse<B>>;
  bulkCreate: (
    id: number,
    p: Http.BulkCreatePayload<P>,
    options: Http.RequestOptions
  ) => Promise<Http.BulkCreateChildrenResponse<B, Model.Fringe>>;
}

export type FringeTaskSet = Redux.TableTaskMap<R, M>;

export const createFringeTaskSet = <B extends Model.Template | Model.Budget>(
  actions: FringeTasksActionMap<B>,
  services: FringeServiceSet<B>,
  selectObjId: (state: Modules.Authenticated.Store) => number | null
): FringeTaskSet => {
  function* bulkCreateTask(objId: number, e: Table.RowAddEvent<R, M>, errorMessage: string): SagaIterator {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();

    const requestPayload: Http.BulkCreatePayload<P> = tabling.util.createBulkCreatePayload<R, M, P>(e.payload);

    yield put(actions.creating(true));
    if (tabling.util.eventWarrantsRecalculation(e)) {
      yield put(actions.budget.loading(true));
    }
    try {
      const response: Http.BulkCreateChildrenResponse<B, M> = yield call(services.bulkCreate, objId, requestPayload, {
        cancelToken: source.token
      });
      if (tabling.util.eventWarrantsRecalculation(e)) {
        yield put(actions.budget.updateInState(response.data as Partial<B>));
      }
      yield all(response.children.map((fringe: M) => put(actions.addToState(fringe))));
    } catch (err) {
      if (!(yield cancelled())) {
        api.handleRequestError(err, errorMessage);
      }
    } finally {
      yield put(actions.creating(false));
      if (tabling.util.eventWarrantsRecalculation(e)) {
        yield put(actions.budget.loading(true));
      }
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }

  function* bulkUpdateTask(
    objId: number,
    e: Table.ChangeEvent<R, M>,
    requestPayload: Http.BulkUpdatePayload<P>[],
    errorMessage: string
  ): SagaIterator {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    yield all(requestPayload.map((p: Http.BulkUpdatePayload<P>) => put(actions.updating({ id: p.id, value: true }))));
    if (!tabling.typeguards.isGroupEvent(e) && tabling.util.eventWarrantsRecalculation(e)) {
      yield put(actions.budget.loading(true));
    }
    try {
      const response: Http.BulkModelResponse<B> = yield call(services.bulkUpdate, objId, requestPayload, {
        cancelToken: source.token
      });
      if (!tabling.typeguards.isGroupEvent(e) && tabling.util.eventWarrantsRecalculation(e)) {
        yield put(actions.budget.updateInState(response.data as Partial<B>));
      }
    } catch (err) {
      if (!(yield cancelled())) {
        api.handleRequestError(err, errorMessage);
      }
    } finally {
      if (!tabling.typeguards.isGroupEvent(e) && tabling.util.eventWarrantsRecalculation(e)) {
        yield put(actions.budget.loading(false));
      }
      yield all(
        requestPayload.map((p: Http.BulkUpdatePayload<P>) => put(actions.updating({ id: p.id, value: false })))
      );
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }

  function* bulkDeleteTask(objId: number, e: Table.RowDeleteEvent<R, M>, errorMessage: string): SagaIterator {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();

    const rows: R[] = Array.isArray(e.payload.rows) ? e.payload.rows : [e.payload.rows];
    if (rows.length !== 0) {
      const ids = map(rows, (row: R) => row.id);

      yield all(ids.map((id: number) => put(actions.deleting({ id, value: true }))));
      if (tabling.util.eventWarrantsRecalculation<R, M>(e)) {
        yield put(actions.budget.loading(true));
      }
      try {
        const response: Http.BulkModelResponse<B> = yield call(services.bulkDelete, objId, ids, {
          cancelToken: source.token
        });
        if (tabling.util.eventWarrantsRecalculation(e)) {
          yield put(actions.budget.updateInState(response.data as Partial<B>));
        }
      } catch (err) {
        if (!(yield cancelled())) {
          api.handleRequestError(err, errorMessage);
        }
      } finally {
        yield all(ids.map((id: number) => put(actions.deleting({ id, value: false }))));
        if (tabling.util.eventWarrantsRecalculation(e)) {
          yield put(actions.budget.loading(false));
        }
        if (yield cancelled()) {
          source.cancel();
        }
      }
    }
  }

  function* handleRowAddEvent(action: Redux.Action<Table.RowAddEvent<R, M>>): SagaIterator {
    const objId = yield select(selectObjId);
    if (!isNil(objId) && !isNil(action.payload)) {
      const e: Table.RowAddEvent<R, M> = action.payload;
      yield fork(bulkCreateTask, objId, e, "There was an error creating the fringes.");
    }
  }

  function* handleRowDeleteEvent(action: Redux.Action<Table.RowDeleteEvent<R, M>>): SagaIterator {
    const objId = yield select(selectObjId);
    if (!isNil(objId) && !isNil(action.payload)) {
      const e: Table.RowDeleteEvent<R, M> = action.payload;
      yield fork(bulkDeleteTask, objId, e, "There was an error deleting the fringes.");
    }
  }

  function* handleDataChangeEvent(action: Redux.Action<Table.DataChangeEvent<R, M>>): SagaIterator {
    const objId = yield select(selectObjId);
    if (!isNil(objId) && !isNil(action.payload)) {
      const e: Table.DataChangeEvent<R, M> = action.payload;
      const merged = tabling.util.consolidateTableChange(e.payload);
      if (merged.length !== 0) {
        const requestPayload: Http.BulkUpdatePayload<P>[] = map(merged, (change: Table.RowChange<R, M>) => ({
          id: change.id,
          ...tabling.util.payload(change)
        }));
        yield fork(bulkUpdateTask, objId, e, requestPayload, "There was an error updating the fringes.");
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
          yield fork(bulkCreateTask, objId, { type: "rowAdd", payload: 2 }, "There was an error creating the fringes.");
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
    request: getFringesTask,
    handleDataChangeEvent: handleDataChangeEvent,
    handleRowAddEvent: handleRowAddEvent,
    handleRowDeleteEvent: handleRowDeleteEvent
  };
};
