import axios from "axios";
import { SagaIterator } from "redux-saga";
import { call, put, select, fork, cancelled, all } from "redux-saga/effects";
import { isNil, map } from "lodash";

import * as api from "api";

import { consolidateTableChange, createBulkCreatePayload, payload, eventRequiresParentRefresh } from "lib/model/util";

type R = BudgetTable.SubAccountRow;
type M = Model.SubAccount;

export interface SubAccountTasksActionMap {
  deleting: Redux.ActionCreator<Redux.ModelListActionPayload>;
  creating: Redux.ActionCreator<boolean>;
  updating: Redux.ActionCreator<Redux.ModelListActionPayload>;
  addToState: Redux.ActionCreator<M>;
  loading: Redux.ActionCreator<boolean>;
  response: Redux.ActionCreator<Http.ListResponse<M>>;
  request: Redux.ActionCreator<null>;
  budget: {
    loading: Redux.ActionCreator<boolean>;
    request: Redux.ActionCreator<null>;
  };
  subaccount: {
    request: Redux.ActionCreator<null>;
    response: Redux.ActionCreator<M | undefined>;
  };
  groups: {
    removeFromState: Redux.ActionCreator<number>;
    deleting: Redux.ActionCreator<Redux.ModelListActionPayload>;
    loading: Redux.ActionCreator<boolean>;
    response: Redux.ActionCreator<Http.ListResponse<Model.Group>>;
    request: Redux.ActionCreator<null>;
  };
}

export interface SubAccountTaskSet {
  addToGroup: Redux.Task<{ id: number; group: number }>;
  removeFromGroup: Redux.Task<number>;
  deleteGroup: Redux.Task<number>;
  handleRowAddEvent: Redux.Task<Table.RowAddEvent<R, M>>;
  handleRowDeleteEvent: Redux.Task<Table.RowDeleteEvent<R, M>>;
  handleDataChangeEvent: Redux.Task<Table.DataChangeEvent<R, M>>;
  getSubAccounts: Redux.Task<null>;
  getGroups: Redux.Task<null>;
  getSubAccount: Redux.Task<null>;
  handleSubAccountChange: Redux.Task<number>;
}

