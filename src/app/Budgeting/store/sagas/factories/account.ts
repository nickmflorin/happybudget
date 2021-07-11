import axios from "axios";
import { SagaIterator } from "redux-saga";
import { call, put, select, fork, cancelled, all } from "redux-saga/effects";
import { isNil, map } from "lodash";

import * as api from "api";

import { RowManager } from "lib/model";
import { consolidateTableChange } from "lib/model/util";

import { createBulkCreatePayload } from "./util";

export interface AccountTasksActionMap<
  A extends Model.Account | Model.Account,
  SA extends Model.SubAccount | Model.SubAccount,
  G extends Model.Group | Model.Group
> {
  deleting: Redux.ActionCreator<Redux.ModelListActionPayload>;
  creating: Redux.ActionCreator<boolean>;
  updating: Redux.ActionCreator<Redux.ModelListActionPayload>;
  addToState: Redux.ActionCreator<SA>;
  loading: Redux.ActionCreator<boolean>;
  response: Redux.ActionCreator<Http.ListResponse<SA>>;
  request: Redux.ActionCreator<null>;
  budget: {
    loading: Redux.ActionCreator<boolean>;
    request: Redux.ActionCreator<null>;
  };
  account: {
    loading: Redux.ActionCreator<boolean>;
    request: Redux.ActionCreator<null>;
    response: Redux.ActionCreator<A | undefined>;
  };
  groups: {
    removeFromState: Redux.ActionCreator<number>;
    deleting: Redux.ActionCreator<Redux.ModelListActionPayload>;
    loading: Redux.ActionCreator<boolean>;
    response: Redux.ActionCreator<Http.ListResponse<G>>;
    request: Redux.ActionCreator<null>;
  };
}

export interface AccountTaskSet<R extends Table.Row> {
  addToGroup: Redux.Task<{ id: number; group: number }>;
  removeFromGroup: Redux.Task<number>;
  deleteGroup: Redux.Task<number>;
  handleRowAddEvent: Redux.Task<Table.RowAddEvent<R>>;
  handleRowDeleteEvent: Redux.Task<Table.RowDeleteEvent>;
  handleDataChangeEvent: Redux.Task<Table.DataChangeEvent<R>>;
  getSubAccounts: Redux.Task<null>;
  getGroups: Redux.Task<null>;
  getAccount: Redux.Task<null>;
  handleAccountChange: Redux.Task<number>;
}

export const createAccountTaskSet = <
  A extends Model.Account | Model.Account,
  SA extends Model.SubAccount | Model.SubAccount,
  R extends Table.Row,
  G extends Model.Group | Model.Group
