import { errors } from "application";

import * as types from "../types";

export type ClientStaticRequestOptions<Q extends types.RawQuery = types.RawQuery> = {
  readonly headers?: Record<string, string> | (() => Record<string, string>);
  readonly body?: string;
  readonly query?: Q;
};

export const DefaultDynamicOptions = {
  GET: { json: true as const, strict: false as const },
  POST: { json: true as const, strict: false as const },
  PATCH: { json: true as const, strict: false as const },
  DELETE: { json: false as const, strict: false as const },
};

export type DefaultDynamics = typeof DefaultDynamicOptions;
export type Dynamics = { readonly strict: boolean; readonly json: boolean };
export type DefaultDynamicFlags<M extends types.HttpMethod> = Partial<DefaultDynamics[M]>;

type JsonFlagOption<T extends types.HttpMethod> = DefaultDynamics[T]["json"] extends true
  ? { readonly json?: true }
  : { readonly json: true };

type NativeFlagOption<T extends types.HttpMethod> = DefaultDynamics[T]["json"] extends true
  ? { readonly json: false }
  : { readonly json?: false };

type StrictFlagOption<T extends types.HttpMethod> = DefaultDynamics[T]["strict"] extends true
  ? { readonly strict?: true }
  : { readonly strict: true };

type NoStrictFlagOption<T extends types.HttpMethod> = DefaultDynamics[T]["strict"] extends true
  ? { readonly strict: false }
  : { readonly strict?: false };

export type StrictJsonFlagOption<T extends types.HttpMethod> = StrictFlagOption<T> &
  JsonFlagOption<T>;

export type StrictNativeFlagOption<T extends types.HttpMethod> = StrictFlagOption<T> &
  NativeFlagOption<T>;

export type NoStrictJsonFlagOption<T extends types.HttpMethod> = NoStrictFlagOption<T> &
  JsonFlagOption<T>;

export type NoStrictNativeFlagOption<T extends types.HttpMethod> = NoStrictFlagOption<T> &
  NativeFlagOption<T>;

/**
 * Options that are dynamically provided when a requesting method on the {@link HttpClient}  is
 * called, not including options that are native to the fetch's {@link Request} object.  These
 * options are used for context in the {@link HttpClient}  such that it can control the behavior of
 * the method return.
 *
 * The properties of this type affect how the requesting methods on the {@link HttpClient} will
 * return, and those configurations and the corresponding return form are detailed as follows:
 *
 * @property {boolean} strict
 *   Controls whether or not the requesting method on the {@link HttpClient} should throw errors
 *   that occur during the request, or include them as a part of the requesting method's return.
 *
 * @property {boolean} json
 *   Controls whether or not the requesting method on the {@link HttpClient} should return responses
 *   from successful HTTP requests as a JSON response body or the raw {@link Response} object.
 */
export type ClientDynamicRequestFlags<M extends types.HttpMethod> =
  | NoStrictNativeFlagOption<M>
  | NoStrictJsonFlagOption<M>
  | StrictNativeFlagOption<M>
  | StrictJsonFlagOption<M>;

export type ClientRequestMeta<Q extends types.RawQuery = types.RawQuery> = {
  readonly query: Q | undefined;
};

export type WithClientMeta<R, Q extends types.RawQuery = types.RawQuery> = R & {
  readonly requestMeta: ClientRequestMeta<Q>;
};

export type SelfConsistentResponseBody<
  B extends types.ApiResponseBody = types.ApiResponseBody,
  S extends types.ApiSuccessResponse<B> = types.ApiSuccessResponse<B>,
> = [B, S];

export type ClientJsonResponseIndicators<
  B extends types.ApiResponseBody = types.ApiResponseBody,
  S extends types.ApiSuccessResponse<B> = types.ApiSuccessResponse<B>,
> = SelfConsistentResponseBody<B, S> | B;

export type ClientNativeResponseIndicators = [Response];

type ClientJsonSuccessResponse<
  D extends ClientJsonResponseIndicators,
  Q extends types.RawQuery = types.RawQuery,
> =
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  D extends SelfConsistentResponseBody<infer B, infer S>
    ? WithClientMeta<{ response: S; error?: undefined }, Q>
    : D extends types.ApiResponseBody
    ? WithClientMeta<{ response: types.ApiSuccessResponse<D>; error?: undefined }, Q>
    : never;

export type ClientFailedResponse<Q extends types.RawQuery = types.RawQuery> = WithClientMeta<
  { response?: undefined; error: errors.HttpError },
  Q
>;

type ClientStrictJsonResponse<
  D extends ClientJsonResponseIndicators,
  Q extends types.RawQuery = types.RawQuery,
> = D extends [
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  infer B extends types.ApiResponseBody,
  infer S extends types.ApiSuccessResponse,
]
  ? WithClientMeta<S, Q>
  : D extends [infer B extends types.ApiResponseBody]
  ? WithClientMeta<types.ApiSuccessResponse<B>, Q>
  : never;

export const isClientNonStrictJsonResponse = <
  D extends ClientJsonResponseIndicators,
  Q extends types.RawQuery = types.RawQuery,
>(
  response:
    | ClientStrictJsonResponse<D, Q>
    | ClientFailedResponse<Q>
    | ClientJsonSuccessResponse<D, Q>,
): response is ClientFailedResponse<Q> | ClientJsonSuccessResponse<D, Q> =>
  (response as ClientFailedResponse<Q> | ClientJsonSuccessResponse<D, Q>).response !== undefined ||
  (response as ClientFailedResponse<Q> | ClientJsonSuccessResponse<D, Q>).error !== undefined;

export type ClientResponse<
  M extends types.HttpMethod,
  JS extends ClientDynamicRequestFlags<M>,
  D extends ClientJsonResponseIndicators = types.ApiResponseBody,
  Q extends types.RawQuery = types.RawQuery,
> = JS extends StrictNativeFlagOption<M>
  ? WithClientMeta<Response, Q>
  : JS extends StrictJsonFlagOption<M>
  ? ClientStrictJsonResponse<D, Q>
  : JS extends NoStrictNativeFlagOption<M>
  ? ClientFailedResponse<Q> | WithClientMeta<{ response: Response; error?: undefined }, Q>
  : JS extends NoStrictJsonFlagOption<M>
  ? ClientFailedResponse<Q> | ClientJsonSuccessResponse<D, Q>
  : never;

export type ClientRequestOptions<
  M extends types.HttpMethod,
  JS extends ClientDynamicRequestFlags<M>,
  Q extends types.RawQuery = types.RawQuery,
> = JS & ClientStaticRequestOptions<Q>;
