import axios from "axios";
import { SagaIterator } from "redux-saga";
import { call, put, select, fork, cancelled, all } from "redux-saga/effects";
import { isNil, filter, includes, map } from "lodash";

import * as api from "api";

import { consolidateTableChange, createBulkCreatePayload, payload } from "lib/model/util";

export interface FringeTasksActionMap {
  response: Redux.ActionCreator<Http.ListResponse<Model.Fringe>>;
  loading: Redux.ActionCreator<boolean>;
  deleting: Redux.ActionCreator<Redux.ModelListActionPayload>;
  creating: Redux.ActionCreator<boolean>;
  updating: Redux.ActionCreator<Redux.ModelListActionPayload>;
  addToState: Redux.ActionCreator<Model.Fringe>;
  requestBudget: Redux.ActionCreator<null>;
}

export interface FringeServiceSet<M extends Model.Template | Model.Budget> {
  request: (
    id: number,
    query: Http.ListQuery,
    options: Http.RequestOptions
  ) => Promise<Http.ListResponse<Model.Fringe>>;
  create: (id: number, p: Http.FringePayload, options: Http.RequestOptions) => Promise<Model.Fringe>;
  bulkDelete: (id: number, ids: number[], options: Http.RequestOptions) => Promise<M>;
  bulkUpdate: (
    id: number,
    data: Http.BulkUpdatePayload<Http.FringePayload>[],
    options: Http.RequestOptions
  ) => Promise<M>;
  bulkCreate: (
    id: number,
    p: Http.BulkCreatePayload<Http.FringePayload>,
    options: Http.RequestOptions
  ) => Promise<Model.Fringe[]>;
}

export interface FringeTaskSet {
  getFringes: Redux.Task<null>;
  handleRowAddEvent: Redux.Task<Table.RowAddEvent<BudgetTable.FringeRow, Model.Fringe>>;
  handleRowDeleteEvent: Redux.Task<Table.RowDeleteEvent>;
  handleDataChangeEvent: Redux.Task<Table.DataChangeEvent<BudgetTable.FringeRow, Model.Fringe>>;
}

export const createFringeTaskSet = <M extends Model.Template | Model.Budget>(
  actions: FringeTasksActionMap,
  services: FringeServiceSet<M>,
  selectObjId: (state: Modules.ApplicationStore) => number | null,
  selectFringes: (state: Modules.ApplicationStore) => Model.Fringe[]
): FringeTaskSet => {
  function* bulkCreateTask(objId: number, p: Table.RowAddPayload<BudgetTable.FringeRow, Model.Fringe>): SagaIterator {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    yield put(actions.creating(true));

    const requestPayload: Http.BulkCreatePayload<Http.FringePayload> = createBulkCreatePayload<
      BudgetTable.FringeRow,
      Model.Fringe,
      Http.FringePayload
    >(p);

    try {
      const fringes: Model.Fringe[] = yield call(services.bulkCreate, objId, requestPayload, {
        cancelToken: source.token
      });
      yield all(fringes.map((fringe: Model.Fringe) => put(actions.addToState(fringe))));
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

  function* handleRowAddEvent(
    action: Redux.Action<Table.RowAddEvent<BudgetTable.FringeRow, Model.Fringe>>
  ): SagaIterator {
    const objId = yield select(selectObjId);
    if (!isNil(objId) && !isNil(action.payload)) {
      const event: Table.RowAddEvent<BudgetTable.FringeRow, Model.Fringe> = action.payload;
      yield fork(bulkCreateTask, objId, event.payload);
    }
  }

  function* handleRowDeleteEvent(action: Redux.Action<Table.RowDeleteEvent>): SagaIterator {
    const objId = yield select(selectObjId);
    if (!isNil(objId) && !isNil(action.payload)) {
      const event: Table.RowDeleteEvent = action.payload;
      const ms: Model.Fringe[] = yield select(selectFringes);
      let ids = Array.isArray(event.payload) ? event.payload : [event.payload];
      ids = filter(ids, (id: number) =>
        includes(
          map(ms, (m: Model.Fringe) => m.id),
          id
        )
      );
      if (ids.length !== 0) {
        let success = true;
        yield all(ids.map((id: number) => put(actions.deleting({ id, value: true }))));
        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();
        try {
          yield call(services.bulkDelete, objId, ids, { cancelToken: source.token });
        } catch (e) {
          success = false;
          if (!(yield cancelled())) {
            api.handleRequestError(e, "There was an error deleting the fringes.");
          }
        } finally {
          yield all(ids.map((id: number) => put(actions.deleting({ id, value: false }))));
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

  function* handleDataChangeEvent(
    action: Redux.Action<Table.DataChangeEvent<BudgetTable.FringeRow, Model.Fringe>>
  ): SagaIterator {
    const objId = yield select(selectObjId);
    if (!isNil(objId) && !isNil(action.payload)) {
      const event: Table.DataChangeEvent<BudgetTable.FringeRow, Model.Fringe> = action.payload;

      const merged = consolidateTableChange(event.payload);
      if (merged.length !== 0) {
        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();

        const requestPayload: Http.BulkUpdatePayload<Http.FringePayload>[] = map(
          merged,
          (change: Table.RowChange<BudgetTable.FringeRow, Model.Fringe>) => ({
            id: change.id,
            ...payload(change)
          })
        );
        yield all(
          merged.map((change: Table.RowChange<BudgetTable.FringeRow, Model.Fringe>) =>
            put(actions.updating({ id: change.id, value: true }))
          )
        );
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
            merged.map((change: Table.RowChange<BudgetTable.FringeRow, Model.Fringe>) =>
              put(actions.updating({ id: change.id, value: false }))
            )
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
