import axios from "axios";
import { SagaIterator } from "redux-saga";
import { call, put, select, cancelled, all } from "redux-saga/effects";
import { isNil } from "lodash";

import * as api from "api";

type R = Tables.SubAccountRow;
type M = Model.SubAccount;

export type AccountTasksActionMap = Redux.ReadOnlyBudgetTableActionCreatorMap<M> & {
  budget: {
    loading: Redux.ActionCreator<boolean>;
  };
  account: {
    request: Redux.ActionCreator<null>;
    response: Redux.ActionCreator<Model.Account | undefined>;
  };
};

export type AccountTaskSet = Redux.ReadOnlyBudgetTableTaskMap<R, M> & {
  getAccount: Redux.Task<null>;
  handleAccountChange: Redux.Task<number>;
};

export const createAccountTaskSet = (
  /* eslint-disable indent */
  actions: AccountTasksActionMap,
  selectAccountId: (state: Modules.Unauthenticated.StoreObj) => number | null
): AccountTaskSet => {
  function* handleAccountChange(action: Redux.Action<number>): SagaIterator {
    yield all([put(actions.account.request(null)), put(actions.request(null)), put(actions.groups.request(null))]);
  }

  function* getGroups(action: Redux.Action<null>): SagaIterator {
    const accountId = yield select(selectAccountId);
    if (!isNil(accountId)) {
      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();
      yield put(actions.groups.loading(true));
      try {
        const response: Http.ListResponse<Model.Group> = yield call(
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

  function* getSubAccounts(action: Redux.Action<null>): SagaIterator {
    const accountId = yield select(selectAccountId);
    if (!isNil(accountId)) {
      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();
      yield put(actions.loading(true));
      try {
        const response: Http.ListResponse<M> = yield call(
          api.getAccountSubAccounts,
          accountId,
          { no_pagination: true },
          { cancelToken: source.token }
        );
        yield put(actions.response(response));
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

  function* getAccount(action: Redux.Action<null>): SagaIterator {
    const accountId = yield select(selectAccountId);
    if (!isNil(accountId)) {
      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();

      try {
        const response: Model.Account = yield call(api.getAccount, accountId, { cancelToken: source.token });
        yield put(actions.account.response(response));
      } catch (e) {
        if (!(yield cancelled())) {
          api.handleRequestError(e, "There was an error retrieving the account.");
          yield put(actions.account.response(undefined, { error: e }));
        }
      } finally {
        if (yield cancelled()) {
          source.cancel();
        }
      }
    }
  }

  return {
    request: getSubAccounts,
    requestGroups: getGroups,
    getAccount: getAccount,
    handleAccountChange: handleAccountChange
  };
};
