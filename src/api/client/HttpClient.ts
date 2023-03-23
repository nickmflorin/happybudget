import { errors } from "application";
import { logger } from "internal";
import { model } from "lib";

import * as schemas from "../schemas";
import * as types from "../types";
import { addQueryParamsToUrl } from "../util";

import {
  ClientRequestOptions,
  ClientResponse,
  ClientStrictResponse,
  ClientConfigurationOptions,
  DefaultDynamics,
  ClientSuccessResponse,
  DefaultDynamicOptions,
} from "./types";

enum UnknownErrorReasons {
  NOT_SERIALIZABLE = "NOT_SERIALIZABLE",
  MALFORMED = "MALFORMED",
}
type UnknownErrorReason = keyof typeof UnknownErrorReasons;

const UNKNOWN_ERROR_MESSAGES: {
  [key in UnknownErrorReason]: string;
} = {
  [UnknownErrorReasons.NOT_SERIALIZABLE]:
    "Unexpectedly received a response with a body that is not JSON serializable.",
  [UnknownErrorReasons.MALFORMED]:
    "Unexpectedly received a response with a body that is not of the expected form.",
};

/**
 * A strongly typed interface for interacting with the native {@link fetch} API for requests between
 * the client and the server such that HTTP errors are consistently and predictably handled,
 * returned and/or thrown and explicit control is provided regarding the manner in which the client
 * communicates responses and errors via the methods it exposes.
 *
 * @see ClientDynamicRequestFlags
 *
 * @param {ClientConfigurationOptions} options
 *   A set of options, {@link ClientConfigurationOptions}, that configure the {@link HttpClient}.
 *
 *   @see {ClientConfigurationOptions}
 *
 *   These options will be used as default parameters to the {@link Request} unless they are
 *   dynamically overridden when calling the appropriate method on the {@link HttpClient} instance
 *   that is making the request.
 */
export class HttpClient<PATH extends string> {
  private readonly requestInit?: ClientConfigurationOptions["requestInit"];
  private readonly domain?: ClientConfigurationOptions["domain"];
  private readonly pathPrefix?: ClientConfigurationOptions["pathPrefix"];

  constructor(config?: ClientConfigurationOptions) {
    this.pathPrefix = config?.pathPrefix;
    this.domain = config?.domain;
    this.requestInit = config?.requestInit;

    this.get = this.get.bind(this);
    this.post = this.post.bind(this);
    this.patch = this.patch.bind(this);
    this.delete = this.delete.bind(this);
    this.list = this.list.bind(this);
    this.retrieve = this.retrieve.bind(this);
  }

  /**
   * Responsible for instantiating the error, {@link errors.ApiGlobalError} that will be returned
   * or thrown in the case that the request fails and the response body was either (a) not JSON
   * serializable or (b) malformed.
   */
  private createUnknownError = (params: {
    response: Response;
    request: Request;
    reason: UnknownErrorReason;
    message?: string | null;
  }): errors.ApiGlobalError => {
    const context = {
      url: params.response.url,
      status: params.response.status,
      method: params.request.method.toUpperCase() as types.HttpMethod,
    };
    /* If the JSON body of the response could not be used to determine the proper error that should
       be used, we can make assumptions based on certain status codes. */
    const code: errors.ApiGlobalErrorCode | null = errors.getDefaultGlobalErrorCode(
      params.response.status,
    );
    if (code === null) {
      /* Only log information about the invalid or malformed structure of the response JSON body if
         the status code does not indicate an error where the response will likely not have a valid,
         serializable JSON body. */
      const message =
        params.message === undefined || params.message === null
          ? UNKNOWN_ERROR_MESSAGES[params.reason]
          : params.message;
      logger.error({ ...context, code: errors.ApiGlobalErrorCodes.UNKNOWN }, message);
      return new errors.ApiGlobalError({
        ...context,
        code: errors.ApiGlobalErrorCodes.UNKNOWN,
        message,
      });
    }
    return new errors.ApiGlobalError({
      ...context,
      code,
    });
  };

  private static getDynamicOption = <T extends types.HttpMethod>(
    optionName: keyof DefaultDynamics[T],
    method: T,
    options: { [key in keyof DefaultDynamics[T]]?: boolean } = {},
  ): boolean => {
    const v: boolean | undefined = options[optionName];
    const defaults = DefaultDynamicOptions[method] as {
      [key in keyof DefaultDynamics[T]]: boolean;
    };
    return v === undefined ? defaults[optionName] : v;
  };

