import axios from "axios";
import { SagaIterator } from "redux-saga";
import { call, put, select, fork, cancelled, all } from "redux-saga/effects";
import { isNil, find, map } from "lodash";

import * as api from "api";
import * as models from "lib/model";

import { isAction } from "lib/redux/typeguards";
import { warnInconsistentState } from "lib/redux/util";
import { consolidateTableChange } from "lib/model/util";

import { createBulkCreatePayload } from "./util";

export interface AccountsTasksActionMap<
  A extends Model.TemplateAccount | Model.BudgetAccount,
  G extends Model.TemplateGroup | Model.BudgetGroup
> {
  deleting: Redux.ActionCreator<Redux.ModelListActionPayload>;
  creating: Redux.ActionCreator<boolean>;
  updating: Redux.ActionCreator<Redux.ModelListActionPayload>;
  removeFromState: Redux.ActionCreator<number>;
  updateInState: Redux.ActionCreator<Redux.UpdateModelActionPayload<A>>;
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
  A extends Model.TemplateAccount | Model.BudgetAccount,
  G extends Model.TemplateGroup | Model.BudgetGroup,
  P extends Http.TemplateAccountPayload | Http.BudgetAccountPayload
> {
  bulkUpdate: (id: number, data: Http.BulkUpdatePayload<P>[], options: Http.RequestOptions) => Promise<M>;
  bulkCreate: (id: number, payload: Http.BulkCreatePayload<P>, options: Http.RequestOptions) => Promise<A[]>;
  getAccounts: (id: number, query: Http.ListQuery, options: Http.RequestOptions) => Promise<Http.ListResponse<A>>;
  getGroups: (id: number, query: Http.ListQuery, options: Http.RequestOptions) => Promise<Http.ListResponse<G>>;
}

export interface AccountsTaskSet<R extends Table.Row> {
  addToGroup: Redux.Task<{ id: number; group: number }>;
  removeFromGroup: Redux.Task<number>;
  deleteGroup: Redux.Task<number>;
  bulkCreate: Redux.Task<number>;
  handleRemoval: Redux.Task<number>;
  handleTableChange: Redux.Task<Table.Change<R>>;
  getAccounts: Redux.Task<null>;
  getGroups: Redux.Task<null>;
}

export const createAccountsTaskSet = <
  M extends Model.Template | Model.Budget,
  A extends Model.TemplateAccount | Model.BudgetAccount,
  R extends Table.Row,
  G extends Model.TemplateGroup | Model.BudgetGroup,
  P extends Http.TemplateAccountPayload | Http.BudgetAccountPayload
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

  function* deleteTask(id: number): SagaIterator {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    yield put(actions.deleting({ id, value: true }));
    yield put(actions.budget.loading(true));
    let success = true;
    try {
      yield call(api.deleteAccount, id, { cancelToken: source.token });
    } catch (e) {
      success = false;
      yield put(actions.budget.loading(false));
      if (!(yield cancelled())) {
        api.handleRequestError(e, "There was an error deleting the account.");
      }
    } finally {
      yield put(actions.deleting({ id, value: false }));
      if (yield cancelled()) {
        success = false;
        source.cancel();
      }
    }
    if (success === true) {
      yield put(actions.budget.request(null));
    }
  }

  function* bulkUpdateTask(changes: Table.RowChange<R>[]): SagaIterator {
    const objId = yield select(selectObjId);
    if (!isNil(objId)) {
      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();
      const requestPayload: Http.BulkUpdatePayload<P>[] = map(changes, (change: Table.RowChange<R>) => ({
        id: change.id,
        ...manager.payload(change)
      }));
      yield all(changes.map((change: Table.RowChange<R>) => put(actions.updating({ id: change.id, value: true }))));
      try {
        yield call(services.bulkUpdate, objId, requestPayload, { cancelToken: source.token });
      } catch (e) {
        // Once we rebuild back in the error handling, we will have to be concerned here with the nested
        // structure of the errors.
        if (!(yield cancelled())) {
          api.handleRequestError(e, "There was an error updating the accounts.");
        }
      } finally {
        yield all(changes.map((change: Table.RowChange<R>) => put(actions.updating({ id: change.id, value: false }))));
        if (yield cancelled()) {
          source.cancel();
        }
      }
    }
  }

  function* bulkCreateTask(action: Redux.Action<number> | number): SagaIterator {
    const objId = yield select(selectObjId);
    if (!isNil(objId) && (!isAction(action) || !isNil(action.payload))) {
      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();
      yield put(actions.creating(true));

      const autoIndex = yield select(selectAutoIndex);
      const count = isAction(action) ? action.payload : action;
      const data = yield select(selectModels);

      const payload = createBulkCreatePayload(data, count, autoIndex) as Http.BulkCreatePayload<P>;

      try {
        const accounts: A[] = yield call(services.bulkCreate, objId, payload, { cancelToken: source.token });
        yield all(accounts.map((account: A) => put(actions.addToState(account))));
      } catch (e) {
        // Once we rebuild back in the error handling, we will have to be concerned here with the nested
        // structure of the errors.
        if (!(yield cancelled())) {
          api.handleRequestError(e, "There was an error creating the accounts.");
        }
      } finally {
        yield put(actions.creating(false));
        if (yield cancelled()) {
          source.cancel();
        }
      }
    }
  }

  function* handleRemovalTask(action: Redux.Action<number>): SagaIterator {
    if (!isNil(action.payload) && !(yield cancelled())) {
      const ms: A[] = yield select(selectModels);
      const model: A | undefined = find(ms, { id: action.payload } as any);
      if (isNil(model)) {
        warnInconsistentState({
          action: action.type,
          reason: "Account does not exist in state when it is expected to.",
          id: action.payload
        });
      } else {
        yield put(actions.removeFromState(model.id));
        yield call(deleteTask, model.id);
      }
    }
  }

  function* handleTableChangeTask(action: Redux.Action<Table.Change<R>>): SagaIterator {
    const objId = yield select(selectObjId);
    if (!isNil(objId) && !isNil(action.payload)) {
      const merged = consolidateTableChange(action.payload);
      const data = yield select(selectModels);

      const mergedUpdates: Table.RowChange<R>[] = [];
      for (let i = 0; i < merged.length; i++) {
        const model: A | undefined = find(data, { id: merged[i].id });
        if (isNil(model)) {
          warnInconsistentState({
            action: action.type,
            reason: "Account does not exist in state when it is expected to.",
            id: merged[i].id
          });
        } else {
          const updatedModel = manager.mergeChangesWithModel(model, merged[i]);
          yield put(actions.updateInState({ id: updatedModel.id, data: updatedModel }));
          mergedUpdates.push(merged[i]);
        }
      }
      yield put(actions.budget.request(null));
      if (mergedUpdates.length !== 0) {
        yield fork(bulkUpdateTask, mergedUpdates);
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
    bulkCreate: bulkCreateTask,
    handleRemoval: handleRemovalTask,
    handleTableChange: handleTableChangeTask,
    getAccounts: getAccountsTask,
    getGroups: getGroupsTask
  };
};
