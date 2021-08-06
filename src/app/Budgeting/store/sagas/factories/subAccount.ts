import axios from "axios";
import { SagaIterator } from "redux-saga";
import { call, put, select, fork, cancelled, all } from "redux-saga/effects";
import { isNil, map } from "lodash";

import * as api from "api";
import { tabling } from "lib";

type R = Tables.SubAccountRow;
type M = Model.SubAccount;
type C = Model.SubAccount;
type P = Http.SubAccountPayload;

export interface SubAccountTasksActionMap<B extends Model.Budget | Model.Template> {
  deleting: Redux.ActionCreator<Redux.ModelListActionPayload>;
  creating: Redux.ActionCreator<boolean>;
  updating: Redux.ActionCreator<Redux.ModelListActionPayload>;
  addToState: Redux.ActionCreator<C>;
  loading: Redux.ActionCreator<boolean>;
  response: Redux.ActionCreator<Http.ListResponse<C>>;
  request: Redux.ActionCreator<null>;
  budget: {
    loading: Redux.ActionCreator<boolean>;
    updateInState: Redux.ActionCreator<Partial<B>>;
  };
  subaccount: {
    request: Redux.ActionCreator<null>;
    response: Redux.ActionCreator<C | undefined>;
  };
  groups: {
    deleting: Redux.ActionCreator<Redux.ModelListActionPayload>;
    loading: Redux.ActionCreator<boolean>;
    response: Redux.ActionCreator<Http.ListResponse<Model.Group>>;
    request: Redux.ActionCreator<null>;
  };
}

export interface SubAccountTaskSet {
  handleRowAddEvent: Redux.Task<Table.RowAddEvent<R, C>>;
  handleRowDeleteEvent: Redux.Task<Table.RowDeleteEvent<R, C>>;
  handleDataChangeEvent: Redux.Task<Table.DataChangeEvent<R, C>>;
  handleAddRowToGroupEvent: Redux.Task<Table.RowAddToGroupEvent<R, C>>;
  handleRemoveRowFromGroupEvent: Redux.Task<Table.RowRemoveFromGroupEvent<R, C>>;
  handleDeleteGroupEvent: Redux.Task<Table.GroupDeleteEvent>;
  getSubAccounts: Redux.Task<null>;
  getGroups: Redux.Task<null>;
  getSubAccount: Redux.Task<null>;
  handleSubAccountChange: Redux.Task<number>;
}