  /**
   * Responsible for instantiating and returning the appropriate {@link Error} in the case that
   * the HTTP request failed but the server did render a response, {@link Response}.  The method
   * will attempt to parse the JSON body of the response, {@link Response}, and use that information
   * to properly construct an error, {@link ApiError}.  If it cannot, it will treat the error as
   * unknown.
   *
   * @returns {errors.ApiFieldError | errors.ApiGlobalError}
   */
  private handleResponseError = async (params: {
    request: Request;
    response: Response;
  }): Promise<errors.ApiError> => {
    let body: types.ApiErrorResponse | undefined;
    try {
      body = await params.response.json();
    } catch (e) {
      if (e instanceof SyntaxError) {
        return this.createUnknownError({
          ...params,
          reason: UnknownErrorReasons.NOT_SERIALIZABLE,
        });
      }
      throw e;
    }
    /* Before assuming that the JSON body of the response in the event that the request fails has
       the correct information in it to appropriately handle the error, we need to validate that
       the response body is of an expected form used for communicating errors.

       If the response body is of an expected form, an array will be returned - where the first
       element is the type of error(s) that it contains (i.e. "field" or "global") and the second
       element is the typed response body.

       If the response body is not of an expected form, either a string error message will be
       returned - in the case that the reasons for which the body is malformed can be determined -
       or simply null if those reasons cannot be determined.
       */
    const parsedResponse = schemas.getApiErrorResponse(body);

    const context = {
      url: params.request.url,
      status: params.response.status,
      method: params.request.method.toUpperCase() as types.HttpMethod,
    };
    if (typeof parsedResponse !== "string" && parsedResponse !== null) {
      switch (parsedResponse[0]) {
        case errors.ApiErrorTypes.FIELD:
          return new errors.ApiFieldError({
            ...context,
            errors: parsedResponse[1].errors,
          });
        case errors.ApiErrorTypes.GLOBAL:
          return new errors.ApiGlobalError({
            ...context,
            // Due to the schema validation, it is guaranteed that there is only 1 error.
            ...parsedResponse[1].errors[0],
          });
        default:
          throw new Error("This should not happen!");
      }
    }
    /* At this point, the JSON body of the response did not satisfy the schemas for either of the
       expected forms for embedding errors in the response.  The failed request must be treated as
       having failed for an unknown reason, and the response will be logged as having been
       malformed. */
    return this.createUnknownError({
      ...params,
      message: parsedResponse,
      reason: UnknownErrorReasons.MALFORMED,
    });
  };

  private request = async <
    B extends types.ApiResponseBody,
    R extends types.ApiSuccessResponse<B> = types.ApiSuccessResponse<B>,
    Q extends types.RawQuery | Record<string, never> = types.RawQuery,
    M extends types.HttpMethod = types.HttpMethod,
  >(
    path: types.ApiPath<PATH>,
    method: types.HttpMethod,
    options?: ClientRequestOptions<M> & { readonly body?: string; readonly query?: Q },
  ): Promise<
    | ClientResponse<[Response, Q]>
    | ClientResponse<[B, R, Q]>
    | ClientStrictResponse<[B, R, Q]>
    | ClientStrictResponse<[Response, Q]>
  > => {
    const { query, strict, json, ...rest } = options || {};

    let response: Response | null = null;
    let error: errors.HttpError | null = null;

    const request = new Request(
      query !== undefined ? addQueryParamsToUrl(path, query) : path,
      typeof this.requestInit === "function" && options !== undefined
        ? this.requestInit(rest)
        : { ...this.requestInit, ...rest },
    );
    try {
      response = await fetch(request);
    } catch (e) {
      /* Here, the fetch call failed without rendering a response - this happens when a connection
         could not be made to the server. */
      error = new errors.NetworkError({
        url: request.url,
        method: request.method.toUpperCase() as types.HttpMethod,
      });
    }
    /* The type check response !== null is only necessary because the response has to be initialized
       as null outside of the scope of the try, catch block at the beginning of the method.  The
       fetch method returns Promise<Response>, so the response will always be non-null at this
       point. */
    if (response !== null && !response.ok) {
      // Here, the server returned a response - but the response had a 4xx or 5xx status code.
      error = await this.handleResponseError({ request, response });
    }
    if (error) {
      /* If the method was called with the 'strict' flag, the calling logic expects that the return
         will be the response, and if it is not the response an error should have been thrown. */
      if (HttpClient.getDynamicOption("strict", method, { strict })) {
        throw error;
      }
      logger.error(
        {
          url: error.url,
          path,
          method: error.method,
          query,
          status: response ? response.status : null,
        },
        error.message,
      );
      return { error, requestMeta: { query } };
    } else if (response) {
      const returnResponse: Response = response;
      if (HttpClient.getDynamicOption("json", method, { json })) {
        const jsonResponse: R = await response.json();
        /* If the calling logic provides the 'strict' flag, it is expecting that the return of the
           HttpClient method does not nest the response next to an 'error' field, since the error
           would have been thrown. */
        if (HttpClient.getDynamicOption("strict", method, { strict })) {
          return { ...jsonResponse, requestMeta: { query } } as ClientStrictResponse<[B, R, Q]>;
        }
        return {
          response: jsonResponse,
          requestMeta: { query },
          error: undefined,
        } as ClientSuccessResponse<[B, R, Q]>;
      }
      /* If the calling logic provides the 'strict' flag, it is expecting that the return of the
         HttpClient method does not nest the response next to an 'error' field, since the error
         would have been thrown. */
      return HttpClient.getDynamicOption("strict", method, { strict })
        ? { ...returnResponse, requestMeta: { query } }
        : { response: returnResponse, requestMeta: { query } };
    } else {
      // See block comment above regarding null checks around response object.
      throw new Error("This should never happen!");
    }
  };

