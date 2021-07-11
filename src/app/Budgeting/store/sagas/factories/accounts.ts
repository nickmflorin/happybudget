import axios from "axios";
import { SagaIterator } from "redux-saga";
import { call, put, select, fork, cancelled, all } from "redux-saga/effects";
import { isNil, map, filter, includes } from "lodash";

import * as api from "api";
import * as models from "lib/model";

import { consolidateTableChange } from "lib/model/util";

import { createBulkCreatePayload } from "./util";

export interface AccountsTasksActionMap<A extends Model.Account | Model.Account, G extends Model.Group | Model.Group> {
  deleting: Redux.ActionCreator<Redux.ModelListActionPayload>;
  creating: Redux.ActionCreator<boolean>;
  updating: Redux.ActionCreator<Redux.ModelListActionPayload>;
  addToState: Redux.ActionCreator<A>;
  loading: Redux.ActionCreator<boolean>;
  response: Redux.ActionCreator<Http.ListResponse<A>>;
  budget: {
    loading: Redux.ActionCreator<boolean>;
    request: Redux.ActionCreator<null>;
  };
  groups: {
    removeFromState: Redux.ActionCreator<number>;
    deleting: Redux.ActionCreator<Redux.ModelListActionPayload>;
    loading: Redux.ActionCreator<boolean>;
    response: Redux.ActionCreator<Http.ListResponse<G>>;
  };
}

export interface AccountsServiceSet<
  M extends Model.Template | Model.Budget,
  A extends Model.Account | Model.Account,
  G extends Model.Group | Model.Group,
  P extends Http.AccountPayload | Http.AccountPayload
> {
  bulkDelete: (id: number, ids: number[], options: Http.RequestOptions) => Promise<M>;
  bulkUpdate: (id: number, data: Http.BulkUpdatePayload<P>[], options: Http.RequestOptions) => Promise<M>;
  bulkCreate: (id: number, payload: Http.BulkCreatePayload<P>, options: Http.RequestOptions) => Promise<A[]>;
  getAccounts: (id: number, query: Http.ListQuery, options: Http.RequestOptions) => Promise<Http.ListResponse<A>>;
  getGroups: (id: number, query: Http.ListQuery, options: Http.RequestOptions) => Promise<Http.ListResponse<G>>;
}

export interface AccountsTaskSet<R extends Table.Row> {
  addToGroup: Redux.Task<{ id: number; group: number }>;
  removeFromGroup: Redux.Task<number>;
  deleteGroup: Redux.Task<number>;
  getAccounts: Redux.Task<null>;
  getGroups: Redux.Task<null>;
  handleRowAddEvent: Redux.Task<Table.RowAddEvent<R>>;
  handleRowDeleteEvent: Redux.Task<Table.RowDeleteEvent>;
  handleDataChangeEvent: Redux.Task<Table.DataChangeEvent<R>>;
}

export const createAccountsTaskSet = <
  M extends Model.Template | Model.Budget,
  A extends Model.Account | Model.Account,
  R extends Table.Row,
  G extends Model.Group | Model.Group,
  P extends Http.AccountPayload | Http.AccountPayload
