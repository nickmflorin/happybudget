import axios from "axios";
import { SagaIterator } from "redux-saga";
import { call, cancelled } from "redux-saga/effects";

type Service<T = any> = (...args: any[]) => T;

type ProvidedRequestOptions =
  | {
      readonly redirectOn404: boolean;
    }
  | {
      readonly retries: number;
    }
  | {
      readonly headers: { [key: string]: string };
    };

export const isProvidedRequestConfig = (arg: any): arg is ProvidedRequestOptions =>
  typeof arg === "object" &&
  ((arg as { readonly redirectOn404: boolean }).redirectOn404 !== undefined ||
    (arg as { readonly retries: number }).retries !== undefined ||
    (arg as { readonly headers: { [key: string]: string } }).headers !== undefined);

export const request = <T = any>(service: Service<T>, ...args: any[]) =>
  call(function* (): SagaIterator {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();

    let config: Http.RequestOptions = { cancelToken: source.token };
    if (args.length !== 0 && isProvidedRequestConfig(args[args.length - 1])) {
      config = { ...args[args.length - 1], ...config };
    }
    try {
      return yield call(service, ...args, config);
    } catch (e: unknown) {
      if (!(yield cancelled())) {
        throw e;
      } else {
        console.info("Service was cancelled.");
      }
    } finally {
      if (yield cancelled()) {
        source.cancel();
      }
    }
  });