  public async get<
    B extends types.ApiResponseBody,
    S extends types.ApiSuccessResponse<B> = types.ApiSuccessResponse<B>,
    Q extends types.RawQuery = types.RawQuery,
  >(
    path: types.ApiPath<PATH, "GET">,
    query: Q | undefined,
    options: ClientRequestOptions<"GET", { json: true; strict: true }>,
  ): Promise<ClientStrictResponse<[B, S, Q]>>;

  public async get<
    B extends types.ApiResponseBody,
    S extends types.ApiSuccessResponse<B> = types.ApiSuccessResponse<B>,
    Q extends types.RawQuery = types.RawQuery,
  >(
    path: types.ApiPath<PATH, "GET">,
    query?: Q,
    options?: ClientRequestOptions<"GET", { json: true; strict: false }>,
  ): Promise<ClientResponse<[B, S, Q]>>;

  public async get<Q extends types.RawQuery = types.RawQuery>(
    path: types.ApiPath<PATH, "GET">,
    query: Q | undefined,
    options: ClientRequestOptions<"GET", { json: false; strict: true }>,
  ): Promise<ClientStrictResponse<[Response, Q]>>;

  public async get<Q extends types.RawQuery = types.RawQuery>(
    path: types.ApiPath<PATH, "GET">,
    query: Q | undefined,
    options: ClientRequestOptions<"GET", { json: false; strict: false }>,
  ): Promise<ClientResponse<[Response, Q]>>;

  /**
   * Sends a GET request to the provided path, {@link types.ApiPath<PATH, "GET">} with the provided
   * query, {@link Q}.
   *
   * @param {types.ApiPath<PATH, "GET">} path The path to send the GET request.
   *
   * @param {Q} query The query parameters that should be embedded in the URL.
   *
   * @param {ClientRequestOptions} options
   * 	 The options for the request.  These options will override any options that were provided
   *   during the configuration of the {@link HttpClient} instance.
   *
   *   @see {ClientRequestOptions}
   *
   * @returns {Promise<ClientResponse> | Promise<ClientStrictResponse>}
   *   A {@link Promise} whose contents depend on the dynamic request options,
   *   {@link ClientDynamicRequestFlags}, that were supplied to the method.
   *
   *   @see ClientDynamicRequestFlags
   */
  public async get<
    B extends types.ApiResponseBody,
    S extends types.ApiSuccessResponse<B> = types.ApiSuccessResponse<B>,
    Q extends types.RawQuery = types.RawQuery,
  >(
    path: types.ApiPath<PATH, "GET">,
    query?: Q,
    options?:
      | ClientRequestOptions<"GET", { json: true; strict: true }>
      | ClientRequestOptions<"GET", { json: true; strict: false }>
      | ClientRequestOptions<"GET", { json: false; strict: true }>
      | ClientRequestOptions<"GET", { json: false; strict: false }>,
  ) {
    return this.request<B, S, Q, "GET">(path, types.HttpMethods.GET, {
      ...options,
      query,
    });
  }