>(
  /* eslint-disable indent */
  actions: AccountTasksActionMap<A, SA, G>,
  manager: RowManager<R, SA, Http.SubAccountPayload>,
  selectAccountId: (state: Modules.ApplicationStore) => number | null,
  selectModels: (state: Modules.ApplicationStore) => SA[],
  selectAutoIndex: (state: Modules.ApplicationStore) => boolean
): AccountTaskSet<R> => {
  function* handleAccountChangeTask(action: Redux.Action<number>): SagaIterator {
    yield all([put(actions.account.request(null)), put(actions.request(null)), put(actions.groups.request(null))]);
  }

  function* removeFromGroupTask(action: Redux.Action<number>): SagaIterator {
    if (!isNil(action.payload)) {
      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();
      yield put(actions.updating({ id: action.payload, value: true }));
      try {
        yield call(api.updateSubAccount, action.payload, { group: null }, { cancelToken: source.token });
      } catch (e) {
        if (!(yield cancelled())) {
          api.handleRequestError(e, "There was an error removing the sub account from the group.");
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
          api.updateSubAccount,
          action.payload.id,
          { group: action.payload.group },
          { cancelToken: source.token }
        );
      } catch (e) {
        if (!(yield cancelled())) {
          api.handleRequestError(e, "There was an error adding the sub account to the the group.");
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
          api.handleRequestError(e, "There was an error deleting the sub account group.");
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
    const accountId = yield select(selectAccountId);
    if (!isNil(accountId)) {
      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();
      yield put(actions.creating(true));

      const data = yield select(selectModels);
      const autoIndex = yield select(selectAutoIndex);

      const requestPayload: Http.BulkCreatePayload<Http.SubAccountPayload> = createBulkCreatePayload<
        R,
        Http.SubAccountPayload,
        SA
      >(payload, manager, {
        autoIndex,
        models: data
      });
      let success = true;

      // We do this to show the loading indicator next to the calculated fields of the footers,
      // otherwise, the loading indicators will not appear until the first API request
      // succeeds and we refresh the parent state.
      yield put(actions.budget.loading(true));

      try {
        const subaccounts: SA[] = yield call(api.bulkCreateAccountSubAccounts, accountId, requestPayload, {
          cancelToken: source.token
        });
        yield all(subaccounts.map((subaccount: SA) => put(actions.addToState(subaccount))));
      } catch (e) {
        success = false;
        yield put(actions.budget.loading(false));
        if (!(yield cancelled())) {
          api.handleRequestError(e, "There was an error creating the sub accounts.");
        }
      } finally {
        yield put(actions.creating(false));
        if (yield cancelled()) {
          success = false;
          source.cancel();
        }
      }
      if (success === true) {
        // NOTE: We update teh parent account synchronously in the reducer.
        yield put(actions.budget.request(null));
      }
    }
  }

  function* handleRowAddEvent(action: Redux.Action<Table.RowAddEvent<R>>): SagaIterator {
    const accountId = yield select(selectAccountId);
    if (!isNil(accountId) && !isNil(action.payload)) {
      const event: Table.RowAddEvent<R> = action.payload;
      yield fork(bulkCreateTask, event.payload);
    }
  }

  function* handleRowDeleteEvent(action: Redux.Action<Table.RowDeleteEvent>): SagaIterator {
    const accountId = yield select(selectAccountId);
    if (!isNil(accountId) && !isNil(action.payload)) {
      const event: Table.RowDeleteEvent = action.payload;
      const ids = Array.isArray(event.payload) ? event.payload : [event.payload];
      if (ids.length !== 0) {
        yield all(ids.map((id: number) => put(actions.deleting({ id, value: true }))));
        // We do this to show the loading indicator next to the calculated fields of the footers,
        // otherwise, the loading indicators will not appear until the first API request
        // succeeds and we refresh the parent state.
        yield put(actions.budget.loading(true));
        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();
        let success = true;
        try {
          yield call(api.bulkDeleteAccountSubAccounts, accountId, ids, { cancelToken: source.token });
        } catch (e) {
          success = false;
          yield put(actions.budget.loading(false));
          if (!(yield cancelled())) {
            api.handleRequestError(e, "There was an error deleting the sub accounts.");
          }
        } finally {
          yield all(ids.map((id: number) => put(actions.deleting({ id, value: false }))));
          if (yield cancelled()) {
            success = false;
            source.cancel();
          }
        }
        if (success === true) {
          // NOTE: We update teh parent account synchronously in the reducer.
          yield put(actions.budget.request(null));
        }
      }
    }
  }

  function* handleDataChangeEvent(action: Redux.Action<Table.DataChangeEvent<R>>): SagaIterator {
    const accountId = yield select(selectAccountId);
    if (!isNil(accountId) && !isNil(action.payload)) {
      const event: Table.DataChangeEvent<R> = action.payload;
      const merged = consolidateTableChange(event.payload);
      if (merged.length !== 0) {
        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();
        const requestPayload: Http.BulkUpdatePayload<Http.SubAccountPayload>[] = map(
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
          yield call(api.bulkUpdateAccountSubAccounts, accountId, requestPayload, { cancelToken: source.token });
        } catch (e) {
          success = false;
          yield put(actions.budget.loading(false));
          if (!(yield cancelled())) {
            api.handleRequestError(e, "There was an error updating the sub accounts.");
          }
        } finally {
          yield all(merged.map((change: Table.RowChange<R>) => put(actions.updating({ id: change.id, value: false }))));
          if (yield cancelled()) {
            success = false;
            source.cancel();
          }
        }
        if (success === true) {
          // NOTE: We update teh parent account synchronously in the reducer.
          yield put(actions.budget.request(null));
        }
      }
    }
  }

  function* getGroupsTask(action: Redux.Action<null>): SagaIterator {
    const accountId = yield select(selectAccountId);
    if (!isNil(accountId)) {
      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();
      yield put(actions.groups.loading(true));
      try {
        const response: Http.ListResponse<G> = yield call(
          api.getAccountSubAccountGroups,
          accountId,
          { no_pagination: true },
          { cancelToken: source.token }
        );
        yield put(actions.groups.response(response));
      } catch (e) {
        if (!(yield cancelled())) {
          api.handleRequestError(e, "There was an error retrieving the account's sub account groups.");
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

  function* getSubAccountsTask(action: Redux.Action<null>): SagaIterator {
    const accountId = yield select(selectAccountId);
    if (!isNil(accountId)) {
      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();
      yield put(actions.loading(true));
      try {
        const response: Http.ListResponse<SA> = yield call(
          api.getAccountSubAccounts,
          accountId,
          { no_pagination: true },
          { cancelToken: source.token }
        );
        yield put(actions.response(response));
        if (response.data.length === 0) {
          yield call(bulkCreateTask, 2);
        }
      } catch (e) {
        if (!(yield cancelled())) {
          api.handleRequestError(e, "There was an error retrieving the account's sub accounts.");
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

  function* getAccountTask(action: Redux.Action<null>): SagaIterator {
    const accountId = yield select(selectAccountId);
    if (!isNil(accountId)) {
      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();
      let showLoadingIndicator = true;
      if (!isNil(action.meta) && action.meta.showLoadingIndicator === false) {
        showLoadingIndicator = false;
      }
      if (showLoadingIndicator) {
        yield put(actions.account.loading(true));
      }
      try {
        const response: A = yield call(api.getAccount, accountId, { cancelToken: source.token });
        yield put(actions.account.response(response));
      } catch (e) {
        if (!(yield cancelled())) {
          api.handleRequestError(e, "There was an error retrieving the account.");
          yield put(actions.account.response(undefined, { error: e }));
        }
      } finally {
        if (showLoadingIndicator) {
          yield put(actions.account.loading(false));
        }
        if (yield cancelled()) {
          source.cancel();
        }
      }
    }
  }

  return {
    removeFromGroup: removeFromGroupTask,
    addToGroup: addToGroupTask,
    deleteGroup: deleteGroupTask,
    handleRowAddEvent: handleRowAddEvent,
    handleRowDeleteEvent: handleRowDeleteEvent,
    handleDataChangeEvent: handleDataChangeEvent,
    getSubAccounts: getSubAccountsTask,
    getGroups: getGroupsTask,
    getAccount: getAccountTask,
    handleAccountChange: handleAccountChangeTask
  };
};
