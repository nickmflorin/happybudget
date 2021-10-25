import axios from "axios";
import { SagaIterator } from "redux-saga";
import { put, call, cancelled } from "redux-saga/effects";

import { actions } from "store";
import { NotFoundError } from "./errors";

type Service<T = any> = (...args: any[]) => T;

export const request = <T = any>(service: Service<T>, ...args: any[]) =>
  call(function* (): SagaIterator {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    try {
      return yield call(service, ...args, { cancelToken: source.token });
    } catch (e: unknown) {
      if (!(yield cancelled())) {
        if (e instanceof NotFoundError) {
          yield put(actions.redirect404Action(true));
        } else {
          throw e;
        }
      } else {
        console.info("Service was cancelled.");
      }
    } finally {
      if (yield cancelled()) {
        source.cancel();
      }
    }
  });
