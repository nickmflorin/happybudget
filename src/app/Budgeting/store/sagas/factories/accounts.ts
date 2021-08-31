import axios from "axios";
import { SagaIterator } from "redux-saga";
import { call, put, select, fork, cancelled, all } from "redux-saga/effects";
import { isNil, map } from "lodash";

import * as api from "api";
import { tabling } from "lib";

type R = Tables.AccountRow;
type C = Model.Account;
type P = Http.AccountPayload;

export type AccountsTasksActionMap<B extends Model.Budget | Model.Template> = Redux.BudgetTableActionCreatorMap<C> & {
  budget: {
    loading: Redux.ActionCreator<boolean>;
    updateInState: Redux.ActionCreator<Partial<B>>;
  };
};

export interface AccountsServiceSet<B extends Model.Model> {
  bulkDelete: (id: number, ids: number[], options: Http.RequestOptions) => Promise<Http.BulkModelResponse<B>>;
  bulkUpdate: (
    id: number,
    data: Http.BulkUpdatePayload<P>[],
    options: Http.RequestOptions
  ) => Promise<Http.BulkModelResponse<B>>;
  bulkCreate: (
    id: number,
    p: Http.BulkCreatePayload<P>,
    options: Http.RequestOptions
  ) => Promise<Http.BulkCreateChildrenResponse<B, C>>;
  getAccounts: (id: number, query: Http.ListQuery, options: Http.RequestOptions) => Promise<Http.ListResponse<C>>;
  getGroups: (
    id: number,
    query: Http.ListQuery,
    options: Http.RequestOptions
  ) => Promise<Http.ListResponse<Model.Group>>;
}

export type AccountsTaskSet = Redux.BudgetTableTaskMap<R, C>;

