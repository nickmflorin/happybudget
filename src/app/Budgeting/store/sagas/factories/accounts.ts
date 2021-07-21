import axios from "axios";
import { SagaIterator } from "redux-saga";
import { call, put, select, fork, cancelled, all } from "redux-saga/effects";
import { isNil, map, filter, includes } from "lodash";

import * as api from "api";

import { consolidateTableChange, createBulkCreatePayload, payload, eventRequiresParentRefresh } from "lib/model/util";

export interface AccountsTasksActionMap {
  deleting: Redux.ActionCreator<Redux.ModelListActionPayload>;
  creating: Redux.ActionCreator<boolean>;
  updating: Redux.ActionCreator<Redux.ModelListActionPayload>;
  addToState: Redux.ActionCreator<Model.Account>;
  loading: Redux.ActionCreator<boolean>;
  response: Redux.ActionCreator<Http.ListResponse<Model.Account>>;
  budget: {
    loading: Redux.ActionCreator<boolean>;
    request: Redux.ActionCreator<null>;
  };
  groups: {
    removeFromState: Redux.ActionCreator<number>;
    deleting: Redux.ActionCreator<Redux.ModelListActionPayload>;
    loading: Redux.ActionCreator<boolean>;
    response: Redux.ActionCreator<Http.ListResponse<Model.Group>>;
  };
}

export interface AccountsServiceSet<M extends Model.Model> {
  bulkDelete: (id: number, ids: number[], options: Http.RequestOptions) => Promise<M>;
  bulkUpdate: (
    id: number,
    data: Http.BulkUpdatePayload<Http.AccountPayload>[],
    options: Http.RequestOptions
  ) => Promise<M>;
  bulkCreate: (
    id: number,
    p: Http.BulkCreatePayload<Http.AccountPayload>,
    options: Http.RequestOptions
  ) => Promise<Model.Account[]>;
  getAccounts: (
    id: number,
    query: Http.ListQuery,
    options: Http.RequestOptions
  ) => Promise<Http.ListResponse<Model.Account>>;
  getGroups: (
    id: number,
    query: Http.ListQuery,
    options: Http.RequestOptions
  ) => Promise<Http.ListResponse<Model.Group>>;
}

export interface AccountsTaskSet {
  addToGroup: Redux.Task<{ id: number; group: number }>;
  removeFromGroup: Redux.Task<number>;
  deleteGroup: Redux.Task<number>;
  getAccounts: Redux.Task<null>;
  getGroups: Redux.Task<null>;
  handleRowAddEvent: Redux.Task<Table.RowAddEvent<BudgetTable.AccountRow, Model.Account>>;
  handleRowDeleteEvent: Redux.Task<Table.RowDeleteEvent<BudgetTable.AccountRow, Model.Account>>;
  handleDataChangeEvent: Redux.Task<Table.DataChangeEvent<BudgetTable.AccountRow, Model.Account>>;
}