>(
  /* eslint-disable indent */
  actions: AccountsTasksActionMap<A, G>,
  services: AccountsServiceSet<M, A, G, P>,
  manager: models.RowManager<R, A, P>,
  selectObjId: (state: Modules.ApplicationStore) => number | null,
  selectModels: (state: Modules.ApplicationStore) => A[],
  selectAutoIndex: (state: Modules.ApplicationStore) => boolean
): AccountsTaskSet<R> => {
  function* removeFromGroupTask(action: Redux.Action<number>): SagaIterator {
    if (!isNil(action.payload)) {
      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();
      yield put(actions.updating({ id: action.payload, value: true }));
      try {
        yield call(api.updateAccount, action.payload, { group: null }, { cancelToken: source.token });
      } catch (e) {
        if (!(yield cancelled())) {
          api.handleRequestError(e, "There was an error removing the account from the group.");
        }
      } finally {
        yield put(actions.updating({ id: action.payload, value: false }));
        if (yield cancelled()) {
          source.cancel();
        }
      }
    }
  }

  function* addToGroupTask(action: Redux.Action<{ id: number; group: number }>): SagaIterator {
    if (!isNil(action.payload)) {
      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();
      yield put(actions.updating({ id: action.payload.id, value: true }));
      try {
        yield call(
          api.updateAccount,
          action.payload.id,
          { group: action.payload.group },
          { cancelToken: source.token }
        );
      } catch (e) {
        if (!(yield cancelled())) {
          api.handleRequestError(e, "There was an error adding the account to the group.");
        }
      } finally {
        yield put(actions.updating({ id: action.payload.id, value: false }));
        if (yield cancelled()) {
          source.cancel();
        }
      }
    }
  }

  function* deleteGroupTask(action: Redux.Action<number>): SagaIterator {
    if (!isNil(action.payload)) {
      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();
      yield put(actions.groups.deleting({ id: action.payload, value: true }));
      try {
        yield call(api.deleteGroup, action.payload, { cancelToken: source.token });
        yield put(actions.groups.removeFromState(action.payload));
      } catch (e) {
        if (!(yield cancelled())) {
          api.handleRequestError(e, "There was an error deleting the account group.");
        }
      } finally {
        yield put(actions.groups.deleting({ id: action.payload, value: false }));
        if (yield cancelled()) {
          source.cancel();
        }
      }
    }
  }

  function* bulkCreateTask(payload: Table.RowAddPayload<R>): SagaIterator {
    const objId = yield select(selectObjId);
    if (!isNil(objId)) {
      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();
      yield put(actions.creating(true));

      const autoIndex = yield select(selectAutoIndex);
      const data = yield select(selectModels);

      const requestPayload: Http.BulkCreatePayload<P> = createBulkCreatePayload<R, P, A>(payload, manager, {
        autoIndex,
        models: data
      });
      // We do this to show the loading indicator next to the calculated fields of the footers,
      // otherwise, the loading indicators will not appear until the first API request
      // succeeds and we refresh the parent state.
      yield put(actions.budget.loading(true));
      let success = true;
      try {
        const accounts: A[] = yield call(services.bulkCreate, objId, requestPayload, { cancelToken: source.token });
        yield all(accounts.map((account: A) => put(actions.addToState(account))));
      } catch (e) {
        success = false;
        yield put(actions.budget.loading(false));
        if (!(yield cancelled())) {
          api.handleRequestError(e, "There was an error creating the accounts.");
        }
      } finally {
        yield put(actions.creating(false));
        if (yield cancelled()) {
          success = false;
          source.cancel();
        }
      }
      if (success === true) {
        yield put(actions.budget.request(null));
      }
    }
  }

  function* handleRowAddEvent(action: Redux.Action<Table.RowAddEvent<R>>): SagaIterator {
    const objId = yield select(selectObjId);
    if (!isNil(objId) && !isNil(action.payload)) {
      const event: Table.RowAddEvent<R> = action.payload;
      yield fork(bulkCreateTask, event.payload);
    }
  }

  function* handleRowDeleteEvent(action: Redux.Action<Table.RowDeleteEvent>): SagaIterator {
    const objId = yield select(selectObjId);
    if (!isNil(objId) && !isNil(action.payload)) {
      const event: Table.RowDeleteEvent = action.payload;

      const ms: A[] = yield select(selectModels);
      let ids = Array.isArray(event.payload) ? event.payload : [event.payload];
      ids = filter(ids, (id: number) =>
        includes(
          map(ms, (m: A) => m.id),
          id
        )
      );
      if (ids.length !== 0) {
        yield all(ids.map((id: number) => put(actions.deleting({ id, value: true }))));
        // We do this to show the loading indicator next to the calculated fields of the footers,
        // otherwise, the loading indicators will not appear until the first API request
        // succeeds and we refresh the parent state.
        yield put(actions.budget.loading(true));

        let success = true;
        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();

        try {
          yield call(services.bulkDelete, objId, ids, { cancelToken: source.token });
        } catch (e) {
          success = false;
          yield put(actions.budget.loading(false));
          if (!(yield cancelled())) {
            api.handleRequestError(e, "There was an error deleting the accounts.");
          }
        } finally {
          yield all(ids.map((id: number) => put(actions.deleting({ id, value: false }))));
          if (yield cancelled()) {
            success = false;
            source.cancel();
          }
        }
        if (success === true) {
          yield put(actions.budget.request(null));
        }
      }
    }
  }

  function* handleDataChangeEvent(action: Redux.Action<Table.DataChangeEvent<R>>): SagaIterator {
    const objId = yield select(selectObjId);
    if (!isNil(objId) && !isNil(action.payload)) {
      const event: Table.DataChangeEvent<R> = action.payload;

      const merged = consolidateTableChange(event.payload);
      if (merged.length !== 0) {
        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();
        const requestPayload: Http.BulkUpdatePayload<Http.AccountPayload>[] = map(
          merged,
          (change: Table.RowChange<R>) => ({
            id: change.id,
            ...manager.payload(change)
          })
        );
        // We do this to show the loading indicator next to the calculated fields of the footers,
        // otherwise, the loading indicators will not appear until the first API request
        // succeeds and we refresh the parent state.
        yield put(actions.budget.loading(true));
        let success = true;
        yield all(merged.map((change: Table.RowChange<R>) => put(actions.updating({ id: change.id, value: true }))));
        try {
          yield call(services.bulkUpdate, objId, requestPayload, { cancelToken: source.token });
        } catch (e) {
          success = false;
          yield put(actions.budget.loading(false));
          if (!(yield cancelled())) {
            api.handleRequestError(e, "There was an error updating the accounts.");
          }
        } finally {
          yield all(merged.map((change: Table.RowChange<R>) => put(actions.updating({ id: change.id, value: false }))));
          if (yield cancelled()) {
            success = false;
            source.cancel();
          }
        }
        if (success === true) {
          yield put(actions.budget.request(null));
        }
      }
    }
  }

  function* getGroupsTask(action: Redux.Action<null>): SagaIterator {
    const objId = yield select(selectObjId);
    if (!isNil(objId)) {
      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();
      yield put(actions.groups.loading(true));
      try {
        const response: Http.ListResponse<G> = yield call(
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

  function* getAccountsTask(action: Redux.Action<null>): SagaIterator {
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
          yield call(bulkCreateTask, 2);
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
    addToGroup: addToGroupTask,
    removeFromGroup: removeFromGroupTask,
    deleteGroup: deleteGroupTask,
    handleDataChangeEvent: handleDataChangeEvent,
    handleRowAddEvent: handleRowAddEvent,
    handleRowDeleteEvent: handleRowDeleteEvent,
    getAccounts: getAccountsTask,
    getGroups: getGroupsTask
  };
};