export const createSubAccountTaskSet = <B extends Model.Budget | Model.Template>(
  /* eslint-disable indent */
  actions: SubAccountTasksActionMap<B>,
  selectSubAccountId: (state: Modules.ApplicationStore) => number | null,
  selectModels: (state: Modules.ApplicationStore) => C[],
  selectAutoIndex: (state: Modules.ApplicationStore) => boolean
): SubAccountTaskSet => {
  function* bulkCreateTask(subaccountId: number, e: Table.RowAddEvent<R, C>, errorMessage: string): SagaIterator {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();

    const data = yield select(selectModels);
    const autoIndex = yield select(selectAutoIndex);

    const requestPayload: Http.BulkCreatePayload<P> = tabling.util.createBulkCreatePayload<R, C, P>(e.payload, {
      autoIndex,
      models: data,
      field: "identifier"
    });
    if (tabling.util.eventWarrantsRecalculation(e)) {
      yield put(actions.budget.loading(true));
    }
    yield put(actions.creating(true));
    try {
      const response: Http.BudgetBulkCreateResponse<B, M, C> = yield call(
        api.bulkCreateSubAccountSubAccounts,
        subaccountId,
        requestPayload,
        { cancelToken: source.token }
      );
      /*
      Note: We also have access to the updated Account from the response (as response.data)
      so we could use this to update the overall Account in state.  However, the reducer handles
      that logic pre-request currently, although in the future we may want to use the response
      data as the fallback/source of truth.
      */
      if (tabling.util.eventWarrantsRecalculation(e)) {
        yield put(actions.budget.updateInState(response.budget as Partial<B>));
      }
      yield all(response.children.map((subaccount: C) => put(actions.addToState(subaccount))));
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
    subaccountId: number,
    e: Table.ChangeEvent<R, C>,
    requestPayload: Http.BulkUpdatePayload<P>[],
    errorMessage: string
  ): SagaIterator {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    /*
    TODO: In the case of modifications to the rows of a group, would it be more appropriate
    to instead indicate that the group is being updated?
    There is a discrepancy between what we are indicating as loading between removing a row
    from the group and deleting the group itself.
    */
    yield all(requestPayload.map((p: Http.BulkUpdatePayload<P>) => put(actions.updating({ id: p.id, value: true }))));
    if (!tabling.typeguards.isGroupEvent(e) && tabling.util.eventWarrantsRecalculation(e)) {
      yield put(actions.budget.loading(true));
    }
    try {
      const response: Http.BudgetBulkResponse<B, M> = yield call(
        api.bulkUpdateSubAccountSubAccounts,
        subaccountId,
        requestPayload,
        { cancelToken: source.token }
      );
      /*
      Note: We also have access to the updated Account from the response (as response.data)
      so we could use this to update the overall Account in state.  However, the reducer handles
      that logic pre-request currently, although in the future we may want to use the response
      data as the fallback/source of truth.
      */
      if (!tabling.typeguards.isGroupEvent(e) && tabling.util.eventWarrantsRecalculation(e)) {
        yield put(actions.budget.updateInState(response.budget as Partial<B>));
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

  function* bulkDeleteTask(subaccountId: number, e: Table.RowDeleteEvent<R, C>, errorMessage: string): SagaIterator {
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
        const response: Http.BudgetBulkResponse<B, C> = yield call(
          api.bulkDeleteSubAccountSubAccounts,
          subaccountId,
          ids,
          { cancelToken: source.token }
        );
        /*
        Note: We also have access to the updated SubAccount from the response (as response.data)
        so we could use this to update the overall SubAccount in state.  However, the reducer handles
        that logic pre-request currently, although in the future we may want to use the response
        data as the fallback/source of truth.
        */
        if (tabling.util.eventWarrantsRecalculation(e)) {
          yield put(actions.budget.updateInState(response.budget as Partial<B>));
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

  function* handleSubAccountChange(action: Redux.Action<number>): SagaIterator {
    yield all([put(actions.subaccount.request(null)), put(actions.request(null)), put(actions.groups.request(null))]);
  }

  function* handleRemoveRowFromGroupEvent(action: Redux.Action<Table.RowRemoveFromGroupEvent<R, C>>): SagaIterator {
    const subaccountId = yield select(selectSubAccountId);
    if (!isNil(action.payload) && !isNil(subaccountId)) {
      const e: Table.RowRemoveFromGroupEvent<R, C> = action.payload;
      const rows: R[] = Array.isArray(e.payload.rows) ? e.payload.rows : [e.payload.rows];
      const requestPayload: Http.BulkUpdatePayload<P>[] = map(rows, (row: R) => ({
        id: row.id,
        group: null
      }));
      yield fork(
        bulkUpdateTask,
        subaccountId,
        e,
        requestPayload,
        "There was an error removing the sub account from the group."
      );
    }
  }

  function* handleAddRowToGroupEvent(action: Redux.Action<Table.RowAddToGroupEvent<R, C>>): SagaIterator {
    const subaccountId = yield select(selectSubAccountId);
    if (!isNil(action.payload) && !isNil(subaccountId)) {
      const e: Table.RowAddToGroupEvent<R, C> = action.payload;
      const rows: R[] = Array.isArray(e.payload.rows) ? e.payload.rows : [e.payload.rows];
      const requestPayload: Http.BulkUpdatePayload<P>[] = map(rows, (row: R) => ({
        id: row.id,
        group: e.payload.group
      }));
      yield fork(
        bulkUpdateTask,
        subaccountId,
        e,
        requestPayload,
        "There was an error adding the sub account to the group."
      );
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
          api.handleRequestError(err, "There was an error deleting the sub account group.");
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
    const subaccountId = yield select(selectSubAccountId);
    if (!isNil(action.payload) && !isNil(subaccountId)) {
      const e: Table.RowAddEvent<R, C> = action.payload;
      yield fork(bulkCreateTask, subaccountId, e, "There was an error creating the sub accounts.");
    }
  }

  function* handleRowDeleteEvent(action: Redux.Action<Table.RowDeleteEvent<R, C>>): SagaIterator {
    const subaccountId = yield select(selectSubAccountId);
    if (!isNil(action.payload) && !isNil(subaccountId)) {
      const e: Table.RowDeleteEvent<R, C> = action.payload;
      yield fork(bulkDeleteTask, subaccountId, e, "There was an error deleting the sub accounts.");
    }
  }

  function* handleDataChangeEvent(action: Redux.Action<Table.DataChangeEvent<R, C>>): SagaIterator {
    const subaccountId = yield select(selectSubAccountId);
    if (!isNil(action.payload) && !isNil(subaccountId)) {
      const e: Table.DataChangeEvent<R, C> = action.payload;
      const merged = tabling.util.consolidateTableChange(e.payload);
      if (merged.length !== 0) {
        const requestPayload: Http.BulkUpdatePayload<P>[] = map(merged, (change: Table.RowChange<R, C>) => ({
          id: change.id,
          ...tabling.util.payload(change)
        }));
        yield fork(bulkUpdateTask, subaccountId, e, requestPayload, "There was an error updating the sub accounts.");
      }
    }
  }

  function* getGroups(action: Redux.Action<null>): SagaIterator {
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

  function* getSubAccounts(action: Redux.Action<null>): SagaIterator {
    const subaccountId = yield select(selectSubAccountId);
    if (!isNil(subaccountId)) {
      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();
      yield put(actions.loading(true));
      try {
        const response: Http.ListResponse<C> = yield call(
          api.getSubAccountSubAccounts,
          subaccountId,
          { no_pagination: true },
          { cancelToken: source.token }
        );
        yield put(actions.response(response));
        if (response.data.length === 0) {
          yield call(
            bulkCreateTask,
            subaccountId,
            { type: "rowAdd", payload: 2 },
            "There was an error creating the sub accounts."
          );
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

  function* getSubAccount(action: Redux.Action<null>): SagaIterator {
    const subaccountId = yield select(selectSubAccountId);
    if (!isNil(subaccountId)) {
      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();

      try {
        const response: C = yield call(api.getSubAccount, subaccountId, { cancelToken: source.token });
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
    handleRemoveRowFromGroupEvent: handleRemoveRowFromGroupEvent,
    handleAddRowToGroupEvent: handleAddRowToGroupEvent,
    handleDeleteGroupEvent: handleDeleteGroupEvent,
    handleRowAddEvent: handleRowAddEvent,
    handleRowDeleteEvent: handleRowDeleteEvent,
    handleDataChangeEvent: handleDataChangeEvent,
    getSubAccounts: getSubAccounts,
    getGroups: getGroups,
    getSubAccount: getSubAccount,
    handleSubAccountChange: handleSubAccountChange
  };
};
