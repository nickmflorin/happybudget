import { z } from "zod";

import * as errors from "../../errors";

import * as payload from "./payload";
import * as query from "./query";
import * as response from "./response";
import * as urls from "./urls";

import { HttpMethod } from ".";

export type ClientContext = {
  readonly url: string;
  readonly method: HttpMethod;
  readonly status: number;
};

export type ClientParams = { readonly request: Request; readonly response: Response };

export type ClientRequestMeta<D extends ClientRequestData = ClientRequestData> = {
  readonly query: D["query"] | undefined;
};

export type WithClientMeta<R, D extends ClientRequestData = ClientRequestData> = R & {
  readonly requestMeta: ClientRequestMeta<D>;
};

export type ClientSuccessResponse<
  S extends response.ApiResponseBody | null,
  D extends ClientRequestData = ClientRequestData,
> = WithClientMeta<{ response: S; error?: undefined }, D>;

export type ClientFailedResponse<D extends ClientRequestData = ClientRequestData> = WithClientMeta<
  { response?: undefined; error: errors.HttpError },
  D
>;

export type ClientRequestData = {
  readonly body?: payload.Payload;
  readonly query?: query.RawQuery;
};

export type ClientXHRRequestOptions<R extends response.ApiResponseBody> = {
  readonly progress?: (computable: boolean, percent: number, total: number) => void;
  readonly error?: (e: errors.HttpError) => void;
  readonly success?: (r: R) => void;
  readonly send?: boolean;
};

/**
 * Request options for a {@link Request} being made by the {@link HttpClient} that can also be
 * provided to the {@link HttpClient} on initialization.  These request options can be provided
 * both statically to the {@link HttpClient} on initialization and also dynamically to the methods
 * of the {@link HttpClient} when a request is made.  Statically provided options will be merged
 * with dynamically provided options, with the dynamically provided options taking precedence.
 */
export type ClientStaticRequestOptions = {
  readonly headers?: Record<string, string> | (() => Record<string, string>);
  readonly credentials?: RequestCredentials;
};

/**
 * Request options for a {@link Request} being made by the {@link HttpClient} that are typically
 * exposed outside of a service definition.  These request options do not include the options
 * that are intended to be included as a part of the service definition itself.
 *
 * const myService = (id: number; options?: ExposedClientRequestOptions) => {
 *   return client.get(..., { ...options, schema: model.MySchema })
 * }
 *
 * In the above, the 'schema' option is an example of an option that is not included as a part of
 * the {@link ExposedClientRequestOptions} because under most circumstances, its definition is
 * included in the options by the service itself, but not the logic that is using the service.
 */
export type ExposedClientRequestOptions<D extends ClientRequestData = ClientRequestData> =
  ClientStaticRequestOptions & {
    readonly body?: D["body"];
    readonly query?: D["query"];
    readonly onProgress?: (current: number, total: number) => void;
  };

/**
 * The overall request options for a {@link Request} being made by the {@link HttpClient} that
 * consist of both statically provided request options, {@link ClientStaticRequestOptions}, and
 * dynamically provided request options.
 */
export type ClientRequestOptions<
  S extends response.ApiResponseBody | null = response.ApiResponseBody,
  D extends ClientRequestData = ClientRequestData,
> = ExposedClientRequestOptions<D> & {
  readonly schema?: z.ZodType<S>;
};

export type ClientStrictResponse<
  S extends response.ApiResponseBody | null = response.ApiResponseBody,
  D extends ClientRequestData = ClientRequestData,
> = WithClientMeta<{ response: S }, D>;

export type ClientResponse<
  S extends response.ApiResponseBody | null = response.ApiResponseBody,
  D extends ClientRequestData = ClientRequestData,
> = ClientSuccessResponse<S, D> | ClientFailedResponse<D>;

export type ClientVariableResponse<
  S extends response.ApiResponseBody | null = response.ApiResponseBody,
  D extends ClientRequestData = ClientRequestData,
  STRICT extends boolean = false,
> = STRICT extends true ? ClientStrictResponse<S, D> : ClientResponse<S, D>;

export type ServiceOptions<
  S extends response.ApiResponseBody | null = response.ApiResponseBody,
  D extends ClientRequestData = ClientRequestData,
> = {
  readonly query?: D["query"] | undefined;
  readonly schema?: z.ZodType<S>;
};

export type Service<
  S extends response.ApiResponseBody | null = response.ApiResponseBody,
  D extends ClientRequestData = ClientRequestData,
  SCH extends response.ApiResponseBody | null = S,
> = (options?: ClientRequestOptions<SCH, D>) => Promise<ClientResponse<S, D>>;

export type ParameterizedService<
  M extends HttpMethod,
  U extends urls.RequestPath<string, M> | Record<string, urls.UrlPathParam>,
  S extends response.ApiResponseBody | null = response.ApiResponseBody,
  D extends ClientRequestData = ClientRequestData,
  SCH extends response.ApiResponseBody | null = S,
> = (
  params: U extends urls.RequestPath<string, M>
    ? urls.UrlPathParamsObj<U>
    : Record<string, urls.UrlPathParam>,
  options?: ClientRequestOptions<SCH, D>,
) => Promise<ClientResponse<S, D>>;