  public async retrieve<M extends model.ApiModel, Q extends types.RawQuery = types.RawQuery>(
    path: types.ApiPath<PATH, "GET">,
    query: Q | undefined,
    options: ClientRequestOptions<"GET", { json: true; strict: false }>,
  ): Promise<ClientResponse<[M, Q]>>;

  public async retrieve<M extends model.ApiModel, Q extends types.RawQuery = types.RawQuery>(
    path: types.ApiPath<PATH, "GET">,
    query?: Q,
    options?: ClientRequestOptions<"GET", { json: true; strict: true }>,
  ): Promise<ClientStrictResponse<[M, Q]>>;

  /**
   * Retrieves a model at the provided path, {@link types.ApiPath<PATH, "GET">}, using a request
   * with the optionally provided provided query, {@link Q},
   *
   * @param {types.ApiPath<PATH, "GET">} path The path to send the GET request.
   *
   * @param {Q} query The query parameters that should be embedded in the URL.
   *
   * @param {ClientRequestOptions} options
   * 	 The options for the request.  These options will override any options that were provided
   *   during the configuration of the {@link HttpClient} instance.
   *
   *   @see {HttpClient}
   *
   * @returns {Promise<ClientResponse<M>> | Promise<ClientStrictResponse<M>>}
   *   A {@link Promise} whose contents depend on the dynamic request options,
   *   {@link ClientDynamicRequestFlags} that were supplied to the method.
   *
   *   @see ClientDynamicRequestOptions
   */
  public async retrieve<M extends model.ApiModel, Q extends types.RawQuery = types.RawQuery>(
    path: types.ApiPath<PATH, "GET">,
    query?: Q,
    options?:
      | ClientRequestOptions<"GET", { json: true; strict: true }>
      | ClientRequestOptions<"GET", { json: true; strict: false }>,
  ) {
    return this.get<M, types.ModelRetrieveResponse<M>, Q>(path, query, {
      ...options,
      strict: false,
      json: true,
    }).then(({ error, response }) => {
      if (options?.strict === true) {
        if (error) {
          throw error;
        }
        return response.data;
      } else if (error) {
        return { error };
      } else {
        return { response: response.data };
      }
    });
  }

  public async list<M extends model.ApiModel, Q extends types.RawQuery = types.RawQuery>(
    path: types.ApiPath<PATH, "GET">,
    query?: Q,
    options?: ClientRequestOptions<"GET", { json: true; strict: false }>,
  ): Promise<ClientResponse<[M[], types.ModelListResponse<M>, Q]>>;

  public async list<M extends model.ApiModel, Q extends types.RawQuery = types.RawQuery>(
    path: types.ApiPath<PATH, "GET">,
    query?: Q,
    options?: ClientRequestOptions<"GET", { json: true; strict: true }>,
  ): Promise<ClientStrictResponse<[M[], types.ModelListResponse<M>, Q]>>;

  /**
   * Retrieves a set of models at the provided path, {@link types.ApiPath<PATH, "GET">}, using a
   * request with the optionally provided provided query, {@link Q},
   *
   * @param {types.ApiPath<PATH, "GET">} path The path to send the GET request.
   *
   * @param {Q} query The query parameters that should be embedded in the URL.
   *
   * @param {ClientRequestOptions} options
   * 	 The options for the request.  These options will override any options that were provided
   *   during the configuration of the {@link HttpClient} instance.
   *
   *   @see {HttpClient}
   *
   * @returns {Promise<ClientResponse<M>> | Promise<ClientStrictResponse<M>>}
   *   A {@link Promise} whose contents depend on the dynamic request options,
   *   {@link ClientDynamicRequestFlags} that were supplied to the method.
   *
   *   @see ClientDynamicRequestOptions
   */
  public async list<M extends model.ApiModel, Q extends types.RawQuery = types.RawQuery>(
    path: types.ApiPath<PATH, "GET">,
    query?: Q,
    options?:
      | ClientRequestOptions<"GET", { json: true; strict: true }>
      | ClientRequestOptions<"GET", { json: true; strict: false }>,
  ): Promise<
    | ClientStrictResponse<[M[], types.ModelListResponse<M>, Q]>
    | ClientResponse<[M[], types.ModelListResponse<M>, Q]>
  > {
    return this.get<M[], types.ModelListResponse<M>, Q>(path, query, {
      ...options,
      json: true,
      /* We have to coerce the options here to satisfy TS, but this will not prevent the 'strict'
         option from changing the return of the method. */
    } as ClientRequestOptions<"GET", { json: true; strict: false }>);
  }

