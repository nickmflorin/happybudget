import axios from "axios";
import { SagaIterator } from "redux-saga";
import { call, put, select, fork, cancelled, all } from "redux-saga/effects";
import { isNil, find, map, groupBy } from "lodash";

import { handleRequestError } from "api";
import {
  getSubAccountSubAccounts,
  updateSubAccount,
  deleteSubAccount,
  getSubAccount,
  deleteGroup,
  getSubAccountSubAccountGroups,
  bulkUpdateSubAccountSubAccounts,
  bulkCreateSubAccountSubAccounts
} from "api/services";

import { isAction } from "lib/redux/typeguards";
import { warnInconsistentState } from "lib/redux/util";
import RowManager from "lib/tabling/managers";
import { mergeRowChanges } from "lib/tabling/util";
import { handleTableErrors } from "store/tasks";

export interface SubAccountTasksActionMap<
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
  subaccount: {
    loading: Redux.ActionCreator<boolean>;
    request: Redux.ActionCreator<null>;
    response: Redux.ActionCreator<SA | undefined>;
  };
  groups: {
    removeFromState: Redux.ActionCreator<number>;
    deleting: Redux.ActionCreator<Redux.ModelListActionPayload>;
    loading: Redux.ActionCreator<boolean>;
    response: Redux.ActionCreator<Http.ListResponse<G>>;
    request: Redux.ActionCreator<null>;
  };
}

export interface SubAccountTaskSet<R extends Table.Row<G>, G extends Model.TemplateGroup | Model.BudgetGroup> {
  removeFromGroup: Redux.Task<number>;
  deleteGroup: Redux.Task<number>;
  bulkCreate: Redux.Task<number>;
  handleRemoval: Redux.Task<number>;
  handleUpdate: Redux.Task<Table.RowChange<R>>;
  handleBulkUpdate: Redux.Task<Table.RowChange<R>[]>;
  getSubAccounts: Redux.Task<null>;
  getGroups: Redux.Task<null>;
  getSubAccount: Redux.Task<null>;
  handleSubAccountChange: Redux.Task<number>;
}

export const createSubAccountTaskSet = <
  SA extends Model.TemplateSubAccount | Model.BudgetSubAccount,
  R extends Table.Row<G>,
  G extends Model.TemplateGroup | Model.BudgetGroup
>(
  /* eslint-disable indent */
  actions: SubAccountTasksActionMap<SA, G>,
  manager: RowManager<R, SA, G>,
  selectSubAccountId: (state: Redux.ApplicationStore) => number | null,
  selectModels: (state: Redux.ApplicationStore) => SA[]
): SubAccountTaskSet<R, G> => {
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
    // otherwise, the loading indicators will not appear until `yield put(actions.budget.request)`, and there
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

  function* updateTask(id: number, change: Table.RowChange<R>): SagaIterator {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    yield put(actions.updating({ id, value: true }));
    // We do this to show the loading indicator next to the calculated fields of the Budget Footer Row,
    // otherwise, the loading indicators will not appear until `yield put(actions.budget.request)`, and there
    // is a lag between the time that this task is called and that task is called.
    yield put(actions.budget.loading(true));
    let success = true;
    try {
      yield call(updateSubAccount, id, manager.payload(change), { cancelToken: source.token });
    } catch (e) {
      success = false;
      yield put(actions.budget.loading(false));
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
        success = false;
        source.cancel();
      }
    }
    if (success === true) {
      yield put(actions.budget.request(null));
    }
  }

  function* bulkUpdateTask(changes: Table.RowChange<R>[]): SagaIterator {
    const subaccountId = yield select(selectSubAccountId);
    if (!isNil(subaccountId)) {
      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();
      const requestPayload: Http.BulkUpdatePayload<Http.SubAccountPayload>[] = map(
        changes,
        (change: Table.RowChange<R>) => ({
          id: change.id,
          ...manager.payload(change)
        })
      );
      for (let i = 0; i++; i < changes.length) {
        yield put(actions.updating({ id: changes[i].id, value: true }));
      }
      try {
        yield call(bulkUpdateSubAccountSubAccounts, subaccountId, requestPayload, { cancelToken: source.token });
      } catch (e) {
        // Once we rebuild back in the error handling, we will have to be concerned here with the nested
        // structure of the errors.
        if (!(yield cancelled())) {
          yield call(
            handleTableErrors,
            e,
            "There was an error updating the sub accounts.",
            subaccountId,
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
    const subaccountId = yield select(selectSubAccountId);
    if (!isNil(subaccountId) && (!isAction(action) || !isNil(action.payload))) {
      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();
      yield put(actions.creating(true));
      try {
        const subaccounts: SA[] = yield call(
          bulkCreateSubAccountSubAccounts,
          subaccountId,
          { count: isAction(action) ? action.payload : action },
          { cancelToken: source.token }
        );
        for (let i = 0; i < subaccounts.length; i++) {
          yield put(actions.addToState(subaccounts[i]));
        }
      } catch (e) {
        // Once we rebuild back in the error handling, we will have to be concerned here with the nested
        // structure of the errors.
        if (!(yield cancelled())) {
          yield call(
            handleTableErrors,
            e,
            "There was an error creating the sub accounts.",
            subaccountId,
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

  function* handleBulkUpdateTask(action: Redux.Action<Table.RowChange<R>[]>): SagaIterator {
    const subaccountId = yield select(selectSubAccountId);
    if (!isNil(subaccountId) && !isNil(action.payload)) {
      const grouped = groupBy(action.payload, "id") as { [key: string]: Table.RowChange<R>[] };
      const merged: Table.RowChange<R>[] = map(grouped, (changes: Table.RowChange<R>[], id: string) => {
        return { data: mergeRowChanges(changes).data, id: parseInt(id) };
      });

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

  function* handleUpdateTask(action: Redux.Action<Table.RowChange<R>>): SagaIterator {
    const subaccountId = yield select(selectSubAccountId);
    if (!isNil(subaccountId) && !isNil(action.payload)) {
      const id = action.payload.id;
      const data = yield select(selectModels);
      const model: SA | undefined = find(data, { id });
      if (isNil(model)) {
        warnInconsistentState({
          action: action.type,
          reason: "Sub Account does not exist in state when it is expected to.",
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
    const subaccountId = yield select(selectSubAccountId);
    if (!isNil(subaccountId)) {
      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();
      yield put(actions.groups.loading(true));
      try {
        const response: Http.ListResponse<G> = yield call(
          getSubAccountSubAccountGroups,
          subaccountId,
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
    const subaccountId = yield select(selectSubAccountId);
    if (!isNil(subaccountId)) {
      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();
      yield put(actions.loading(true));
      try {
        const response: Http.ListResponse<SA> = yield call(
          getSubAccountSubAccounts,
          subaccountId,
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
        const response: SA = yield call(getSubAccount, subaccountId, { cancelToken: source.token });
        yield put(actions.subaccount.response(response));
      } catch (e) {
        if (!(yield cancelled())) {
          handleRequestError(e, "There was an error retrieving the sub account.");
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
    removeFromGroup: removeFromGroupTask,
    deleteGroup: deleteGroupTask,
    bulkCreate: bulkCreateTask,
    handleRemoval: handleRemovalTask,
    handleUpdate: handleUpdateTask,
    handleBulkUpdate: handleBulkUpdateTask,
    getSubAccounts: getSubAccountsTask,
    getGroups: getGroupsTask,
    getSubAccount: getSubAccountTask,
    handleSubAccountChange: handleSubAccountChangeTask
  };
};