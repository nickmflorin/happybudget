import axios from "axios";
import { SagaIterator } from "redux-saga";
import { call, cancelled } from "redux-saga/effects";
import * as Sentry from "@sentry/react";

import { isNil } from "lodash";

import * as api from "api";

export const isProvidedRequestConfig = <ARGS extends unknown[]>(arg: ARGS[number]): arg is Http.RequestOptions =>
  typeof arg === "object" &&
  ((arg as Http.RequestOptions).headers !== undefined ||
    (arg as Http.RequestOptions).publicToken !== undefined ||
    (arg as Http.RequestOptions).timeout !== undefined);

export const request = <R, ARGS extends unknown[]>(service: Http.Service<R, ARGS>, ...args: ARGS) =>
  call<() => SagaIterator<R>>(function* (): SagaIterator {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();

    let config: Http.RequestOptions = { cancelToken: source.token };
    const opts = args[args.length - 1];
    if (!isNil(opts) && isProvidedRequestConfig<ARGS>(opts)) {
      config = { ...(opts as Http.RequestOptions), ...config };
    }

    const handleCancel = (e: Error) => {
      /* We do not want to return undefined for the response because that
         will lead to errors in Sentry since the callees always expect
         an error to be thrown or the response to be defined.  However, we
         also don't want to dispatch the error to Sentry. */
      Sentry.withScope((scope: Sentry.Scope) => {
        scope.setExtra("ignore", true);
        throw e;
      });
    };
    const callingArgs = [...(args.slice(0, args.length - 1) as ARGS), config] as ARGS;
    try {
      return yield call(service, ...callingArgs);
    } catch (e: unknown) {
      const err = e as Error;
      if (!(err instanceof api.ForceLogout)) {
        if (!(yield cancelled())) {
          if (!axios.isCancel(err)) {
            throw e;
          }
          handleCancel(err);
        } else {
          console.info("Service was cancelled.");
          handleCancel(err);
        }
      } else {
        handleCancel(err);
      }
    } finally {
      if (yield cancelled()) {
        source.cancel();
      }
    }
  });
