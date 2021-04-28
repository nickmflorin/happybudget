import axios from "axios";
import { SagaIterator } from "redux-saga";
import { call, put, select, fork, cancelled } from "redux-saga/effects";
import { isNil, find, map, groupBy } from "lodash";

import { handleRequestError } from "api";
import { deleteAccount, updateAccount, deleteGroup } from "api/services";

import { isAction } from "lib/redux/typeguards";
import { warnInconsistentState } from "lib/redux/util";
import RowManager from "lib/tabling/managers";
import { mergeRowChanges } from "lib/tabling/util";
import { handleTableErrors } from "store/tasks";

export interface AccountsTasksActionMap<
  A extends Model.TemplateAccount | Model.BudgetAccount,
  G extends Model.TemplateGroup | Model.BudgetGroup
> {
  deleting: Redux.ActionCreator<Redux.ModelListActionPayload>;
  creating: Redux.ActionCreator<boolean>;
  updating: Redux.ActionCreator<Redux.ModelListActionPayload>;
  removeFromState: Redux.ActionCreator<number>;
  addErrorsToState: Redux.ActionCreator<Table.CellError | Table.CellError[]>;
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

export interface AccountsTaskSet<R extends Table.Row<G>, G extends Model.TemplateGroup | Model.BudgetGroup> {
  removeFromGroup: Redux.Task<number>;
  deleteGroup: Redux.Task<number>;
  bulkCreate: Redux.Task<number>;
  handleRemoval: Redux.Task<number>;
  handleUpdate: Redux.Task<Table.RowChange<R>>;
  handleBulkUpdate: Redux.Task<Table.RowChange<R>[]>;
  getAccounts: Redux.Task<null>;
  getGroups: Redux.Task<null>;
}

export const createAccountsTaskSet = <
  M extends Model.Template | Model.Budget,
  A extends Model.TemplateAccount | Model.BudgetAccount,
  R extends Table.Row<G>,
  G extends Model.TemplateGroup | Model.BudgetGroup,
  P extends Http.TemplateAccountPayload | Http.BudgetAccountPayload
>(
  /* eslint-disable indent */
  actions: AccountsTasksActionMap<A, G>,
  services: AccountsServiceSet<M, A, G, P>,
  manager: RowManager<R, A, G, P>,
  selectObjId: (state: Redux.ApplicationStore) => number | null,
  selectModels: (state: Redux.ApplicationStore) => A[]
): AccountsTaskSet<R, G> => {
  function* removeFromGroupTask(action: Redux.Action<number>): SagaIterator {
    if (!isNil(action.payload)) {
      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();
      yield put(actions.updating({ id: action.payload, value: true }));
      try {
        yield call(updateAccount, action.payload, { group: null }, { cancelToken: source.token });
      } catch (e) {
        if (!(yield cancelled())) {
          yield call(
            handleTableErrors,
            e,
            "There was an error removing the account from the group.",
            action.payload,
            (errors: Table.CellError[]) => actions.addErrorsToState(errors)
          );
        }
      } finally {
        yield put(actions.updating({ id: action.payload, value: false }));
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
        yield call(deleteGroup, action.payload, { cancelToken: source.token });
        yield put(actions.groups.removeFromState(action.payload));
      } catch (e) {
        if (!(yield cancelled())) {
          handleRequestError(e, "There was an error deleting the account group.");
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
      yield call(deleteAccount, id, { cancelToken: source.token });
    } catch (e) {
      success = false;
      yield put(actions.budget.loading(false));
      if (!(yield cancelled())) {
        handleRequestError(e, "There was an error deleting the account.");
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

  function* updateTask(id: number, change: Table.RowChange<R>): SagaIterator {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    yield put(actions.updating({ id, value: true }));
    try {
      yield call(updateAccount, id, manager.payload(change), { cancelToken: source.token });
    } catch (e) {
      if (!(yield cancelled())) {
        yield call(
          handleTableErrors,
          e,
          "There was an error updating the sub account.",
          id,
          (errors: Table.CellError[]) => actions.addErrorsToState(errors)
        );
      }
    } finally {
      yield put(actions.updating({ id, value: false }));
      if (yield cancelled()) {
        source.cancel();
      }
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
      for (let i = 0; i++; i < changes.length) {
        yield put(actions.updating({ id: changes[i].id, value: true }));
      }
      try {
        yield call(services.bulkUpdate, objId, requestPayload, { cancelToken: source.token });
      } catch (e) {
        // Once we rebuild back in the error handling, we will have to be concerned here with the nested
        // structure of the errors.
        if (!(yield cancelled())) {
          yield call(
            handleTableErrors,
            e,
            "There was an error updating the accounts.",
            objId,
            (errors: Table.CellError[]) => actions.addErrorsToState(errors)
          );
        }
      } finally {
        for (let i = 0; i++; i < changes.length) {
          yield put(actions.updating({ id: changes[i].id, value: false }));
        }
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
      try {
        const accounts: A[] = yield call(
          services.bulkCreate,
          objId,
          { count: isAction(action) ? action.payload : action },
          { cancelToken: source.token }
        );
        for (let i = 0; i < accounts.length; i++) {
          yield put(actions.addToState(accounts[i]));
        }
      } catch (e) {
        // Once we rebuild back in the error handling, we will have to be concerned here with the nested
        // structure of the errors.
        if (!(yield cancelled())) {
          yield call(
            handleTableErrors,
            e,
            "There was an error creating the accounts.",
            objId,
            (errors: Table.CellError[]) => actions.addErrorsToState(errors)
          );
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
      const models: A[] = yield select(selectModels);
      const model: A | undefined = find(models, { id: action.payload } as any);
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

  function* handleBulkUpdateTask(action: Redux.Action<Table.RowChange<R>[]>): SagaIterator {
    const objId = yield select(selectObjId);
    if (!isNil(objId) && !isNil(action.payload)) {
      const grouped = groupBy(action.payload, "id") as { [key: string]: Table.RowChange<R>[] };
      const merged: Table.RowChange<R>[] = map(grouped, (changes: Table.RowChange<R>[], id: string) => {
        return { data: mergeRowChanges(changes).data, id: parseInt(id) };
      });

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
      if (mergedUpdates.length !== 0) {
        yield fork(bulkUpdateTask, mergedUpdates);
      }
    }
  }

  function* handleUpdateTask(action: Redux.Action<Table.RowChange<R>>): SagaIterator {
    const objId = yield select(selectObjId);
    if (!isNil(objId) && !isNil(action.payload)) {
      const id = action.payload.id;
      const data: A[] = yield select(selectModels);
      const model: A | undefined = find(data, { id } as any);
      if (isNil(model)) {
        warnInconsistentState({
          action: action.type,
          reason: "Account does not exist in state when it is expected to.",
          id: action.payload.id
        });
      } else {
        const updatedModel = manager.mergeChangesWithModel(model, action.payload);
        yield put(actions.updateInState({ id: updatedModel.id, data: updatedModel }));
        yield call(updateTask, model.id, action.payload);
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
          handleRequestError(e, "There was an error retrieving the account groups.");
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
          handleRequestError(e, "There was an error retrieving the accounts.");
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
    removeFromGroup: removeFromGroupTask,
    deleteGroup: deleteGroupTask,
    bulkCreate: bulkCreateTask,
    handleRemoval: handleRemovalTask,
    handleUpdate: handleUpdateTask,
    handleBulkUpdate: handleBulkUpdateTask,
    getAccounts: getAccountsTask,
    getGroups: getGroupsTask
  };
};