  public async post<
    B extends types.ApiResponseBody,
    S extends types.ApiSuccessResponse<B> = types.ApiSuccessResponse<B>,
    P extends types.Payload = types.Payload,
  >(
    path: types.ApiPath<PATH, "POST">,
    body?: P | undefined,
    options?: ClientRequestOptions<"POST", { json: true; strict: true }>,
  ): Promise<ClientStrictResponse<[B, S, Record<string, never>]>>;

  public async post<
    B extends types.ApiResponseBody,
    S extends types.ApiSuccessResponse<B> = types.ApiSuccessResponse<B>,
    P extends types.Payload = types.Payload,
  >(
    path: types.ApiPath<PATH, "POST">,
    body?: P,
    options?: ClientRequestOptions<"POST", { json: true; strict: false }>,
  ): Promise<ClientResponse<[B, S, Record<string, never>]>>;

  public async post<P extends types.Payload = types.Payload>(
    path: types.ApiPath<PATH, "POST">,
    body?: P | undefined,
    options?: ClientRequestOptions<"POST", { json: false; strict: true }>,
  ): Promise<ClientStrictResponse<[Response, Record<string, never>]>>;

  public async post<P extends types.Payload = types.Payload>(
    path: types.ApiPath<PATH, "POST">,
    body?: P | undefined,
    options?: ClientRequestOptions<"POST", { json: false; strict: false }>,
  ): Promise<ClientResponse<[Response, Record<string, never>]>>;

