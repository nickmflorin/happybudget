import { errors } from "application";
import { logger } from "internal";
import { model } from "lib";

import * as schemas from "../schemas";
import * as types from "../types";
import { constructEndpoint, injectUrlPathParams } from "../util";

import {
  ClientRequestOptions,
  ClientResponse,
  DefaultDynamics,
  DefaultDynamicOptions,
  ClientStaticRequestOptions,
  ClientJsonResponseIndicators,
  StrictJsonFlagOption,
  ClientDynamicRequestFlags,
  NoStrictJsonFlagOption,
  DefaultDynamicFlags,
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

type ClientUriOptions = Pick<types.HttpUriOptions, "basePath" | "host" | "port" | "scheme">;

/* Default options for the Request object that the HttpClient can be configured with. */
export type ClientConfigurationOptions<O extends ClientUriOptions = ClientUriOptions> = O &
  ClientStaticRequestOptions;

/**
 * A strongly typed interface for interacting with the native {@link fetch} API for requests between
 * the client and the server such that HTTP errors are consistently and predictably handled,
 * returned and/or thrown and explicit control is provided regarding the manner in which the client
 * communicates responses and errors via the methods it exposes.
 *
 * @see ClientDynamicRequestFlags
 *
 * @param {ClientConfigurationOptions<O>} options
 *   A set of options, {@link ClientConfigurationOptions}, that configure the {@link HttpClient}.
 *
 *   @see {ClientConfigurationOptions}
 */
export class HttpClient<O extends ClientUriOptions = ClientUriOptions> {
  private readonly host?: string | undefined;
  private readonly basePath?: string | undefined;
  private readonly port?: number | undefined;
  private readonly scheme?: string | undefined;
  private readonly headers?: ClientStaticRequestOptions["headers"];

  constructor(config?: ClientConfigurationOptions<O>) {
    this.basePath = config?.basePath;
    this.host = config?.host;
    this.port = config?.port;
    this.scheme = config?.scheme;
    this.port = config?.port;
    this.headers = config?.headers;

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
    M extends types.HttpMethod,
    D extends ClientJsonResponseIndicators,
    JS extends ClientDynamicRequestFlags<M>,
    Q extends types.RawQuery = types.RawQuery,
    O extends ClientRequestOptions<M, JS, Q> = ClientRequestOptions<M, JS, Q>,
  >(
    path: types.RequestPath<string, M>,
    method: types.HttpMethod,
    options?: O,
  ): Promise<ClientResponse<M, JS, D, Q>> => {
    const { query, strict, json, headers } = options || {};

    let response: Response | null = null;
    let error: errors.HttpError | null = null;

    const url = constructEndpoint({
      host: this.host,
      path,
      query,
      scheme: this.scheme,
      basePath: this.basePath,
      port: this.port,
    });
    const request = new Request(url, {
      headers: typeof headers === "function" ? headers() : headers,
    });
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
          url,
          path,
          method,
          query,
          status: response ? response.status : null,
        },
        error.message,
      );
      return { error, requestMeta: { query } } as ClientResponse<M, JS, D, Q>;
    } else if (response) {
      const returnResponse: Response = response;
      if (HttpClient.getDynamicOption("json", method, { json })) {
        const jsonResponse = await response.json();
        /* If the calling logic provides the 'strict' flag, it is expecting that the return of the
           HttpClient method does not nest the response next to an 'error' field, since the error
           would have been thrown. */
        if (HttpClient.getDynamicOption("strict", method, { strict })) {
          return { ...jsonResponse, requestMeta: { query } } as ClientResponse<M, JS, D, Q>;
        }
        return {
          response: jsonResponse,
          requestMeta: { query },
          error: undefined,
        } as ClientResponse<M, JS, D, Q>;
      }
      /* If the calling logic provides the 'strict' flag, it is expecting that the return of the
         HttpClient method does not nest the response next to an 'error' field, since the error
         would have been thrown. */
      return HttpClient.getDynamicOption("strict", method, { strict })
        ? ({ ...returnResponse, requestMeta: { query } } as ClientResponse<M, JS, D, Q>)
        : ({ response: returnResponse, requestMeta: { query } } as ClientResponse<M, JS, D, Q>);
    } else {
      // See block comment above regarding null checks around response object.
      throw new Error("This should never happen!");
    }
  };

  /**
   * Sends a GET request to the provided path, {@link types.RequestPath<string, "GET">} with the
   * provided query, {@link Q}.
   *
   * @param {types.RequestPath<string, "GET">} path The path to send the GET request.
   *
   * @param {ClientRequestOptions<"GET", JS>} options
   * 	 The options for the request.  These options will override any options that were provided
   *   during the configuration of the {@link HttpClient} instance.  These options also include the
   *   dynamic request flags, {@link ClientDynamicRequestFlags}, that dictate the form of the
   *   response in the returned {@link Promise}.
   *
   *   @see {ClientRequestOptions}
   *
   * @returns {Promise<ClientResponse<"GET", D, JS>>}
   *   A {@link Promise} whose contents depend on the dynamic request options, {@link JS}, that are
   *   provided to the method.
   *
   *   @see ClientDynamicRequestFlags
   */
  public async get<
    D extends ClientJsonResponseIndicators,
    JS extends ClientDynamicRequestFlags<"GET"> = DefaultDynamicFlags<"GET">,
    Q extends types.RawQuery = types.RawQuery,
    O extends ClientRequestOptions<"GET", JS, Q> = ClientRequestOptions<"GET", JS, Q>,
  >(path: types.RequestPath<string, "GET">, options?: O): Promise<ClientResponse<"GET", JS, D, Q>> {
    return this.request<"GET", D, JS, Q, O>(path, types.HttpMethods.GET, options);
  }

  public createGetService<
    U extends types.RequestPath<string, "GET">,
    B extends types.ApiResponseBody,
    S extends types.ApiSuccessResponse<B> = types.ApiSuccessResponse<B>,
    Q extends types.RawQuery = types.RawQuery,
  >(urlPattern: U) {
    return <
      JS extends ClientDynamicRequestFlags<"GET"> = DefaultDynamicFlags<"GET">,
      O extends ClientRequestOptions<"GET", JS, Q> = ClientRequestOptions<"GET", JS, Q>,
    >(
      params: types.UrlPathParamsObj<U>,
      options?: O,
    ): Promise<ClientResponse<"GET", JS, [B, S], Q>> =>
      this.get<[B, S], JS, Q, O>(
        injectUrlPathParams(urlPattern, params) as types.RequestPath<string, "GET">,
        options,
      );
  }

  /**
   * Retrieves a model at the provided path, {@link types.RequestPath<string, "GET">}, using a
   * request with the optionally provided provided query, {@link Q},
   *
   * @param {types.RequestPath<string, "GET">} path The path to send the GET request.
   *
   * @param {ClientRequestOptions<"GET", JS, Q> = ClientRequestOptions<"GET", JS, Q>} options
   * 	 The options for the request.  These options will override any options that were provided
   *   during the configuration of the {@link HttpClient} instance.  These options also include the
   *   dynamic request flags, {@link ClientDynamicRequestFlags}, that dictate the form of the
   *   response in the returned {@link Promise}.
   *
   *   @see {ClientRequestOptions}
   *
   * @returns {Promise<ClientResponse<M>> | Promise<ClientStrictResponse<M>>}
   *   A {@link Promise} whose contents depend on the dynamic request options,
   *   {@link ClientDynamicRequestFlags} that were supplied to the method.
   *
   *   @see ClientDynamicRequestFlags
   */
  public async retrieve<
    M extends model.ApiModel,
    JS extends
      | StrictJsonFlagOption<"GET">
      | NoStrictJsonFlagOption<"GET"> = NoStrictJsonFlagOption<"GET">,
    Q extends types.RawQuery = types.RawQuery,
    O extends ClientRequestOptions<"GET", JS, Q> = ClientRequestOptions<"GET", JS, Q>,
  >(path: types.RequestPath<string, "GET">, options?: O): Promise<ClientResponse<"GET", JS, M, Q>> {
    const { error, response, requestMeta } = await this.get<M, NoStrictJsonFlagOption<"GET">, Q>(
      path,
      {
        ...options,
        json: true,
        strict: false,
      },
    );
    return {
      error,
      requestMeta,
      response: response !== undefined ? response.data : response,
    } as ClientResponse<"GET", JS, M, Q>;
  }

  public createRetrieveService<
    U extends types.RequestPath<string, "GET">,
    M extends model.ApiModel,
    Q extends types.RawQuery = types.RawQuery,
  >(urlPattern: U) {
    return <
      JS extends
        | StrictJsonFlagOption<"GET">
        | NoStrictJsonFlagOption<"GET"> = NoStrictJsonFlagOption<"GET">,
      O extends ClientRequestOptions<"GET", JS, Q> = ClientRequestOptions<"GET", JS, Q>,
    >(
      params: types.UrlPathParamsObj<U>,
      options?: O,
    ): Promise<ClientResponse<"GET", JS, M, Q>> =>
      this.retrieve<M, JS, Q, O>(
        injectUrlPathParams(urlPattern, params) as types.RequestPath<string, "GET">,
        options,
      );
  }

  /**
   * Retrieves a set of models at the provided path, {@link types.RequestPath<string, "GET">}, using
   * a request with the optionally provided provided query, {@link Q},
   *
   * @param {types.RequestPath<string, "GET">} path The path to send the GET request.
   *
   * @param {ClientRequestOptions<"GET", JS, Q> = ClientRequestOptions<"GET", JS, Q>} options
   * 	 The options for the request.  These options will override any options that were provided
   *   during the configuration of the {@link HttpClient} instance.  These options also include the
   *   dynamic request flags, {@link ClientDynamicRequestFlags}, that dictate the form of the
   *   response in the returned {@link Promise}.
   *
   *   @see {ClientRequestOptions}
   *
   * @returns {Promise<ClientResponse<M>> | Promise<ClientStrictResponse<M>>}
   *   A {@link Promise} whose contents depend on the dynamic request options,
   *   {@link ClientDynamicRequestFlags} that were supplied to the method.
   *
   *   @see ClientDynamicRequestFlags
   */
  public async list<
    M extends model.ApiModel,
    JS extends
      | StrictJsonFlagOption<"GET">
      | NoStrictJsonFlagOption<"GET"> = NoStrictJsonFlagOption<"GET">,
    Q extends types.ModelListQuery<M> = types.ModelListQuery<M>,
    O extends ClientRequestOptions<"GET", JS, Q> = ClientRequestOptions<"GET", JS, Q>,
  >(
    path: types.RequestPath<string, "GET">,
    options?: O,
  ): Promise<ClientResponse<"GET", JS, types.ModelListResponse<M>, Q>> {
    const { error, response, requestMeta } = await this.get<M, NoStrictJsonFlagOption<"GET">, Q>(
      path,
      {
        ...options,
        json: true,
        strict: false,
      },
    );
    return {
      error,
      requestMeta,
      response: response !== undefined ? response.data : response,
    } as ClientResponse<"GET", JS, types.ModelListResponse<M>, Q>;
  }

  public createListService<
    U extends types.RequestPath<string, "GET">,
    M extends model.ApiModel,
    Q extends types.RawQuery = types.RawQuery,
  >(urlPattern: U) {
    return <
      JS extends
        | StrictJsonFlagOption<"GET">
        | NoStrictJsonFlagOption<"GET"> = NoStrictJsonFlagOption<"GET">,
      O extends ClientRequestOptions<"GET", JS, Q> = ClientRequestOptions<"GET", JS, Q>,
    >(
      params: types.UrlPathParamsObj<U>,
      options?: O,
    ): Promise<ClientResponse<"GET", JS, types.ModelListResponse<M>, Q>> =>
      this.list<M, JS, Q, O>(
        injectUrlPathParams(urlPattern, params) as types.RequestPath<string, "GET">,
        options,
      );
  }

  /**
   * Sends a POST request to the provided path, {@link types.RequestPath<string, "GET">} with the
   * provided body, {@link P}.
   *
   * @param {types.RequestPath<string, "POST">} path The path to send the POST request.
   *
   * @param {ClientRequestOptions<"POST", JS>} options
   * 	 The options for the request.  These options will override any options that were provided
   *   during the configuration of the {@link HttpClient} instance.  These options also include the
   *   dynamic request flags, {@link ClientDynamicRequestFlags}, that dictate the form of the
   *   response in the returned {@link Promise}.
   *
   *   @see {ClientRequestOptions}
   *
   * @returns {Promise<ClientResponse<"POST", D, JS>>}
   *   A {@link Promise} whose contents depend on the dynamic request options, {@link JS}, that are
   *   provided to the method.
   *
   *   @see ClientDynamicRequestFlags
   */
  public async post<
    D extends ClientJsonResponseIndicators,
    P extends types.Payload = types.Payload,
    JS extends ClientDynamicRequestFlags<"POST"> = DefaultDynamicFlags<"POST">,
    Q extends types.RawQuery = types.RawQuery,
    O extends ClientRequestOptions<"POST", JS, Q> = ClientRequestOptions<"POST", JS, Q>,
  >(
    path: types.RequestPath<string, "POST">,
    body?: P,
    options?: O,
  ): Promise<ClientResponse<"POST", JS, D, Q>> {
    return this.request<"POST", D, JS, Q, O>(path, types.HttpMethods.POST, {
      ...options,
      body: body === undefined ? undefined : JSON.stringify(body),
    } as typeof options);
  }

  public createPostService<
    U extends types.RequestPath<string, "POST">,
    B extends types.ApiResponseBody,
    P extends types.Payload = types.Payload,
    S extends types.ApiSuccessResponse<B> = types.ApiSuccessResponse<B>,
    Q extends types.RawQuery = types.RawQuery,
  >(urlPattern: U) {
    return <
      JS extends ClientDynamicRequestFlags<"POST"> = DefaultDynamicFlags<"POST">,
      O extends ClientRequestOptions<"POST", JS, Q> = ClientRequestOptions<"POST", JS, Q>,
    >(
      params: types.UrlPathParamsObj<U>,
      body?: P,
      options?: O,
    ): Promise<ClientResponse<"POST", JS, [B, S], Q>> =>
      this.post<[B, S], P, JS, Q, O>(
        injectUrlPathParams(urlPattern, params) as types.RequestPath<string, "POST">,
        body,
        options,
      );
  }

  /**
   * Sends a DELETE request to the provided path, {@link types.RequestPath<string, "DELETE">}.
   *
   * @param {types.RequestPath<string, "DELETE">} path The path to send the DELETE request.
   *
   * @param {ClientRequestOptions<"DELETE", JS>} options
   * 	 The options for the request.  These options will override any options that were provided
   *   during the configuration of the {@link HttpClient} instance.  These options also include the
   *   dynamic request flags, {@link ClientDynamicRequestFlags}, that dictate the form of the
   *   response in the returned {@link Promise}.
   *
   *   @see {ClientRequestOptions}
   *
   * @returns {Promise<ClientResponse<"DELETE", D, JS>>}
   *   A {@link Promise} whose contents depend on the dynamic request options, {@link JS}, that are
   *   provided to the method.
   *
   *   @see ClientDynamicRequestFlags
   */
  public async delete<
    D extends ClientJsonResponseIndicators,
    JS extends ClientDynamicRequestFlags<"DELETE"> = DefaultDynamicFlags<"DELETE">,
    Q extends types.RawQuery = types.RawQuery,
    O extends ClientRequestOptions<"DELETE", JS, Q> = ClientRequestOptions<"DELETE", JS, Q>,
  >(
    path: types.RequestPath<string, "DELETE">,
    options?: O,
  ): Promise<ClientResponse<"DELETE", JS, D, Q>> {
    return this.request<"DELETE", D, JS, Q, O>(path, types.HttpMethods.DELETE, options);
  }

  public createDeleteService<
    U extends types.RequestPath<string, "DELETE">,
    B extends types.ApiResponseBody,
    S extends types.ApiSuccessResponse<B> = types.ApiSuccessResponse<B>,
    Q extends types.RawQuery = types.RawQuery,
  >(urlPattern: U) {
    return <
      JS extends ClientDynamicRequestFlags<"DELETE"> = DefaultDynamicFlags<"DELETE">,
      O extends ClientRequestOptions<"DELETE", JS, Q> = ClientRequestOptions<"DELETE", JS, Q>,
    >(
      params: types.UrlPathParamsObj<U>,
      options?: O,
    ): Promise<ClientResponse<"DELETE", JS, [B, S], Q>> =>
      this.delete<[B, S], JS, Q, O>(
        injectUrlPathParams(urlPattern, params) as types.RequestPath<string, "DELETE">,
        options,
      );
  }

  /**
   * Sends a PATCH request to the provided path, {@link types.RequestPath<string, "PATCH">} with the
   * provided body, {@link P}.
   *
   * @param {types.RequestPath<string, "PATCH">} path The path to send the PATCH request.
   *
   * @param {ClientRequestOptions<"PATCH", JS>} options
   * 	 The options for the request.  These options will override any options that were provided
   *   during the configuration of the {@link HttpClient} instance.  These options also include the
   *   dynamic request flags, {@link ClientDynamicRequestFlags}, that dictate the form of the
   *   response in the returned {@link Promise}.
   *
   *   @see {ClientRequestOptions}
   *
   * @returns {Promise<ClientResponse<"PATCH", D, JS>>}
   *   A {@link Promise} whose contents depend on the dynamic request options, {@link JS}, that are
   *   provided to the method.
   *
   *   @see ClientDynamicRequestFlags
   */
  public async patch<
    D extends ClientJsonResponseIndicators,
    P extends types.Payload = types.Payload,
    JS extends ClientDynamicRequestFlags<"PATCH"> = DefaultDynamicFlags<"PATCH">,
    Q extends types.RawQuery = types.RawQuery,
    O extends ClientRequestOptions<"PATCH", JS, Q> = ClientRequestOptions<"PATCH", JS, Q>,
  >(
    path: types.RequestPath<string, "PATCH">,
    body?: P,
    options?: O,
  ): Promise<ClientResponse<"PATCH", JS, D, Q>> {
    return this.request<"PATCH", D, JS, Q, O>(path, types.HttpMethods.POST, {
      ...options,
      body: body === undefined ? undefined : JSON.stringify(body),
    } as typeof options);
  }

  public createPatchService<
    U extends types.RequestPath<string, "PATCH">,
    B extends types.ApiResponseBody,
    P extends types.Payload = types.Payload,
    S extends types.ApiSuccessResponse<B> = types.ApiSuccessResponse<B>,
    Q extends types.RawQuery = types.RawQuery,
  >(urlPattern: U) {
    return <
      JS extends ClientDynamicRequestFlags<"PATCH"> = DefaultDynamicFlags<"PATCH">,
      O extends ClientRequestOptions<"PATCH", JS, Q> = ClientRequestOptions<"PATCH", JS, Q>,
    >(
      params: types.UrlPathParamsObj<U>,
      body?: P,
      options?: O,
    ): Promise<ClientResponse<"PATCH", JS, [B, S], Q>> =>
      this.patch<[B, S], P, JS, Q, O>(
        injectUrlPathParams(urlPattern, params) as types.RequestPath<string, "PATCH">,
        body,
        options,
      );
  }
}
