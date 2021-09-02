import axios from "axios";
import { SagaIterator } from "redux-saga";
import { put, call, cancelled } from "redux-saga/effects";

import * as api from "api";
import { redux } from "lib";
import { actions } from "store";

export function* getSubAccountUnitsTask(action: Redux.Action): SagaIterator {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  yield put(
    redux.actions.toggleActionOnAuthentication(
      actions.authenticated.loadingSubAccountUnitsAction(true),
      actions.unauthenticated.loadingSubAccountUnitsAction(true),
      action
    )
  );
  try {
    const response = yield call(api.getSubAccountUnits, { cancelToken: source.token });
    yield put(
      redux.actions.toggleActionOnAuthentication(
        actions.authenticated.responseSubAccountUnitsAction(response),
        actions.unauthenticated.responseSubAccountUnitsAction(response),
        action
      )
    );
  } catch (e: unknown) {
    if (!(yield cancelled())) {
      api.handleRequestError(e as Error, "There was an error retrieving the budget's sub-account units.");
      yield put(
        redux.actions.toggleActionOnAuthentication(
          actions.authenticated.responseSubAccountUnitsAction({ count: 0, data: [] }, { error: e as Error }),
          actions.unauthenticated.responseSubAccountUnitsAction({ count: 0, data: [] }, { error: e as Error }),
          action
        )
      );
    }
  } finally {
    yield put(
      redux.actions.toggleActionOnAuthentication(
        actions.authenticated.loadingSubAccountUnitsAction(false),
        actions.unauthenticated.loadingSubAccountUnitsAction(false),
        action
      )
    );
    if (yield cancelled()) {
      source.cancel();
    }
  }
}

export function* getContactsTask(action: Redux.Action): SagaIterator {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  yield put(
    redux.actions.toggleActionOnAuthentication(
      actions.authenticated.loadingContactsAction(true),
      actions.unauthenticated.loadingContactsAction(true),
      action
    )
  );
  try {
    const response: Http.ListResponse<Model.Contact> = yield call(api.getContacts, {}, { cancelToken: source.token });
    yield put(
      redux.actions.toggleActionOnAuthentication(
        actions.authenticated.responseContactsAction(response),
        actions.unauthenticated.responseContactsAction(response),
        action
      )
    );
  } catch (e: unknown) {
    if (!(yield cancelled())) {
      api.handleRequestError(e as Error, "There was an error retrieving the contacts.");
      yield put(
        redux.actions.toggleActionOnAuthentication(
          actions.authenticated.responseContactsAction({ count: 0, data: [] }, { error: e as Error }),
          actions.unauthenticated.responseContactsAction({ count: 0, data: [] }, { error: e as Error }),
          action
        )
      );
    }
  } finally {
    yield put(
      redux.actions.toggleActionOnAuthentication(
        actions.authenticated.loadingContactsAction(false),
        actions.unauthenticated.loadingContactsAction(false),
        action
      )
    );
    if (yield cancelled()) {
      source.cancel();
    }
  }
}
