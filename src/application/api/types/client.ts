import { errors } from "application";

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

export type ClientStaticRequestOptions<D extends ClientRequestData = ClientRequestData> = {
  readonly headers?: Record<string, string> | (() => Record<string, string>);
  readonly body?: D["body"];
  readonly query?: D["query"];
  readonly credentials?: RequestCredentials;
};

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
export type ClientRequestOptions<D extends ClientRequestData = ClientRequestData> =
  ClientStaticRequestOptions<D> & {
    readonly onProgress?: (current: number, total: number) => void;
  };

export type ClientStrictResponse<
  S extends response.ApiResponseBody | null,
  D extends ClientRequestData = ClientRequestData,
> = WithClientMeta<S, D>;

export type ClientResponse<
  S extends response.ApiResponseBody | null,
  D extends ClientRequestData = ClientRequestData,
> = ClientSuccessResponse<S, D> | ClientFailedResponse<D>;

export type ClientVariableResponse<
  S extends response.ApiResponseBody | null,
  D extends ClientRequestData = ClientRequestData,
  STRICT extends boolean = false,
> = STRICT extends true ? ClientStrictResponse<S, D> : ClientResponse<S, D>;

export type ServiceOptions<D extends ClientRequestData = ClientRequestData> = {
  readonly query?: D["query"] | undefined;
};

export type Service<
  S extends response.ApiResponseBody | null,
  D extends ClientRequestData = ClientRequestData,
> = (options?: ClientRequestOptions<D>) => Promise<ClientResponse<S, D>>;

export type ParameterizedService<
  M extends HttpMethod,
  U extends urls.RequestPath<string, M> | Record<string, urls.UrlPathParam>,
  S extends response.ApiResponseBody | null,
  D extends ClientRequestData = ClientRequestData,
> = (
  params: U extends urls.RequestPath<string, M>
    ? urls.UrlPathParamsObj<U>
    : Record<string, urls.UrlPathParam>,
  options?: ClientRequestOptions<D>,
) => Promise<ClientResponse<S, D>>;