export const createAccountsTaskSet = <B extends Model.Budget | Model.Template>(
  /* eslint-disable indent */
  actions: AccountsTasksActionMap<B>,
  services: AccountsServiceSet<B>,
  selectObjId: (state: Modules.Authenticated.StoreObj) => number | null,
  selectModels: (state: Modules.Authenticated.StoreObj) => C[],
  selectAutoIndex: (state: Modules.Authenticated.StoreObj) => boolean
): AccountsTaskSet => {
  function* bulkCreateTask(objId: number, e: Table.RowAddEvent<R, C>, errorMessage: string): SagaIterator {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();

    const autoIndex = yield select(selectAutoIndex);
    const data = yield select(selectModels);

    const requestPayload: Http.BulkCreatePayload<P> = tabling.util.createBulkCreatePayload<R, C, P>(e.payload, {
      autoIndex,
      models: data,
      field: "identifier"
    });

    yield put(actions.creating(true));
    if (tabling.util.eventWarrantsRecalculation(e)) {
      yield put(actions.budget.loading(true));
    }
    try {
      const response: Http.BulkCreateChildrenResponse<B, C> = yield call(services.bulkCreate, objId, requestPayload, {
        cancelToken: source.token
      });
      yield all(response.children.map((account: C) => put(actions.addToState(account))));
      if (tabling.util.eventWarrantsRecalculation(e)) {
        yield put(actions.budget.updateInState(response.data as Partial<B>));
      }
    } catch (err) {
      if (!(yield cancelled())) {
        api.handleRequestError(err, errorMessage);
      }
    } finally {
      yield put(actions.creating(false));
      if (tabling.util.eventWarrantsRecalculation(e)) {
        yield put(actions.budget.loading(false));
      }
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }

  function* bulkUpdateTask(
    objId: number,
    e: Table.ChangeEvent<R, C>,
    requestPayload: Http.BulkUpdatePayload<P>[],
    errorMessage: string
  ): SagaIterator {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();

    // TODO: In the case of modifications to the rows of a group, would it be more appropriate
    // to instead indicate that the group is being updated?
    // There is a discrepancy between what we are indicating as loading between removing a row
    // from the group and deleting the group itself.
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
      yield all(
        requestPayload.map((p: Http.BulkUpdatePayload<P>) => put(actions.updating({ id: p.id, value: false })))
      );
      if (!tabling.typeguards.isGroupEvent(e) && tabling.util.eventWarrantsRecalculation(e)) {
        yield put(actions.budget.loading(false));
      }
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }

  function* bulkDeleteTask(objId: number, e: Table.RowDeleteEvent<R, C>, errorMessage: string): SagaIterator {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();

    const rows: R[] = Array.isArray(e.payload.rows) ? e.payload.rows : [e.payload.rows];
    if (rows.length !== 0) {
      const ids = map(rows, (row: R) => row.id);

      yield all(ids.map((id: number) => put(actions.deleting({ id, value: true }))));
      if (tabling.util.eventWarrantsRecalculation<R, C>(e)) {
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

  function* handleRemoveRowFromGroupEvent(action: Redux.Action<Table.RowRemoveFromGroupEvent<R, C>>): SagaIterator {
    const objId = yield select(selectObjId);
    if (!isNil(objId) && !isNil(action.payload)) {
      const e: Table.RowRemoveFromGroupEvent<R, C> = action.payload;
      const rows: R[] = Array.isArray(e.payload.rows) ? e.payload.rows : [e.payload.rows];
      const requestPayload: Http.BulkUpdatePayload<P>[] = map(rows, (row: R) => ({
        id: row.id,
        group: null
      }));
      yield fork(bulkUpdateTask, objId, e, requestPayload, "There was an error removing the account from the group.");
    }
  }

  function* handleAddRowToGroupEvent(action: Redux.Action<Table.RowAddToGroupEvent<R, C>>): SagaIterator {
    const objId = yield select(selectObjId);
    if (!isNil(objId) && !isNil(action.payload)) {
      const e: Table.RowAddToGroupEvent<R, C> = action.payload;
      const rows: R[] = Array.isArray(e.payload.rows) ? e.payload.rows : [e.payload.rows];
      const requestPayload: Http.BulkUpdatePayload<P>[] = map(rows, (row: R) => ({
        id: row.id,
        group: e.payload.group
      }));
      yield fork(bulkUpdateTask, objId, e, requestPayload, "There was an error adding the account to the group.");
    }
  }

  function* handleDeleteGroupEvent(action: Redux.Action<Table.GroupDeleteEvent>): SagaIterator {
    if (!isNil(action.payload)) {
      const e: Table.GroupDeleteEvent = action.payload;
      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();

      yield put(actions.groups.deleting({ id: e.payload, value: true }));
      try {
        yield call(api.deleteGroup, e.payload, { cancelToken: source.token });
      } catch (err) {
        if (!(yield cancelled())) {
          api.handleRequestError(err, "There was an error deleting the account group.");
        }
      } finally {
        yield put(actions.groups.deleting({ id: e.payload, value: false }));
        if (yield cancelled()) {
          source.cancel();
        }
      }
    }
  }

  function* handleRowAddEvent(action: Redux.Action<Table.RowAddEvent<R, C>>): SagaIterator {
    const objId = yield select(selectObjId);
    if (!isNil(objId) && !isNil(action.payload)) {
      const e: Table.RowAddEvent<R, C> = action.payload;
      yield fork(bulkCreateTask, objId, e, "There was an error creating the accounts.");
    }
  }

  function* handleRowDeleteEvent(action: Redux.Action<Table.RowDeleteEvent<R, C>>): SagaIterator {
    const objId = yield select(selectObjId);
    if (!isNil(objId) && !isNil(action.payload)) {
      const e: Table.RowDeleteEvent<R, C> = action.payload;
      yield fork(bulkDeleteTask, objId, e, "There was an error deleting the accounts.");
    }
  }

  function* handleDataChangeEvent(action: Redux.Action<Table.DataChangeEvent<R, C>>): SagaIterator {
    const objId = yield select(selectObjId);
    if (!isNil(objId) && !isNil(action.payload)) {
      const e: Table.DataChangeEvent<R, C> = action.payload;
      const merged = tabling.util.consolidateTableChange(e.payload);
      if (merged.length !== 0) {
        const requestPayload: Http.BulkUpdatePayload<P>[] = map(merged, (change: Table.RowChange<R, C>) => ({
          id: change.id,
          ...tabling.util.payload(change)
        }));
        yield fork(bulkUpdateTask, objId, e, requestPayload, "There was an error updating the accounts.");
      }
    }
  }

  function* getGroups(action: Redux.Action<null>): SagaIterator {
    const objId = yield select(selectObjId);
    if (!isNil(objId)) {
      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();
      yield put(actions.groups.loading(true));
      try {
        const response: Http.ListResponse<Model.Group> = yield call(
          services.getGroups,
          objId,
          { no_pagination: true },
          { cancelToken: source.token }
        );
        yield put(actions.groups.response(response));
      } catch (e) {
        if (!(yield cancelled())) {
          api.handleRequestError(e, "There was an error retrieving the account groups.");
          yield put(actions.groups.response({ count: 0, data: [] }, { error: e }));
        }
      } finally {
        yield put(actions.groups.loading(false));
        if (yield cancelled()) {
          source.cancel();
        }
      }
    }
  }

  function* getAccounts(action: Redux.Action<null>): SagaIterator {
    const objId = yield select(selectObjId);
    if (!isNil(objId)) {
      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();
      yield put(actions.loading(true));
      try {
        const response = yield call(
          services.getAccounts,
          objId,
          { no_pagination: true },
          { cancelToken: source.token }
        );
        yield put(actions.response(response));
        if (response.data.length === 0) {
          yield call(
            bulkCreateTask,
            objId,
            { type: "rowAdd", payload: 2 },
            "There was an error creating the accounts."
          );
        }
      } catch (e) {
        if (!(yield cancelled())) {
          api.handleRequestError(e, "There was an error retrieving the accounts.");
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
    handleRemoveRowFromGroupEvent: handleRemoveRowFromGroupEvent,
    handleAddRowToGroupEvent: handleAddRowToGroupEvent,
    handleDeleteGroupEvent: handleDeleteGroupEvent,
    handleRowAddEvent: handleRowAddEvent,
    handleRowDeleteEvent: handleRowDeleteEvent,
    handleDataChangeEvent: handleDataChangeEvent,
    requestGroups: getGroups,
    request: getAccounts
  };
};
