import axios from "axios";
import { SagaIterator } from "redux-saga";
import { call, put, select, fork, cancelled, all } from "redux-saga/effects";
import { isNil, find, map } from "lodash";

import { handleRequestError } from "api";
import {
  getAccountSubAccounts,
  updateSubAccount,
  deleteSubAccount,
  getAccount,
  deleteGroup,
  getAccountSubAccountGroups,
  bulkUpdateAccountSubAccounts,
  bulkCreateAccountSubAccounts
} from "api/services";

import { isAction } from "lib/redux/typeguards";
import { warnInconsistentState } from "lib/redux/util";
import { RowManager } from "lib/model";
import { consolidateTableChange } from "lib/model/util";
import { handleTableErrors } from "store/tasks";

import { createBulkCreatePayload } from "./util";

export interface AccountTasksActionMap<
  A extends Model.TemplateAccount | Model.BudgetAccount,
  SA extends Model.TemplateSubAccount | Model.BudgetSubAccount,
  G extends Model.TemplateGroup | Model.BudgetGroup
> {
  deleting: Redux.ActionCreator<Redux.ModelListActionPayload>;
  creating: Redux.ActionCreator<boolean>;
  updating: Redux.ActionCreator<Redux.ModelListActionPayload>;
  removeFromState: Redux.ActionCreator<number>;
  addErrorsToState: Redux.ActionCreator<Table.CellError | Table.CellError[]>;
  updateInState: Redux.ActionCreator<Redux.UpdateModelActionPayload<SA>>;
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

export interface AccountTaskSet<R extends Table.Row<G>, G extends Model.TemplateGroup | Model.BudgetGroup> {
  addToGroup: Redux.Task<{ id: number; group: number }>;
  removeFromGroup: Redux.Task<number>;
  deleteGroup: Redux.Task<number>;
  bulkCreate: Redux.Task<number>;
  handleRemoval: Redux.Task<number>;
  handleTableChange: Redux.Task<Table.Change<R>>;
  getSubAccounts: Redux.Task<null>;
  getGroups: Redux.Task<null>;
  getAccount: Redux.Task<null>;
  handleAccountChange: Redux.Task<number>;
}

export const createAccountTaskSet = <
  A extends Model.TemplateAccount | Model.BudgetAccount,
  SA extends Model.TemplateSubAccount | Model.BudgetSubAccount,
  R extends Table.Row<G>,
  G extends Model.TemplateGroup | Model.BudgetGroup
>(
  /* eslint-disable indent */
  actions: AccountTasksActionMap<A, SA, G>,
  manager: RowManager<R, SA, Http.SubAccountPayload, G>,
  selectAccountId: (state: Redux.ApplicationStore) => number | null,
  selectModels: (state: Redux.ApplicationStore) => SA[],
  selectAutoIndex: (state: Redux.ApplicationStore) => boolean
): AccountTaskSet<R, G> => {
  function* handleAccountChangeTask(action: Redux.Action<number>): SagaIterator {
    yield all([put(actions.account.request(null)), put(actions.request(null)), put(actions.groups.request(null))]);
  }

  function* removeFromGroupTask(action: Redux.Action<number>): SagaIterator {
    if (!isNil(action.payload)) {
      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();
      yield put(actions.updating({ id: action.payload, value: true }));
      try {
        yield call(updateSubAccount, action.payload, { group: null }, { cancelToken: source.token });
      } catch (e) {
        if (!(yield cancelled())) {
          yield call(
            handleTableErrors,
            e,
            "There was an error removing the sub account from the group.",
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

  function* addToGroupTask(action: Redux.Action<{ id: number; group: number }>): SagaIterator {
    if (!isNil(action.payload)) {
      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();
      yield put(actions.updating({ id: action.payload.id, value: true }));
      try {
        yield call(updateSubAccount, action.payload.id, { group: action.payload.group }, { cancelToken: source.token });
      } catch (e) {
        if (!(yield cancelled())) {
          yield call(
            handleTableErrors,
            e,
            "There was an error adding the sub account to the the group.",
            action.payload.id,
            (errors: Table.CellError[]) => actions.addErrorsToState(errors)
          );
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
        yield call(deleteGroup, action.payload, { cancelToken: source.token });
        yield put(actions.groups.removeFromState(action.payload));
      } catch (e) {
        if (!(yield cancelled())) {
          handleRequestError(e, "There was an error deleting the sub account group.");
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
    // We do this to show the loading indicator next to the calculated fields of the Budget Footer Row,
    // otherwise, the loading indicators will not appear until `yield put(requestTemplateAction)`, and there
    // is a lag between the time that this task is called and that task is called.
    yield put(actions.budget.loading(true));
    let success = true;
    try {
      yield call(deleteSubAccount, id, { cancelToken: source.token });
    } catch (e) {
      success = false;
      yield put(actions.budget.loading(false));
      if (!(yield cancelled())) {
        handleRequestError(e, "There was an error deleting the sub account.");
      }
    } finally {
      yield put(actions.deleting({ id: id, value: false }));
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
    const accountId = yield select(selectAccountId);
    if (!isNil(accountId)) {
      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();
      const requestPayload: Http.BulkUpdatePayload<Http.SubAccountPayload>[] = map(
        changes,
        (change: Table.RowChange<R>) => ({
          id: change.id,
          ...manager.payload(change)
        })
      );
      yield all(changes.map((change: Table.RowChange<R>) => put(actions.updating({ id: change.id, value: true }))));
      try {
        yield call(bulkUpdateAccountSubAccounts, accountId, requestPayload, { cancelToken: source.token });
      } catch (e) {
        // Once we rebuild back in the error handling, we will have to be concerned here with the nested
        // structure of the errors.
        if (!(yield cancelled())) {
          yield call(
            handleTableErrors,
            e,
            "There was an error updating the sub accounts.",
            accountId,
            (errors: Table.CellError[]) => actions.addErrorsToState(errors)
          );
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
    const accountId = yield select(selectAccountId);
    if (!isNil(accountId) && (!isAction(action) || !isNil(action.payload))) {
      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();
      yield put(actions.creating(true));

      const data = yield select(selectModels);
      const autoIndex = yield select(selectAutoIndex);
      const count = isAction(action) ? action.payload : action;
      const payload = createBulkCreatePayload(data, count, autoIndex) as Http.BulkCreatePayload<Http.SubAccountPayload>;

      try {
        const subaccounts: SA[] = yield call(bulkCreateAccountSubAccounts, accountId, payload, {
          cancelToken: source.token
        });
        yield all(subaccounts.map((subaccount: SA) => put(actions.addToState(subaccount))));
      } catch (e) {
        // Once we rebuild back in the error handling, we will have to be concerned here with the nested
        // structure of the errors.
        if (!(yield cancelled())) {
          yield call(
            handleTableErrors,
            e,
            "There was an error creating the sub accounts.",
            accountId,
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
    if (!isNil(action.payload)) {
      const models: SA[] = yield select(selectModels);
      const model: SA | undefined = find(models, { id: action.payload } as any);
      if (isNil(model)) {
        warnInconsistentState({
          action: action.type,
          reason: "Sub Account does not exist in state when it is expected to.",
          id: action.payload
        });
      } else {
        yield put(actions.removeFromState(model.id));
        yield call(deleteTask, model.id);
      }
    }
  }

  function* handleTableChangeTask(action: Redux.Action<Table.Change<R>>): SagaIterator {
    const accountId = yield select(selectAccountId);
    if (!isNil(accountId) && !isNil(action.payload)) {
      const merged = consolidateTableChange(action.payload);
      const data = yield select(selectModels);

      const mergedUpdates: Table.RowChange<R>[] = [];
      for (let i = 0; i < merged.length; i++) {
        const model: SA | undefined = find(data, { id: merged[i].id });
        if (isNil(model)) {
          warnInconsistentState({
            action: action.type,
            reason: "Sub Account does not exist in state when it is expected to.",
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
    const accountId = yield select(selectAccountId);
    if (!isNil(accountId)) {
      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();
      yield put(actions.groups.loading(true));
      try {
        const response: Http.ListResponse<G> = yield call(
          getAccountSubAccountGroups,
          accountId,
          { no_pagination: true },
          { cancelToken: source.token }
        );
        yield put(actions.groups.response(response));
      } catch (e) {
        if (!(yield cancelled())) {
          handleRequestError(e, "There was an error retrieving the account's sub account groups.");
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
          getAccountSubAccounts,
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
          handleRequestError(e, "There was an error retrieving the account's sub accounts.");
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
        const response: A = yield call(getAccount, accountId, { cancelToken: source.token });
        yield put(actions.account.response(response));
      } catch (e) {
        if (!(yield cancelled())) {
          handleRequestError(e, "There was an error retrieving the account.");
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
    bulkCreate: bulkCreateTask,
    handleRemoval: handleRemovalTask,
    handleTableChange: handleTableChangeTask,
    getSubAccounts: getSubAccountsTask,
    getGroups: getGroupsTask,
    getAccount: getAccountTask,
    handleAccountChange: handleAccountChangeTask
  };
};
