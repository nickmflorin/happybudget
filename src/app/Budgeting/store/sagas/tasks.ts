import { SagaIterator } from "redux-saga";
import { call, put, cancelled } from "redux-saga/effects";
import axios from "axios";

import * as api from "api";

import {
  loadingFringeColorsAction,
  responseFringeColorsAction,
  loadingSubAccountUnitsAction,
  responseSubAccountUnitsAction
} from "../actions";

export function* getFringeColorsTask(): SagaIterator {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  yield put(loadingFringeColorsAction(true));
  try {
    const response = yield call(api.getFringeColors, { cancelToken: source.token });
    yield put(responseFringeColorsAction(response));
  } catch (e) {
    if (!(yield cancelled())) {
      api.handleRequestError(e, "There was an error retrieving the budget's fringe colors.");
      yield put(responseFringeColorsAction({ count: 0, data: [] }, { error: e }));
    }
  } finally {
    yield put(loadingFringeColorsAction(false));
    if (yield cancelled()) {
      source.cancel();
    }
  }
}

export function* getSubAccountUnitsTask(): SagaIterator {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  yield put(loadingSubAccountUnitsAction(true));
  try {
    const response = yield call(api.getSubAccountUnits, { cancelToken: source.token });
    yield put(responseSubAccountUnitsAction(response));
  } catch (e) {
    if (!(yield cancelled())) {
      api.handleRequestError(e, "There was an error retrieving the budget's sub-account units.");
      yield put(responseSubAccountUnitsAction({ count: 0, data: [] }, { error: e }));
    }
  } finally {
    yield put(loadingSubAccountUnitsAction(false));
    if (yield cancelled()) {
      source.cancel();
    }
  }
}
