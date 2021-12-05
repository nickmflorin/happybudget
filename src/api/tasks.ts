import axios from "axios";
import { SagaIterator } from "redux-saga";
import { call, cancelled } from "redux-saga/effects";
import * as Sentry from "@sentry/react";

import * as api from "api";

type ProvidedRequestOptions =
  | {
      readonly retries: number;
    }
  | {
      readonly headers: { [key: string]: string };
    };

export const isProvidedRequestConfig = (arg: any): arg is ProvidedRequestOptions =>
  typeof arg === "object" &&
  ((arg as { readonly retries: number }).retries !== undefined ||
    (arg as { readonly headers: { [key: string]: string } }).headers !== undefined);

export const request = <T = any>(service: Http.Service<T>, ...args: any[]) =>
  call(function* (): SagaIterator {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();

    let config: Http.RequestOptions = { cancelToken: source.token };
    if (args.length !== 0 && isProvidedRequestConfig(args[args.length - 1])) {
      config = { ...args[args.length - 1], ...config };
    }

    const handleCancel = (e: Error) => {
      // We do not want to return undefined for the response because that
      // will lead to errors in Sentry since the callees always expect
      // an error to be thrown or the response to be defined.  However, we
      // also don't want to dispatch the error to Sentry.
      Sentry.withScope((scope: Sentry.Scope) => {
        scope.setExtra("ignore", true);
        throw e;
      });
    };

    try {
      return yield call(service, ...args, config);
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
