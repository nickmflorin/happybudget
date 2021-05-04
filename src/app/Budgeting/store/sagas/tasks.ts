import { SagaIterator } from "redux-saga";
import { call, put, cancelled } from "redux-saga/effects";
import axios from "axios";
import { handleRequestError } from "api";
import { getFringeColors } from "api/services";
import { loadingFringeColorsAction, responseFringeColorsAction } from "../actions";

export function* getFringeColorsTask(): SagaIterator {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  yield put(loadingFringeColorsAction(true));
  try {
    const response = yield call(getFringeColors, { cancelToken: source.token });
    yield put(responseFringeColorsAction(response));
  } catch (e) {
    if (!(yield cancelled())) {
      handleRequestError(e, "There was an error retrieving the budget's fringe colors.");
      yield put(responseFringeColorsAction({ count: 0, data: [] }, { error: e }));
    }
  } finally {
    yield put(loadingFringeColorsAction(false));
    if (yield cancelled()) {
      source.cancel();
    }
  }
}
