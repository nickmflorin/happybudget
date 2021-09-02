import axios from "axios";
import { SagaIterator } from "redux-saga";
import { call, put, select, cancelled } from "redux-saga/effects";
import { isNil } from "lodash";

import * as api from "api";

type R = Tables.AccountRow;
type C = Model.Account;

export type AccountsTasksActionMap = Redux.ReadOnlyBudgetTableActionCreatorMap<C> & {
  budget: {
    loading: Redux.ActionCreator<boolean>;
  };
};

export interface AccountsServiceSet {
  getAccounts: (id: number, query: Http.ListQuery, options: Http.RequestOptions) => Promise<Http.ListResponse<C>>;
  getGroups: (
    id: number,
    query: Http.ListQuery,
    options: Http.RequestOptions
  ) => Promise<Http.ListResponse<Model.Group>>;
}

export type AccountsTaskSet = Redux.ReadOnlyBudgetTableTaskMap<R, C>;

export const createAccountsTaskSet = (
  /* eslint-disable indent */
  actions: AccountsTasksActionMap,
  services: AccountsServiceSet,
  selectObjId: (state: Modules.Unauthenticated.StoreObj) => number | null
): AccountsTaskSet => {
  function* getGroups(action: Redux.Action<null>): SagaIterator {
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
      } catch (e: unknown) {
        if (!(yield cancelled())) {
          api.handleRequestError(e as Error, "There was an error retrieving the account groups.");
          yield put(actions.groups.response({ count: 0, data: [] }, { error: e as Error }));
        }
      } finally {
        yield put(actions.groups.loading(false));
        if (yield cancelled()) {
          source.cancel();
        }
      }
    }
  }

  function* getAccounts(action: Redux.Action<null>): SagaIterator {
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
      } catch (e: unknown) {
        if (!(yield cancelled())) {
          api.handleRequestError(e as Error, "There was an error retrieving the accounts.");
          yield put(actions.response({ count: 0, data: [] }, { error: e as Error }));
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
    requestGroups: getGroups,
    request: getAccounts
  };
};