export const createSubAccountTaskSet = (
  /* eslint-disable indent */
  actions: SubAccountTasksActionMap,
  selectSubAccountId: (state: Modules.ApplicationStore) => number | null,
  selectModels: (state: Modules.ApplicationStore) => M[],
  selectAutoIndex: (state: Modules.ApplicationStore) => boolean
): SubAccountTaskSet => {
  function* handleSubAccountChangeTask(action: Redux.Action<number>): SagaIterator {
    yield all([put(actions.subaccount.request(null)), put(actions.request(null)), put(actions.groups.request(null))]);
  }

  function* removeFromGroupTask(action: Redux.Action<number>): SagaIterator {
    if (!isNil(action.payload)) {
      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();
      yield put(actions.updating({ id: action.payload, value: true }));
      try {
        // NOTE: We do not need to update the SubAccount in state because the reducer will already
        // disassociate the SubAccount from the group.
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

  function* bulkCreateTask(subaccountId: number, e: Table.RowAddEvent<R, M>): SagaIterator {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    yield put(actions.creating(true));

    const data = yield select(selectModels);
    const autoIndex = yield select(selectAutoIndex);

    const requestPayload: Http.BulkCreatePayload<Http.SubAccountPayload> = createBulkCreatePayload<
      R,
      M,
      Http.SubAccountPayload
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
      const subaccounts: M[] = yield call(api.bulkCreateSubAccountSubAccounts, subaccountId, requestPayload, {
        cancelToken: source.token
      });
      yield all(subaccounts.map((subaccount: M) => put(actions.addToState(subaccount))));
    } catch (err) {
      success = false;
      if (eventRequiresParentRefresh(e)) {
        yield put(actions.budget.loading(false));
      }
      if (!(yield cancelled())) {
        api.handleRequestError(err, "There was an error creating the sub accounts.");
      }
    } finally {
      yield put(actions.creating(false));
      if (yield cancelled()) {
        source.cancel();
      }
    }
    if (success === true && eventRequiresParentRefresh(e)) {
      yield put(actions.budget.request(null));
    }
  }

  function* handleRowAddEvent(action: Redux.Action<Table.RowAddEvent<R, M>>): SagaIterator {
    const subaccountId = yield select(selectSubAccountId);
    if (!isNil(subaccountId) && !isNil(action.payload)) {
      const event: Table.RowAddEvent<R, M> = action.payload;
      yield fork(bulkCreateTask, subaccountId, event);
    }
  }

  function* handleRowDeleteEvent(action: Redux.Action<Table.RowDeleteEvent<R, M>>): SagaIterator {
    const subaccountId = yield select(selectSubAccountId);
    if (!isNil(subaccountId) && !isNil(action.payload)) {
      const e: Table.RowDeleteEvent<R, M> = action.payload;
      const rows = Array.isArray(e.payload.rows) ? e.payload.rows : [e.payload.rows];
      if (rows.length !== 0) {
        yield all(rows.map((row: R) => put(actions.deleting({ id: row.id, value: true }))));

        // We do this to show the loading indicator next to the calculated fields of the footers,
        // otherwise, the loading indicators will not appear until the first API request
        // succeeds and we refresh the parent state.
        if (eventRequiresParentRefresh(e)) {
          yield put(actions.budget.loading(true));
        }

        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();
        let success = true;
        try {
          yield call(
            api.bulkDeleteSubAccountSubAccounts,
            subaccountId,
            map(rows, (row: R) => row.id),
            { cancelToken: source.token }
          );
        } catch (err) {
          success = false;
          if (eventRequiresParentRefresh(e)) {
            yield put(actions.budget.loading(false));
          }
          if (!(yield cancelled())) {
            api.handleRequestError(err, "There was an error deleting the sub accounts.");
          }
        } finally {
          yield all(rows.map((row: R) => put(actions.deleting({ id: row.id, value: false }))));
          if (yield cancelled()) {
            success = false;
            source.cancel();
          }
        }
        if (success === true && eventRequiresParentRefresh(e)) {
          // NOTE: We update teh parent subaccount synchronously in the reducer.
          yield put(actions.budget.request(null));
        }
      }
    }
  }

  function* handleDataChangeEvent(action: Redux.Action<Table.DataChangeEvent<R, M>>): SagaIterator {
    const subaccountId = yield select(selectSubAccountId);
    if (!isNil(subaccountId) && !isNil(action.payload)) {
      const e: Table.DataChangeEvent<R, M> = action.payload;

      const merged = consolidateTableChange(e.payload);
      if (merged.length !== 0) {
        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();
        const requestPayload: Http.BulkUpdatePayload<Http.SubAccountPayload>[] = map(
          merged,
          (change: Table.RowChange<R, M>) => ({
            id: change.id,
            ...payload(change)
          })
        );
        // We do this to show the loading indicator next to the calculated fields of the footers,
        // otherwise, the loading indicators will not appear until the first API request
        // succeeds and we refresh the parent state.
        if (eventRequiresParentRefresh(e)) {
          yield put(actions.budget.loading(true));
        }

        let success = true;
        yield all(merged.map((change: Table.RowChange<R, M>) => put(actions.updating({ id: change.id, value: true }))));
        try {
          yield call(api.bulkUpdateSubAccountSubAccounts, subaccountId, requestPayload, { cancelToken: source.token });
        } catch (err) {
          success = false;
          if (eventRequiresParentRefresh(e)) {
            yield put(actions.budget.loading(false));
          }
          if (!(yield cancelled())) {
            api.handleRequestError(err, "There was an error updating the sub accounts.");
          }
        } finally {
          yield all(
            merged.map((change: Table.RowChange<R, M>) => put(actions.updating({ id: change.id, value: false })))
          );
          if (yield cancelled()) {
            success = false;
            source.cancel();
          }
        }
        if (success === true && eventRequiresParentRefresh(e)) {
          // NOTE: We update teh parent subaccount synchronously in the reducer.
          yield put(actions.budget.request(null));
        }
      }
    }
  }

  function* getGroupsTask(action: Redux.Action<null>): SagaIterator {
    const subaccountId = yield select(selectSubAccountId);
    if (!isNil(subaccountId)) {
      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();
      yield put(actions.groups.loading(true));
      try {
        const response: Http.ListResponse<Model.Group> = yield call(
          api.getSubAccountSubAccountGroups,
          subaccountId,
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
    const subaccountId = yield select(selectSubAccountId);
    if (!isNil(subaccountId)) {
      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();
      yield put(actions.loading(true));
      try {
        const response: Http.ListResponse<M> = yield call(
          api.getSubAccountSubAccounts,
          subaccountId,
          { no_pagination: true },
          { cancelToken: source.token }
        );
        yield put(actions.response(response));
        if (response.data.length === 0) {
          yield call(bulkCreateTask, subaccountId, { type: "rowAdd", payload: 2 });
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

  function* getSubAccountTask(action: Redux.Action<null>): SagaIterator {
    const subaccountId = yield select(selectSubAccountId);
    if (!isNil(subaccountId)) {
      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();

      try {
        const response: M = yield call(api.getSubAccount, subaccountId, { cancelToken: source.token });
        yield put(actions.subaccount.response(response));
      } catch (e) {
        if (!(yield cancelled())) {
          api.handleRequestError(e, "There was an error retrieving the sub account.");
          yield put(actions.subaccount.response(undefined, { error: e }));
        }
      } finally {
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
    handleRowDeleteEvent: handleRowDeleteEvent,
    handleRowAddEvent: handleRowAddEvent,
    getSubAccounts: getSubAccountsTask,
    getGroups: getGroupsTask,
    getSubAccount: getSubAccountTask,
    handleSubAccountChange: handleSubAccountChangeTask
  };
};
