import { z } from "zod";

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

export type ClientRequestOptions<
  S extends response.ApiResponseBody | null = response.ApiResponseBody,
  D extends ClientRequestData = ClientRequestData,
> = ClientStaticRequestOptions<D> & {
  readonly onProgress?: (current: number, total: number) => void;
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
