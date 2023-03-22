import { errors } from "application";

import * as types from "../types";

/* Default options for the Request object that the HttpClient can be configured with. */
export type ClientOptions =
  | RequestInit
  | ((opts: Omit<ClientRequestOptions, keyof ClientDynamicRequestOptions>) => RequestInit);

/**
 * Options that are dynamically provided when a requesting method on the {@link HttpClient}  is
 * called, not including options that are native to the fetch's {@link Request} object.  These
 * options are used for context in the {@link HttpClient}  such that it can control the behavior of
 * the method return.
 *
 * The properties of this type affect how the requesting methods on the {@link HttpClient} will
 * return, and those configurations and the corresponding return form are detailed as follows:
 *
 * (json = true, strict = true) => S extends types.ApiSuccessResponse<B>
 * (json = true, strict = false) =>
 *   { error: types.HttpError } | { response: S extends types.ApiSuccessResponse<B> }
 * (json = false, strict = true) => Response
 * (json = false, strict = false) => { error: types.HttpError } | { response: Response }
 */
export type ClientDynamicRequestOptions<
  S extends boolean = boolean,
  J extends boolean = boolean,
> = {
  /**
   * Controls whether or not the requesting method on the {@link HttpClient} should throw errors
   * that occur during the request, or include them as a part of the requesting method's return.
   */
  readonly strict?: S;
  /**
   * Controls whether or not the requesting method on the {@link HttpClient} should return responses
   * from successful HTTP requests as a JSON response body or the raw {@link Response} object.
   */
  readonly json?: J;
};

/* Options for each request that are provided when the requesting method is called. */
export type ClientRequestOptions<
  S extends boolean = boolean,
  J extends boolean = boolean,
> = ClientDynamicRequestOptions<S, J> & Omit<RequestInit, "body" | "method">;

type ClientRequestMeta<Q extends types.ProcessedQuery = types.ProcessedQuery> = {
  readonly query?: Q | undefined;
};

type WithClientMeta<R, Q extends types.ProcessedQuery = types.ProcessedQuery> = R & {
  readonly requestMeta: ClientRequestMeta<Q>;
};

export type ClientResponseOrError<
  R extends types.ApiResponseBody | Response = Response,
  Q extends types.ProcessedQuery = types.ProcessedQuery,
> =
  | WithClientMeta<{ readonly error: errors.HttpError; readonly response?: undefined }, Q>
  | WithClientMeta<{ readonly response: R; readonly error?: undefined }, Q>;

export type ClientSuccessResponse<
  R extends types.ApiResponseBody | Response = Response,
  Q extends types.ProcessedQuery = types.ProcessedQuery,
> = WithClientMeta<R, Q>;

export type ClientResponse<
  R extends types.ApiResponseBody | Response = Response,
  Q extends types.ProcessedQuery = types.ProcessedQuery,
> = ClientSuccessResponse<R, Q> | ClientResponseOrError<R, Q>;
