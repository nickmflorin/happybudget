import { Required } from "utility-types";

import { errors } from "application";
import { logger } from "internal";
import { model } from "lib";

import * as schemas from "../schemas";
import * as types from "../types";
import { addQueryParamsToUrl } from "../util";

import {
  ClientRequestOptions,
  ClientOptions,
  ClientDynamicRequestOptions,
  ClientResponse,
  ClientResponseOrError,
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

const DefaultDynamicOptions: {
  [key in types.HttpMethod]: Required<ClientDynamicRequestOptions>;
} = {
  GET: { json: true, strict: false },
  POST: { json: true, strict: false },
  PATCH: { json: true, strict: false },
  DELETE: { json: false, strict: false },
};

/**
 * A strongly typed interface for interacting with the native {@link fetch} API for requests between
 * the client and the server such that HTTP errors are consistently and predictably handled,
 * returned and/or thrown and explicit control is provided regarding the manner in which the client
 * communicates responses and errors via the methods it exposes.
 *
 * @see ClientDynamicRequestOptions
 *
 * @param {ClientOptions} options
 *   A set of options, {@link ClientOptions} provided as either a set of explicit options,
 *   {@link ClientRequestOptions}, or a callback that should take the parameters used to initialize
 *   the {@link Request} when the applicable method on the instance is called and return the
 *   options, {@link ClientRequestOptions}.
 *
 *   These options will be used as default parameters to the {@link Request} unless they are
 *   dynamically overridden when calling the appropriate method on the {@link HttpClient} instance
 *   that is making the request.
 */
export class HttpClient<PATH extends string> {
  private readonly options?: ClientOptions;

  constructor(config?: ClientOptions) {
    this.options = config || {};
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

  private static getDynamicOption = (
    optionName: keyof ClientDynamicRequestOptions,
    method: types.HttpMethod,
    options: ClientRequestOptions = {},
  ): boolean => {
    const v = options[optionName];
    return v === undefined ? DefaultDynamicOptions[method][optionName] : v;
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
    S extends types.ApiSuccessResponse<B> = types.ApiSuccessResponse<B>,
    Q extends types.ProcessedQuery = types.ProcessedQuery,
  >(
    path: types.ApiPath<PATH>,
    method: types.HttpMethod,
    {
      query,
      ...options
    }: ClientRequestOptions & { readonly body?: string; readonly query?: Q } = {},
  ): Promise<ClientResponse<S | Response, Q>> => {
    let response: Response | null = null;
    let error: errors.HttpError | null = null;
    const request = new Request(
      query !== undefined ? addQueryParamsToUrl(path, query) : path,
      typeof this.options === "function" && options !== undefined
        ? this.options(options)
        : { ...this.options, ...options },
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
      if (HttpClient.getDynamicOption("strict", method, options)) {
        throw error;
      }
      logger.error(
        { url: error.url, path, method: error.method, status: response ? response.status : null },
        error.message,
      );
      return { error };
    } else if (response) {
      let returnResponse: S | Response = response;
      if (HttpClient.getDynamicOption("json", method, options)) {
        returnResponse = await response.json();
      }
      /* If the method was called with the 'strict' flag, the calling logic is already expecting
         that (and the return of the method on the HttpClient that was called is typed such that)
         the return is simply just the response (in its raw form or its JSON body) - because any
         error would have been thrown.  Returning the error does not make sense if the error would
         be thrown, because there will never be an error to return. */
      return HttpClient.getDynamicOption("strict", method, options)
        ? returnResponse
        : { response: returnResponse };
    } else {
      // See block comment above regarding null checks around response object.
      throw new Error("This should never happen!");
    }
  };

  public async get<
    B extends types.ApiResponseBody,
    S extends types.ApiSuccessResponse<B> = types.ApiSuccessResponse<B>,
    Q extends types.ProcessedQuery = types.ProcessedQuery,
  >(
    path: types.ApiPath<PATH, "GET">,
    query: Q | undefined,
    options: Required<ClientRequestOptions<true, true>, "strict">,
  ): Promise<S>;

  public async get<
    B extends types.ApiResponseBody,
    S extends types.ApiSuccessResponse<B> = types.ApiSuccessResponse<B>,
    Q extends types.ProcessedQuery = types.ProcessedQuery,
  >(
    path: types.ApiPath<PATH, "GET">,
    query?: Q,
    options?: ClientRequestOptions<false, true>,
  ): Promise<ClientResponseOrError<S, Q>>;

  public async get<Q extends types.ProcessedQuery = types.ProcessedQuery>(
    path: types.ApiPath<PATH, "GET">,
    query: Q | undefined,
    options: Required<ClientRequestOptions<true, false>, keyof ClientDynamicRequestOptions>,
  ): Promise<Response>;

  public async get<Q extends types.ProcessedQuery = types.ProcessedQuery>(
    path: types.ApiPath<PATH, "GET">,
    query: Q | undefined,
    options: Required<ClientRequestOptions<false, false>, "json">,
  ): Promise<ClientResponseOrError<Response>>;

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
   *   @see {HttpClient}
   *
   * @returns {Promise<ClientResponse<S | Response>>}
   *   A {@link Promise} whose contents depend on the dynamic request options,
   *   {@link ClientDynamicRequestOptions}, that were supplied to the method.
   *
   *   @see ClientDynamicRequestOptions
   */
  public async get<
    B extends types.ApiResponseBody,
    S extends types.ApiSuccessResponse<B> = types.ApiSuccessResponse<B>,
    Q extends types.ProcessedQuery = types.ProcessedQuery,
  >(
    path: types.ApiPath<PATH, "GET">,
    query?: Q,
    options?: ClientRequestOptions,
  ): Promise<ClientResponse<S | Response>> {
    path = types.addQueryParamsToUrl(path, query);
    return this.request<B, S>(path, types.HttpMethods.GET, options);
  }

  public async retrieve<
    M extends model.ApiModel,
    Q extends types.ProcessedQuery = types.ProcessedQuery,
  >(
    path: types.ApiPath<PATH, "GET">,
    query: Q | undefined,
    options: Omit<Required<ClientRequestOptions<true, true>, "strict">, "json">,
  ): Promise<M>;

  public async retrieve<
    M extends model.ApiModel,
    Q extends types.ProcessedQuery = types.ProcessedQuery,
  >(
    path: types.ApiPath<PATH, "GET">,
    query?: Q,
    options?: Omit<ClientRequestOptions<false, true>, "json">,
  ): Promise<ClientResponseOrError<M>>;

  /**
   * Retrieves a model at the provided path, {@link types.ApiPath<PATH, "GET">}, using a request
   * with the optionally provided provided query, {@link Q},
   *
   * @param {types.ApiPath<PATH, "GET">} path The path to send the GET request.
   *
   * @param {Q} query The query parameters that should be embedded in the URL.
   *
   * @param {Omit<ClientRequestOptions, "json">} options
   * 	 The options for the request.  These options will override any options that were provided
   *   during the configuration of the {@link HttpClient} instance.
   *
   *   @see {HttpClient}
   *
   * @returns {Promise<ClientResponse<M>>}
   *   A {@link Promise} that consists of either the model, {@link M} - in the case that the
   *   "strict" option is true - or an object that indexes a potential error or the model,
   *   {@link ClientResponseOrError<M>} - in the case that the "strict" option is false.
   *
   *   @see ClientDynamicRequestOptions
   */
  public async retrieve<
    M extends model.ApiModel,
    Q extends types.ProcessedQuery = types.ProcessedQuery,
  >(
    path: types.ApiPath<PATH, "GET">,
    query?: Q,
    options?: Omit<ClientRequestOptions, "json">,
  ): Promise<ClientResponse<M>> {
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

  public async list<
    M extends model.ApiModel,
    Q extends types.ProcessedQuery = types.ProcessedQuery,
  >(
    path: types.ApiPath<PATH, "GET">,
    query: Q | undefined,
    options: Omit<Required<ClientRequestOptions<true, true>, "strict">, "json">,
  ): Promise<types.ModelListResponse<M>>;

  public async list<
    M extends model.ApiModel,
    Q extends types.ProcessedQuery = types.ProcessedQuery,
  >(
    path: types.ApiPath<PATH, "GET">,
    query?: Q,
    options?: Omit<ClientRequestOptions<false, true>, "json">,
  ): Promise<ClientResponseOrError<types.ModelListResponse<M>>>;

  /**
   * Retrieves a set of models at the provided path, {@link types.ApiPath<PATH, "GET">}, using a
   * request with the optionally provided provided query, {@link Q},
   *
   * @param {types.ApiPath<PATH, "GET">} path The path to send the GET request.
   *
   * @param {Q} query The query parameters that should be embedded in the URL.
   *
   * @param {Omit<ClientRequestOptions, "json">} options
   * 	 The options for the request.  These options will override any options that were provided
   *   during the configuration of the {@link HttpClient} instance.
   *
   *   @see {HttpClient}
   *
   * @returns {Promise<ClientResponse<M>>}
   *   A {@link Promise} that consists of either the models and metadata,
   *   {@link types.ModelListResponse<M>} - in the case that the "strict" option is true - or an
   *   object that indexes a potential error or the models/metadata,
   *   {@link ClientResponseOrError<ModelListResponse<M>>} - in the case that the "strict" option is
   *   false.
   *
   *   @see ClientDynamicRequestOptions
   */
  public async list<
    M extends model.ApiModel,
    Q extends types.ProcessedQuery = types.ProcessedQuery,
  >(
    path: types.ApiPath<PATH, "GET">,
    query?: Q,
    options?: Omit<ClientRequestOptions, "json">,
  ): Promise<ClientResponse<types.ModelListResponse<M>>> {
    return this.get<M[], types.ModelListResponse<M>, Q>(path, query, {
      strict: false,
      ...options,
      json: true,
      /* We have to coerce the options here to satisfy TS, but this will not prevent the 'strict'
         option from changing the return of the method. */
    } as ClientRequestOptions<false, true>);
  }

  public async post<
    B extends types.ApiResponseBody,
    S extends types.ApiSuccessResponse<B> = types.ApiSuccessResponse<B>,
    P extends types.Payload = types.Payload,
  >(
    path: types.ApiPath<PATH, "POST">,
    body: P | undefined,
    options: Required<ClientRequestOptions<true, true>, "strict">,
  ): Promise<S>;

  public async post<
    B extends types.ApiResponseBody,
    S extends types.ApiSuccessResponse<B> = types.ApiSuccessResponse<B>,
    P extends types.Payload = types.Payload,
  >(
    path: types.ApiPath<PATH, "POST">,
    body?: P,
    options?: ClientRequestOptions<false, true>,
  ): Promise<ClientResponseOrError<S>>;

  public async post<P extends types.Payload = types.Payload>(
    path: types.ApiPath<PATH, "POST">,
    body: P | undefined,
    options: Required<ClientRequestOptions<true, false>, keyof ClientDynamicRequestOptions>,
  ): Promise<Response>;

  public async post<P extends types.Payload = types.Payload>(
    path: types.ApiPath<PATH, "POST">,
    body: P | undefined,
    options: Required<ClientRequestOptions<false, false>, "json">,
  ): Promise<ClientResponseOrError<Response>>;

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
   *   @see {HttpClient}
   *
   * @returns {Promise<ClientResponse<S | Response>>}
   *   A {@link Promise} whose contents depend on the dynamic request options,
   *   {@link ClientDynamicRequestOptions}, that were supplied to the method.
   *
   *   @see ClientDynamicRequestOptions
   */
  public async post<
    B extends types.ApiResponseBody,
    S extends types.ApiSuccessResponse<B>,
    P extends types.Payload = types.Payload,
  >(
    path: types.ApiPath<PATH, "POST">,
    body?: P,
    options?: ClientRequestOptions,
  ): Promise<ClientResponse<S | Response>> {
    return this.request<B, S>(path, types.HttpMethods.POST, {
      ...options,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  }

  public async delete<
    B extends types.ApiResponseBody,
    S extends types.ApiSuccessResponse<B> = types.ApiSuccessResponse<B>,
  >(
    path: types.ApiPath<PATH, "DELETE">,
    // For a DELETE request, the default value of the `json` option is false.
    options: Required<ClientRequestOptions<true, true>, keyof ClientDynamicRequestOptions>,
  ): Promise<S>;

  public async delete<
    B extends types.ApiResponseBody,
    S extends types.ApiSuccessResponse<B> = types.ApiSuccessResponse<B>,
  >(
    path: types.ApiPath<PATH, "DELETE">,
    // For a DELETE request, the default value of the `json` option is false.
    options: Required<ClientRequestOptions<false, true>, "json">,
  ): Promise<ClientResponseOrError<S>>;

  public async delete(
    path: types.ApiPath<PATH, "DELETE">,
    options: Required<ClientRequestOptions<true, false>, "strict">,
  ): Promise<Response>;

  public async delete(
    path: types.ApiPath<PATH, "DELETE">,
    options?: ClientRequestOptions<false, false>,
  ): Promise<ClientResponseOrError<Response>>;

  /**
   * Sends a DELETE request to the provided path, {@link types.ApiPath<PATH, "DELETE">}.
   *
   * @param {types.ApiPath<PATH, "DELETE">} path The path to send the DELETE request.
   *
   * @param {ClientRequestOptions} options
   * 	 The options for the request.  These options will override any options that were provided
   *   during the configuration of the {@link HttpClient} instance.
   *
   *   Unlike the other HTTP methods attached to the {@link HttpClient}, for a DELETE request the
   *   default value of the `json` option is false.
   *
   *   @see {HttpClient}
   *
   * @returns {Promise<S | Response>}
   *   A {@link Promise} whose contents depend on the dynamic request options,
   *   {@link ClientDynamicRequestOptions}, that were supplied to the method.
   *
   *   @see ClientDynamicRequestOptions
   */
  public async delete<
    B extends types.ApiResponseBody,
    S extends types.ApiSuccessResponse<B> = types.ApiSuccessResponse<B>,
  >(
    path: types.ApiPath<PATH, "DELETE">,
    options?: ClientRequestOptions,
  ): Promise<ClientResponse<S | Response>> {
    return this.request<B, S>(path, types.HttpMethods.DELETE, options);
  }

  public async patch<
    B extends types.ApiResponseBody,
    S extends types.ApiSuccessResponse<B> = types.ApiSuccessResponse<B>,
    P extends types.Payload = types.Payload,
  >(
    path: types.ApiPath<PATH, "PATCH">,
    body: P | undefined,
    options: Required<ClientRequestOptions<true, true>, "strict">,
  ): Promise<S>;

  public async patch<
    B extends types.ApiResponseBody,
    S extends types.ApiSuccessResponse<B> = types.ApiSuccessResponse<B>,
    P extends types.Payload = types.Payload,
  >(
    path: types.ApiPath<PATH, "PATCH">,
    body?: P,
    options?: ClientRequestOptions<false, true>,
  ): Promise<ClientResponseOrError<S>>;

  public async patch<P extends types.Payload = types.Payload>(
    path: types.ApiPath<PATH, "PATCH">,
    body: P | undefined,
    options: Required<ClientRequestOptions<true, false>, keyof ClientDynamicRequestOptions>,
  ): Promise<Response>;

  public async patch<P extends types.Payload = types.Payload>(
    path: types.ApiPath<PATH, "PATCH">,
    body: P | undefined,
    options: Required<ClientRequestOptions<false, false>, "json">,
  ): Promise<ClientResponseOrError<Response>>;

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
   * @returns {Promise<S | Response>}
   *   A {@link Promise} whose contents depend on the dynamic request options,
   *   {@link ClientDynamicRequestOptions}, that were supplied to the method.
   *
   *   @see ClientDynamicRequestOptions
   */
  public async patch<
    B extends types.ApiResponseBody,
    S extends types.ApiSuccessResponse<B> = types.ApiSuccessResponse<B>,
    P extends types.Payload = types.Payload,
  >(
    path: types.ApiPath<PATH, "PATCH">,
    body?: P,
    options?: ClientRequestOptions,
  ): Promise<ClientResponse<S | Response>> {
    return this.request<B, S>(path, types.HttpMethods.PATCH, {
      ...options,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  }
}