  /**
   * Sends a POST request to the provided path, {@link types.ApiPath<PATH, "POST">}, with the
   * provided body, {@link P}.
   *
   * @param {types.ApiPath<PATH, "POST">} path The path to send the POST request.
   *
   * @param {P} body The JSON body that should be attached to the request.
   *
   * @param {ClientRequestOptions} options
   * 	 The options for the request.  These options will override any options that were provided
   *   during the configuration of the {@link HttpClient} instance.
   *
   *   @see {ClientRequestOptions}
   *
   * @returns {Promise<ClientResponse> | Promise<ClientStrictResponse>}
   *   A {@link Promise} whose contents depend on the dynamic request options,
   *   {@link ClientDynamicRequestFlags}, that were supplied to the method.
   *
   *   @see ClientDynamicRequestFlags
   */
  public async post<
    B extends types.ApiResponseBody,
    S extends types.ApiSuccessResponse<B>,
    P extends types.Payload = types.Payload,
  >(
    path: types.ApiPath<PATH, "POST">,
    body?: P,
    options?:
      | ClientRequestOptions<"POST", { json: true; strict: true }>
      | ClientRequestOptions<"POST", { json: true; strict: false }>
      | ClientRequestOptions<"POST", { json: false; strict: true }>
      | ClientRequestOptions<"POST", { json: false; strict: false }>,
  ) {
    return this.request<B, S, Record<string, never>, "POST">(path, types.HttpMethods.POST, {
      ...options,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  }

  public async delete<
    B extends types.ApiResponseBody,
    S extends types.ApiSuccessResponse<B> = types.ApiSuccessResponse<B>,
  >(
    path: types.ApiPath<PATH, "DELETE">,
    options?: ClientRequestOptions<"DELETE", { json: true; strict: true }>,
  ): Promise<ClientStrictResponse<[B, S, Record<string, never>]>>;

  public async delete<
    B extends types.ApiResponseBody,
    S extends types.ApiSuccessResponse<B> = types.ApiSuccessResponse<B>,
  >(
    path: types.ApiPath<PATH, "DELETE">,
    options?: ClientRequestOptions<"DELETE", { json: true; strict: false }>,
  ): Promise<ClientResponse<[B, S, Record<string, never>]>>;

  public async delete(
    path: types.ApiPath<PATH, "DELETE">,
    options?: ClientRequestOptions<"DELETE", { json: false; strict: true }>,
  ): Promise<ClientStrictResponse<[Response, Record<string, never>]>>;

  public async delete(
    path: types.ApiPath<PATH, "DELETE">,
    options?: ClientRequestOptions<"DELETE", { json: false; strict: false }>,
  ): Promise<ClientResponse<[Response, Record<string, never>]>>;

  /**
   * Sends a DELETE request to the provided path, {@link types.ApiPath<PATH, "DELETE">}.
   *
   * @param {types.ApiPath<PATH, "DELETE">} path The path to send the DELETE request.
   *
   * @param {ClientRequestOptions} options
   * 	 The options for the request.  These options will override any options that were provided
   *   during the configuration of the {@link HttpClient} instance.
   *
   *   @see {ClientRequestOptions}
   *
   * @returns {Promise<ClientResponse> | Promise<ClientStrictResponse>}
   *   A {@link Promise} whose contents depend on the dynamic request options,
   *   {@link ClientDynamicRequestFlags}, that were supplied to the method.
   *
   *   @see ClientDynamicRequestFlags
   */
  public async delete<
    B extends types.ApiResponseBody,
    S extends types.ApiSuccessResponse<B> = types.ApiSuccessResponse<B>,
  >(
    path: types.ApiPath<PATH, "DELETE">,
    options?:
      | ClientRequestOptions<"DELETE", { json: true; strict: true }>
      | ClientRequestOptions<"DELETE", { json: true; strict: false }>
      | ClientRequestOptions<"DELETE", { json: false; strict: true }>
      | ClientRequestOptions<"DELETE", { json: false; strict: false }>,
  ) {
    return this.request<B, S, Record<string, never>, "DELETE">(
      path,
      types.HttpMethods.DELETE,
      options,
    );
  }

  public async patch<
    B extends types.ApiResponseBody,
    S extends types.ApiSuccessResponse<B> = types.ApiSuccessResponse<B>,
    P extends types.Payload = types.Payload,
  >(
    path: types.ApiPath<PATH, "PATCH">,
    body?: P | undefined,
    options?: ClientRequestOptions<"PATCH", { json: true; strict: true }>,
  ): Promise<ClientStrictResponse<[B, S, Record<string, never>]>>;

  public async patch<
    B extends types.ApiResponseBody,
    S extends types.ApiSuccessResponse<B> = types.ApiSuccessResponse<B>,
    P extends types.Payload = types.Payload,
  >(
    path: types.ApiPath<PATH, "PATCH">,
    body?: P,
    options?: ClientRequestOptions<"PATCH", { json: true; strict: false }>,
  ): Promise<ClientResponse<[B, S, Record<string, never>]>>;

  public async patch<P extends types.Payload = types.Payload>(
    path: types.ApiPath<PATH, "PATCH">,
    body?: P | undefined,
    options?: ClientRequestOptions<"PATCH", { json: false; strict: true }>,
  ): Promise<ClientStrictResponse<[Response, Record<string, never>]>>;

  public async patch<P extends types.Payload = types.Payload>(
    path: types.ApiPath<PATH, "PATCH">,
    body?: P | undefined,
    options?: ClientRequestOptions<"PATCH", { json: false; strict: false }>,
  ): Promise<ClientResponse<[Response, Record<string, never>]>>;

  /**
   * Sends a PATCH request to the provided path, {@link types.ApiPath<PATH, "PATCH">} with the
   * provided body, {@link P}.
   *
   * @param {types.ApiPath<PATH, "PATCH">} path The path to send the PATCH request.
   *
   * @param {P} body The JSON body that should be attached to the request.
   *
   * @param {ClientRequestOptions} options
   * 	 The options for the request.  These options will override any options that were provided
   *   during the configuration of the {@link HttpClient} instance.
   *
   *   @see {ClientRequestOptions}
   *
   * @returns {Promise<ClientResponse> | Promise<ClientStrictResponse>}
   *   A {@link Promise} whose contents depend on the dynamic request options,
   *   {@link ClientDynamicRequestFlags}, that were supplied to the method.
   *
   *   @see ClientDynamicRequestFlags
   */
  public async patch<
    B extends types.ApiResponseBody,
    S extends types.ApiSuccessResponse<B>,
    P extends types.Payload = types.Payload,
  >(
    path: types.ApiPath<PATH, "PATCH">,
    body?: P,
    options?:
      | ClientRequestOptions<"PATCH", { json: true; strict: true }>
      | ClientRequestOptions<"PATCH", { json: true; strict: false }>
      | ClientRequestOptions<"PATCH", { json: false; strict: true }>
      | ClientRequestOptions<"PATCH", { json: false; strict: false }>,
  ) {
    return this.request<B, S, Record<string, never>, "PATCH">(path, types.HttpMethods.PATCH, {
      ...options,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  }
}
