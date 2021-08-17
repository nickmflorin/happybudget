import axios from "axios";
import { SagaIterator } from "redux-saga";
import { call, put, select, cancelled, all } from "redux-saga/effects";
import { isNil } from "lodash";

import * as api from "api";

type R = Tables.SubAccountRow;
type M = Model.SubAccount;

export type SubAccountTasksActionMap = Redux.ReadOnlyBudgetTableActionCreatorMap<M> & {
  budget: {
    loading: Redux.ActionCreator<boolean>;
  };
  subaccount: {
    request: Redux.ActionCreator<null>;
    response: Redux.ActionCreator<M | undefined>;
  };
};

export type SubAccountTaskSet = Redux.ReadOnlyBudgetTableTaskMap<R, M> & {
  getSubAccount: Redux.Task<null>;
  handleSubAccountChange: Redux.Task<number>;
};

export const createSubAccountTaskSet = (
  /* eslint-disable indent */
  actions: SubAccountTasksActionMap,
  selectSubAccountId: (state: Modules.Unauthenticated.Store) => number | null
): SubAccountTaskSet => {
  function* handleSubAccountChange(action: Redux.Action<number>): SagaIterator {
    yield all([put(actions.subaccount.request(null)), put(actions.request(null)), put(actions.groups.request(null))]);
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
        const response: Http.ListResponse<M> = yield call(
          api.getSubAccountSubAccounts,
          subaccountId,
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

  function* getSubAccount(action: Redux.Action<null>): SagaIterator {
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
    request: getSubAccounts,
    requestGroups: getGroups,
    getSubAccount: getSubAccount,
    handleSubAccountChange: handleSubAccountChange
  };
};
