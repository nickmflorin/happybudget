import axios from "axios";
import { SagaIterator } from "redux-saga";
import { call, put, select, fork, cancelled, all } from "redux-saga/effects";
import { isNil, map } from "lodash";

import * as api from "api";

import { consolidateTableChange, createBulkCreatePayload, payload } from "lib/model/util";

export interface SubAccountTasksActionMap {
  deleting: Redux.ActionCreator<Redux.ModelListActionPayload>;
  creating: Redux.ActionCreator<boolean>;
  updating: Redux.ActionCreator<Redux.ModelListActionPayload>;
  addToState: Redux.ActionCreator<Model.SubAccount>;
  loading: Redux.ActionCreator<boolean>;
  response: Redux.ActionCreator<Http.ListResponse<Model.SubAccount>>;
  request: Redux.ActionCreator<null>;
  budget: {
    loading: Redux.ActionCreator<boolean>;
    request: Redux.ActionCreator<null>;
  };
  subaccount: {
    loading: Redux.ActionCreator<boolean>;
    request: Redux.ActionCreator<null>;
    response: Redux.ActionCreator<Model.SubAccount | undefined>;
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
  handleRowAddEvent: Redux.Task<Table.RowAddEvent<BudgetTable.SubAccountRow, Model.SubAccount>>;
  handleRowDeleteEvent: Redux.Task<Table.RowDeleteEvent>;
  handleDataChangeEvent: Redux.Task<Table.DataChangeEvent<BudgetTable.SubAccountRow, Model.SubAccount>>;
  getSubAccounts: Redux.Task<null>;
  getGroups: Redux.Task<null>;
  getSubAccount: Redux.Task<null>;
  handleSubAccountChange: Redux.Task<number>;
}

export const createSubAccountTaskSet = (
  /* eslint-disable indent */
  actions: SubAccountTasksActionMap,
  selectSubAccountId: (state: Modules.ApplicationStore) => number | null,
  selectModels: (state: Modules.ApplicationStore) => Model.SubAccount[],
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

  function* bulkCreateTask(
    subaccountId: number,
    p: Table.RowAddPayload<BudgetTable.SubAccountRow, Model.SubAccount>
  ): SagaIterator {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    yield put(actions.creating(true));

    const data = yield select(selectModels);
    const autoIndex = yield select(selectAutoIndex);

    const requestPayload: Http.BulkCreatePayload<Http.SubAccountPayload> = createBulkCreatePayload<
      BudgetTable.SubAccountRow,
      Model.SubAccount,
      Http.SubAccountPayload
    >(p, {
      autoIndex,
      models: data,
      field: "identifier"
    });
    // We do this to show the loading indicator next to the calculated fields of the footers,
    // otherwise, the loading indicators will not appear until the first API request
    // succeeds and we refresh the parent state.
    yield all([put(actions.budget.loading(true)), put(actions.subaccount.loading(true))]);
    let success = true;
    try {
      const subaccounts: Model.SubAccount[] = yield call(
        api.bulkCreateSubAccountSubAccounts,
        subaccountId,
        requestPayload,
        {
          cancelToken: source.token
        }
      );
      yield all(subaccounts.map((subaccount: Model.SubAccount) => put(actions.addToState(subaccount))));
    } catch (e) {
      success = false;
      yield all([put(actions.budget.loading(false)), put(actions.subaccount.loading(false))]);
      if (!(yield cancelled())) {
        api.handleRequestError(e, "There was an error creating the sub accounts.");
      }
    } finally {
      yield put(actions.creating(false));
      if (yield cancelled()) {
        source.cancel();
      }
    }
    if (success === true) {
      yield all([put(actions.budget.request(null)), put(actions.subaccount.request(null))]);
    }
  }

  function* handleRowAddEvent(
    action: Redux.Action<Table.RowAddEvent<BudgetTable.SubAccountRow, Model.SubAccount>>
  ): SagaIterator {
    const subaccountId = yield select(selectSubAccountId);
    if (!isNil(subaccountId) && !isNil(action.payload)) {
      const event: Table.RowAddEvent<BudgetTable.SubAccountRow, Model.SubAccount> = action.payload;
      yield fork(bulkCreateTask, subaccountId, event.payload);
    }
  }

  function* handleRowDeleteEvent(action: Redux.Action<Table.RowDeleteEvent>): SagaIterator {
    const subaccountId = yield select(selectSubAccountId);
    if (!isNil(subaccountId) && !isNil(action.payload)) {
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
          yield call(api.bulkDeleteSubAccountSubAccounts, subaccountId, ids, { cancelToken: source.token });
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
          // NOTE: We update teh parent subaccount synchronously in the reducer.
          yield put(actions.budget.request(null));
        }
      }
    }
  }

  function* handleDataChangeEvent(
    action: Redux.Action<Table.DataChangeEvent<BudgetTable.SubAccountRow, Model.SubAccount>>
  ): SagaIterator {
    const subaccountId = yield select(selectSubAccountId);
    if (!isNil(subaccountId) && !isNil(action.payload)) {
      const event: Table.DataChangeEvent<BudgetTable.SubAccountRow, Model.SubAccount> = action.payload;

      const merged = consolidateTableChange(event.payload);
      if (merged.length !== 0) {
        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();
        const requestPayload: Http.BulkUpdatePayload<Http.SubAccountPayload>[] = map(
          merged,
          (change: Table.RowChange<BudgetTable.SubAccountRow, Model.SubAccount>) => ({
            id: change.id,
            ...payload(change)
          })
        );
        // We do this to show the loading indicator next to the calculated fields of the footers,
        // otherwise, the loading indicators will not appear until the first API request
        // succeeds and we refresh the parent state.
        yield put(actions.budget.loading(true));
        let success = true;
        yield all(
          merged.map((change: Table.RowChange<BudgetTable.SubAccountRow, Model.SubAccount>) =>
            put(actions.updating({ id: change.id, value: true }))
          )
        );
        try {
          yield call(api.bulkUpdateSubAccountSubAccounts, subaccountId, requestPayload, { cancelToken: source.token });
        } catch (e) {
          success = false;
          yield put(actions.budget.loading(false));
          if (!(yield cancelled())) {
            api.handleRequestError(e, "There was an error updating the sub accounts.");
          }
        } finally {
          yield all(
            merged.map((change: Table.RowChange<BudgetTable.SubAccountRow, Model.SubAccount>) =>
              put(actions.updating({ id: change.id, value: false }))
            )
          );
          if (yield cancelled()) {
            success = false;
            source.cancel();
          }
        }
        if (success === true) {
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
        const response: Http.ListResponse<Model.SubAccount> = yield call(
          api.getSubAccountSubAccounts,
          subaccountId,
          { no_pagination: true },
          { cancelToken: source.token }
        );
        yield put(actions.response(response));
        if (response.data.length === 0) {
          yield call(bulkCreateTask, subaccountId, 2);
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
      let showLoadingIndicator = true;
      if (!isNil(action.meta) && action.meta.showLoadingIndicator === false) {
        showLoadingIndicator = false;
      }
      if (showLoadingIndicator) {
        yield put(actions.subaccount.loading(true));
      }
      try {
        const response: Model.SubAccount = yield call(api.getSubAccount, subaccountId, { cancelToken: source.token });
        yield put(actions.subaccount.response(response));
      } catch (e) {
        if (!(yield cancelled())) {
          api.handleRequestError(e, "There was an error retrieving the sub account.");
          yield put(actions.subaccount.response(undefined, { error: e }));
        }
      } finally {
        if (showLoadingIndicator) {
          yield put(actions.subaccount.loading(false));
        }
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