export const createAccountsTaskSet = <M extends Model.Model>(
  /* eslint-disable indent */
  actions: AccountsTasksActionMap,
  services: AccountsServiceSet<M>,
  selectObjId: (state: Modules.ApplicationStore) => number | null,
  selectModels: (state: Modules.ApplicationStore) => Model.Account[],
  selectAutoIndex: (state: Modules.ApplicationStore) => boolean
): AccountsTaskSet => {
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

  function* bulkCreateTask(e: Table.RowAddEvent<BudgetTable.AccountRow, Model.Account>): SagaIterator {
    const objId = yield select(selectObjId);
    if (!isNil(objId)) {
      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();
      yield put(actions.creating(true));

      const autoIndex = yield select(selectAutoIndex);
      const data = yield select(selectModels);

      const requestPayload: Http.BulkCreatePayload<Http.AccountPayload> = createBulkCreatePayload<
        BudgetTable.AccountRow,
        Model.Account,
        Http.AccountPayload
      >(e.payload, {
        autoIndex,
        models: data,
        field: "identifier"
      });
      // We do this to show the loading indicator next to the calculated fields of the footers,
      // otherwise, the loading indicators will not appear until the first API request
      // succeeds and we refresh the parent state.
      if (eventRequiresParentRefresh(e)) {
        yield put(actions.budget.loading(true));
      }

      let success = true;
      try {
        const accounts: Model.Account[] = yield call(services.bulkCreate, objId, requestPayload, {
          cancelToken: source.token
        });
        yield all(accounts.map((account: Model.Account) => put(actions.addToState(account))));
      } catch (err) {
        success = false;
        if (eventRequiresParentRefresh(e)) {
          yield put(actions.budget.loading(false));
        }
        if (!(yield cancelled())) {
          api.handleRequestError(err, "There was an error creating the accounts.");
        }
      } finally {
        yield put(actions.creating(false));
        if (yield cancelled()) {
          success = false;
          source.cancel();
        }
      }
      if (success === true && eventRequiresParentRefresh(e)) {
        yield put(actions.budget.request(null));
      }
    }
  }

  function* handleRowAddEvent(
    action: Redux.Action<Table.RowAddEvent<BudgetTable.AccountRow, Model.Account>>
  ): SagaIterator {
    const objId = yield select(selectObjId);
    if (!isNil(objId) && !isNil(action.payload)) {
      const event: Table.RowAddEvent<BudgetTable.AccountRow, Model.Account> = action.payload;
      yield fork(bulkCreateTask, event);
    }
  }

  function* handleRowDeleteEvent(
    action: Redux.Action<Table.RowDeleteEvent<BudgetTable.AccountRow, Model.Account>>
  ): SagaIterator {
    const objId = yield select(selectObjId);
    if (!isNil(objId) && !isNil(action.payload)) {
      const event: Table.RowDeleteEvent<BudgetTable.AccountRow, Model.Account> = action.payload;

      const ms: Model.Account[] = yield select(selectModels);
      let rows: BudgetTable.AccountRow[] = Array.isArray(event.payload.rows)
        ? event.payload.rows
        : [event.payload.rows];
      rows = filter(rows, (row: BudgetTable.AccountRow) =>
        includes(
          map(ms, (m: Model.Account) => m.id),
          row.id
        )
      );
      if (rows.length !== 0) {
        yield all(rows.map((row: BudgetTable.AccountRow) => put(actions.deleting({ id: row.id, value: true }))));
        // We do this to show the loading indicator next to the calculated fields of the footers,
        // otherwise, the loading indicators will not appear until the first API request
        // succeeds and we refresh the parent state.
        if (eventRequiresParentRefresh(event)) {
          yield put(actions.budget.loading(true));
        }

        let success = true;
        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();

        try {
          yield call(
            services.bulkDelete,
            objId,
            map(rows, (row: BudgetTable.AccountRow) => row.id),
            { cancelToken: source.token }
          );
        } catch (e) {
          success = false;
          if (eventRequiresParentRefresh(event)) {
            yield put(actions.budget.loading(false));
          }
          if (!(yield cancelled())) {
            api.handleRequestError(e, "There was an error deleting the accounts.");
          }
        } finally {
          yield all(rows.map((row: BudgetTable.AccountRow) => put(actions.deleting({ id: row.id, value: false }))));
          if (yield cancelled()) {
            success = false;
            source.cancel();
          }
        }
        if (success === true && eventRequiresParentRefresh(event)) {
          yield put(actions.budget.request(null));
        }
      }
    }
  }

  function* handleDataChangeEvent(
    action: Redux.Action<Table.DataChangeEvent<BudgetTable.AccountRow, Model.Account>>
  ): SagaIterator {
    const objId = yield select(selectObjId);
    if (!isNil(objId) && !isNil(action.payload)) {
      const event: Table.DataChangeEvent<BudgetTable.AccountRow, Model.Account> = action.payload;

      const merged = consolidateTableChange(event.payload);
      if (merged.length !== 0) {
        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();
        const requestPayload: Http.BulkUpdatePayload<Http.AccountPayload>[] = map(
          merged,
          (change: Table.RowChange<BudgetTable.AccountRow, Model.Account>) => ({
            id: change.id,
            ...payload(change)
          })
        );
        // We do this to show the loading indicator next to the calculated fields of the footers,
        // otherwise, the loading indicators will not appear until the first API request
        // succeeds and we refresh the parent state.
        if (eventRequiresParentRefresh(event)) {
          yield put(actions.budget.loading(true));
        }
        let success = true;
        yield all(
          merged.map((change: Table.RowChange<BudgetTable.AccountRow, Model.Account>) =>
            put(actions.updating({ id: change.id, value: true }))
          )
        );
        try {
          yield call(services.bulkUpdate, objId, requestPayload, { cancelToken: source.token });
        } catch (e) {
          success = false;
          if (eventRequiresParentRefresh(event)) {
            yield put(actions.budget.loading(false));
          }
          if (!(yield cancelled())) {
            api.handleRequestError(e, "There was an error updating the accounts.");
          }
        } finally {
          yield all(
            merged.map((change: Table.RowChange<BudgetTable.AccountRow, Model.Account>) =>
              put(actions.updating({ id: change.id, value: false }))
            )
          );
          if (yield cancelled()) {
            success = false;
            source.cancel();
          }
        }
        if (success === true && eventRequiresParentRefresh(event)) {
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
          yield call(bulkCreateTask, { type: "rowAdd", payload: 2 });
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
