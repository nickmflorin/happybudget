import { errors } from "application";

import * as types from "../types";

export type RequestInitCallback = (opts: ClientStaticRequestOptions) => RequestInit;

/* Default options for the Request object that the HttpClient can be configured with. */
export type ClientConfigurationOptions = {
  readonly domain?: types.Domain;
  readonly requestInit?: RequestInitCallback | RequestInit;
  readonly pathPrefix?: `/${string}`;
};

export type ClientStaticRequestOptions = Omit<RequestInit, "body" | "method">;

export const DefaultDynamicOptions = {
  GET: { json: true as const, strict: false as const },
  POST: { json: true as const, strict: false as const },
  PATCH: { json: true as const, strict: false as const },
  DELETE: { json: false as const, strict: false as const },
};

export type DefaultDynamics = typeof DefaultDynamicOptions;

type JsonFlagOption<T extends types.HttpMethod> = DefaultDynamics[T]["json"] extends true
  ? { readonly json?: true }
  : { readonly json: true };

type NoJsonFlagOption<T extends types.HttpMethod> = DefaultDynamics[T]["json"] extends true
  ? { readonly json: false }
  : { readonly json?: false };

type StrictFlagOption<T extends types.HttpMethod> = DefaultDynamics[T]["strict"] extends true
  ? { readonly strict?: true }
  : { readonly strict: true };

type NoStrictFlagOption<T extends types.HttpMethod> = DefaultDynamics[T]["strict"] extends true
  ? { readonly strict: false }
  : { readonly strict?: false };

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
export type ClientDynamicRequestFlags<
  T extends types.HttpMethod,
  JS extends { readonly strict: boolean; readonly json: boolean } | undefined = undefined,
  DISTRIBUTE extends Record<string, unknown> | Record<string, never> = Record<string, never>,
> = JS extends { readonly strict: true; readonly json: true }
  ? JsonFlagOption<T> & StrictFlagOption<T> & DISTRIBUTE
  : JS extends { readonly strict: false; readonly json: true }
  ? NoStrictFlagOption<T> & JsonFlagOption<T> & DISTRIBUTE
  : JS extends { readonly strict: true; readonly json: false }
  ? StrictFlagOption<T> & NoJsonFlagOption<T> & DISTRIBUTE
  : JS extends { readonly strict: false; readonly json: false }
  ? NoStrictFlagOption<T> & NoJsonFlagOption<T> & DISTRIBUTE
  :
      | ClientDynamicRequestFlags<T, { readonly strict: true; readonly json: true }, DISTRIBUTE>
      | ClientDynamicRequestFlags<T, { readonly strict: true; readonly json: false }, DISTRIBUTE>
      | ClientDynamicRequestFlags<T, { readonly strict: false; readonly json: true }, DISTRIBUTE>
      | ClientDynamicRequestFlags<T, { readonly strict: false; readonly json: false }, DISTRIBUTE>;

export type ClientRequestOptions<
  T extends types.HttpMethod,
  JS extends { readonly strict: boolean; readonly json: boolean } | undefined = undefined,
> = ClientDynamicRequestFlags<T, JS, ClientStaticRequestOptions>;

export type ClientRequestMeta<Q extends types.RawQuery = types.RawQuery> = {
  readonly query: Q | undefined;
};

export type WithClientMeta<R, Q extends types.RawQuery = types.RawQuery> = R & {
  readonly requestMeta: ClientRequestMeta<Q>;
};

type ForceConsistentResponseBody<
  B extends types.ApiResponseBody = types.ApiResponseBody,
  S extends types.ApiSuccessResponse<B> = types.ApiSuccessResponse<B>,
  Q extends types.RawQuery = types.RawQuery,
> = [B, S, Q];

export type ClientSuccessResponse<
  D extends
    | ForceConsistentResponseBody
    | [Response, types.RawQuery]
    | [types.ApiResponseBody, types.RawQuery],
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
> = D extends ForceConsistentResponseBody<infer B, infer S, infer Q>
  ? WithClientMeta<{ response: S; error?: undefined }, Q>
  : D extends [infer R extends Response, infer Q extends types.RawQuery]
  ? WithClientMeta<{ response: R; error?: undefined }, Q>
  : D extends [infer B extends types.ApiResponseBody, infer Q extends types.RawQuery]
  ? WithClientMeta<{ response: types.ApiSuccessResponse<B>; error?: undefined }, Q>
  : never;

export type ClientResponse<
  D extends
    | ForceConsistentResponseBody
    | [Response, types.RawQuery]
    | [types.ApiResponseBody, types.RawQuery],
> = D extends ForceConsistentResponseBody<infer B, infer S, infer Q>
  ?
      | ClientSuccessResponse<[B, S, Q]>
      | WithClientMeta<{ response?: undefined; error: errors.HttpError }, Q>
  : D extends [infer R extends Response, infer Q extends types.RawQuery]
  ?
      | ClientSuccessResponse<[R, Q]>
      | WithClientMeta<{ response?: undefined; error: errors.HttpError }, Q>
  : D extends [infer B extends types.ApiResponseBody, infer Q extends types.RawQuery]
  ?
      | ClientSuccessResponse<[B, types.ApiSuccessResponse<B>, Q]>
      | WithClientMeta<{ response?: undefined; error: errors.HttpError }, Q>
  : never;

export type ClientStrictResponse<
  D extends
    | ForceConsistentResponseBody
    | [Response, types.RawQuery]
    | [types.ApiResponseBody, types.RawQuery],
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
> = D extends ForceConsistentResponseBody<infer B, infer S, infer Q>
  ? WithClientMeta<S, Q>
  : D extends [infer R extends Response, infer Q extends types.RawQuery]
  ? WithClientMeta<R, Q>
  : D extends [infer B extends types.ApiResponseBody, infer Q extends types.RawQuery]
  ? WithClientMeta<types.ApiSuccessResponse<B>, Q>
  : never;
