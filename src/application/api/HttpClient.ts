import { errors } from "application";
import { logger } from "internal";
import { assertNull, assertNotNullOrUndefined, parsers } from "lib";

import * as schemas from "./schemas";
import * as types from "./types";
import { constructEndpoint, injectUrlPathParams } from "./util";

enum UnknownErrorCases {
  NOT_SERIALIZABLE = "NOT_SERIALIZABLE",
  MALFORMED = "MALFORMED",
  NOT_PRESENT = "NOT_PRESENT",
}
type UnknownErrorCase = keyof typeof UnknownErrorCases;

const UNKNOWN_ERROR_MESSAGES: {
  [key in UnknownErrorCase]: string;
} = {
  [UnknownErrorCases.NOT_SERIALIZABLE]:
    "Unexpectedly received a response with a body that is not JSON serializable.",
  [UnknownErrorCases.NOT_PRESENT]: "Unexpectedly received a response without a response body.",
  [UnknownErrorCases.MALFORMED]:
    "Unexpectedly received a response with a body that is not of the expected form.",
};

type ClientUriOptions = Pick<types.HttpUriOptions, "basePath" | "host" | "port" | "scheme">;

/* Default options for the Request object that the HttpClient can be configured with. */
export type ClientConfigurationOptions<O extends ClientUriOptions = ClientUriOptions> = O &
  types.ClientStaticRequestOptions & {
    /**
     * Whether or not the {@link HttpClient} should attempt to deserialize the {@link Response}
     * body in the case that the request fails but a response was received.  If the callback
     * indicates that the {@link Response} body should not be deserialized as JSON, the status code
     * will be used to infer the type of {@link errors.HttpError} that should be thrown or returned.
     *
     * The default case is to attempt to deserialize all response objects, {@link Response}, when a
     * request fails.
     */
    readonly deserializeResponseBodyOnError?: (response: Response) => boolean;
  };

type BodyOrError<S extends types.ApiResponseBody | null> = Promise<
  { error: errors.ApiError; body: null } | { body: S; error: null }
>;

const mergeWithServiceOptions = <
  S extends types.ApiResponseBody | null,
  D extends types.ClientRequestData = types.ClientRequestData,
>(
  serviceOptions?: types.ServiceOptions<S, D>,
  options?: types.ClientRequestOptions<S, D>,
): types.ClientRequestOptions<S, D> => {
  type Q = D extends { readonly query: infer Qi extends types.RawQuery } ? Qi : types.RawQuery;

  const serviceQuery = (serviceOptions?.query as Q) || ({} as Q);
  const dynamicQuery = (options?.query as Q) || ({} as Q);

  return {
    ...serviceOptions,
    ...options,
    query: Object.keys(dynamicQuery || {}).reduce((prev: Q, key: string) => {
      if (key in serviceQuery) {
        if (serviceQuery[key] !== dynamicQuery[key]) {
          logger.warn(
            { param: key },
            `The query parameter '${key}' was provided statically to the service and the provided ` +
              "value is not equal to the static value.  The static value will not be overwritten.",
          );
        } else {
          logger.warn(
            { param: key },
            `The query parameter '${key}' was provided statically to the service already. Providing ` +
              "dynamically does not have an effect.",
          );
        }
        return prev;
      } else {
        return { ...prev, [key]: dynamicQuery[key] } as Q;
      }
    }, serviceQuery),
  };
};

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
  private readonly credentials?: RequestInit["credentials"];
  private readonly headers?: types.ClientStaticRequestOptions["headers"];
  private readonly deserializeResponseBodyOnError?: (response: Response) => boolean;

  constructor(config?: ClientConfigurationOptions<O>) {
    this.basePath = config?.basePath;
    this.host = config?.host;
    this.port = config?.port;
    this.scheme = config?.scheme;
    this.port = config?.port;
    this.credentials = config?.credentials;
    this.headers = config?.headers;
    this.deserializeResponseBodyOnError = config?.deserializeResponseBodyOnError;

    this.get = this.get.bind(this);
    this.post = this.post.bind(this);
    this.patch = this.patch.bind(this);
    this.delete = this.delete.bind(this);
    this.list = this.list.bind(this);
    this.retrieve = this.retrieve.bind(this);
  }

  private context = (params: types.ClientParams): types.ClientContext => ({
    url: params.response.url,
    status: params.response.status,
    method: params.request.method.toUpperCase() as types.HttpMethod,
  });

  private createInferredError = (
    params: types.ClientParams & {
      unknownMessage?: string;
    },
  ): errors.ApiGlobalError => {
    /* If the JSON body of the response could not be used to determine the proper error that should
       be used, we can make assumptions based on certain status codes. */
    const code: errors.ApiGlobalErrorCode | null = errors.getDefaultGlobalErrorCode(
      params.response.status,
    );
    if (code === null) {
      const err = new errors.ApiGlobalError({
        ...this.context(params),
        code: errors.ApiGlobalErrorCodes.UNKNOWN,
        message: params.unknownMessage,
      });
      /* Only log information about the invalid or malformed structure of the response JSON body if
         the status code does not indicate an error where the response will likely not have a valid,
         serializable JSON body. */
      logger.error(
        { ...this.context(params), code: errors.ApiGlobalErrorCodes.UNKNOWN },
        err.message,
      );
      return err;
    }
    return new errors.ApiGlobalError({ ...this.context(params), code });
  };

  /**
   * Responsible for instantiating the error, {@link errors.ApiGlobalError} that will be returned
   * or thrown in the case that the request fails and the response body was either (a) not JSON
   * serializable or (b) malformed.
   */
  private createUnknownError = (
    params: types.ClientParams & {
      case: UnknownErrorCase;
      message?: string | null;
    },
  ): errors.ApiGlobalError => {
    logger.info(
      { case: params.case, ...this.context(params) },
      `Determining how to treat request error due to case: ${params.case}.`,
    );
    const unknownMessage =
      params.message === undefined || params.message === null
        ? UNKNOWN_ERROR_MESSAGES[params.case]
        : params.message;
    return this.createInferredError({ ...params, unknownMessage });
  };

  private parseResponseBodyError = (body: unknown, params: types.ClientParams) => {
    const parsedResponse = schemas.getApiErrorResponse(body);

    if (typeof parsedResponse !== "string" && parsedResponse !== null) {
      switch (parsedResponse[0]) {
        case errors.ApiErrorTypes.FIELD:
          return new errors.ApiFieldError({
            ...this.context(params),
            errors: parsedResponse[1].errors,
          });
        case errors.ApiErrorTypes.GLOBAL:
          return new errors.ApiGlobalError({
            ...this.context(params),
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
    return parsedResponse;
  };

  /**
   * Responsible for instantiating and returning the appropriate {@link errors.HttpError} in the
   * case that the HTTP request failed but the server did render a response, {@link Response}.  The
   * method will attempt to parse the JSON body of the response, {@link Response}, and use that
   * information to properly construct an error, {@link ApiError}.  If it cannot, it will treat the
   * error as unknown.
   *
   * @returns {errors.ApiError}
   */
  private handleResponseError = async (params: types.ClientParams): Promise<errors.ApiError> => {
    /* If the HttpClient is configured such that the specific response should not be deserialized
       when the request fails, simply infer the error from the response instead. */
    if (this.deserializeResponseBodyOnError?.(params.response) === false) {
      return this.createInferredError({ ...params });
    }
    let body: types.ApiErrorResponse | null;
    try {
      body = await params.response.json();
    } catch (e) {
      if (e instanceof SyntaxError) {
        return this.createUnknownError({
          ...params,
          case: UnknownErrorCases.NOT_SERIALIZABLE,
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
    assertNotNullOrUndefined(body);
    const parsedError = this.parseResponseBodyError(body, params);
    /* If the parsed error is a string or null, the error response body could not be parsed
       properly.  In the case that there is enough information to infer a relevant error message
       detailing why the structure was malformed, the parsed error will be a string - otherwise, it
       will be null. */
    if (typeof parsedError === "string" || parsedError === null) {
      return this.createUnknownError({
        ...params,
        message: parsedError,
        case: UnknownErrorCases.MALFORMED,
      });
    }
    return parsedError;
  };

  private filterPayload = <T extends types.PayloadData>(body: T): T => {
    const newPayload: T = {} as T;
    Object.keys(body).forEach((key: string) => {
      if (body[key as keyof T] !== undefined) {
        newPayload[key as keyof T] = body[key as keyof T];
      }
    });
    return newPayload;
  };

  private constructUrl = <
    M extends types.HttpMethod,
    S extends types.ApiResponseBody | null,
    D extends types.ClientRequestData = types.ClientRequestData,
  >(
    path: types.RequestPath<string, M>,
    options?: types.ClientRequestOptions<S, D>,
  ): string =>
    constructEndpoint({
      host: this.host,
      path,
      query: options?.query,
      scheme: this.scheme,
      basePath: this.basePath,
      port: this.port,
    });

  private readResponseBody = async <
    S extends types.ApiResponseBody | null,
    D extends types.ClientRequestData = types.ClientRequestData,
  >(
    params: types.ClientParams,
    options?: types.ClientRequestOptions<S, D>,
  ): Promise<BodyOrError<S>> => {
    if (params.response.body === null) {
      logger.error(
        this.context(params),
        `Unexpectedly encountered [${params.response.status}] response with no body!.`,
      );
      return {
        body: null,
        error: new errors.ApiGlobalError({
          ...this.context(params),
          code: errors.ApiGlobalErrorCodes.BODY_NOT_PRESENT,
          message: "The body was not present on the response.",
        }),
      };
    }
    const reader = params.response.body.getReader();

    let contentLength: number | null = null;
    const contentLengthString = params.response.headers.get("content-length");
    if (contentLengthString !== null) {
      contentLength = parsers.parseInteger(contentLengthString);
    }

    // Declare received as 0 initially
    let received = 0;
    let loading = false;
    const chunks: Uint8Array[] = [];

    // Loop through the response stream and extract the data chunks
    while (loading) {
      const { done, value: chunk } = await reader.read();
      if (done) {
        loading = false;
      } else {
        chunks.push(chunk);
        received += chunk.length;
        if (options?.onProgress !== undefined) {
          if (contentLength === null) {
            logger.warn(
              this.context(params),
              "Progress cannot be monitored because the response did not contain a valid " +
                "content-length header.",
            );
          } else {
            options?.onProgress(received, contentLength);
          }
        }
      }
    }

    const body = new Uint8Array(received);
    let position = 0;
    // Order the chunks by their respective position
    for (const chunk of chunks) {
      body.set(chunk, position);
      position += chunk.length;
    }
    const decodedBody = new TextDecoder("utf-8").decode(body);

    try {
      // TODO: Provide schema validation here.
      return { body: JSON.parse(decodedBody) as S, error: null };
    } catch (e: unknown) {
      if (e instanceof SyntaxError) {
        logger.info("Response body was not serializable, inferring the error from the response.");
        return {
          body: null,
          error: new errors.ApiGlobalError({
            ...this.context(params),
            code: errors.ApiGlobalErrorCodes.BODY_NOT_SERIALIZABLE,
            message: "The response body was not serializable.",
          }),
        };
      } else {
        /* If the error is not related to a serialization problem with the JSON response body, do
           not suppress it. */
        throw e;
      }
    }
  };

  private handleResponse = async <
    S extends types.ApiResponseBody | null,
    D extends types.ClientRequestData = types.ClientRequestData,
  >(
    params: types.ClientParams,
    options?: types.ClientRequestOptions<S, D>,
  ): Promise<BodyOrError<S>> => {
    if (!params.response.ok) {
      // Here, the server returned a response - but the response had a 4xx or 5xx status code.
      return { error: await this.handleResponseError(params), body: null };
    }
    return this.readResponseBody<S>(params, options);
  };

  private request = async <
    M extends types.HttpMethod,
    S extends types.ApiResponseBody | null,
    D extends types.ClientRequestData = types.ClientRequestData,
    STRICT extends boolean = false,
  >(
    path: types.RequestPath<string, M>,
    method: types.HttpMethod,
    strict: STRICT,
    options?: types.ClientRequestOptions<S, D>,
  ): Promise<types.ClientVariableResponse<S, D, STRICT>> => {
    let response: Response | null = null;
    let body: S | null = null;
    let error: errors.HttpError | null = null;

    const request = new Request(this.constructUrl(path, options), {
      method,
      body:
        options?.body !== undefined && !types.payloadIsFormData(options.body)
          ? JSON.stringify(this.filterPayload(options.body))
          : undefined,
      credentials: options?.credentials === undefined ? this.credentials : options?.credentials,
      headers: {
        ...(typeof this.headers === "function" ? this.headers() : this.headers),
        ...options?.headers,
      },
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
    if (response !== null) {
      assertNull(error);
      ({ error, body } = await this.handleResponse<S>({ response, request }, options));
    }
    if (error) {
      if (strict) {
        throw error;
      }
      logger.error(
        {
          url: error.url,
          path,
          method,
          query: options?.query,
          status: response ? response.status : null,
        },
        error.message,
      );
      return { error, requestMeta: { query: options?.query } } as types.ClientVariableResponse<
        S,
        D,
        STRICT
      >;
    }
    assertNotNullOrUndefined(body);
    /* If the calling logic provides the 'strict' flag, it is expecting that the return of the
       HttpClient method does not nest the response next to an 'error' field, since the error
       would have been thrown. */
    if (strict) {
      return {
        response: body,
        requestMeta: { query: options?.query },
      } as types.ClientVariableResponse<S, D, STRICT>;
    }
    return {
      response: body,
      requestMeta: { query: options?.query },
      error: undefined,
    } as types.ClientVariableResponse<S, D, STRICT>;
  };

  /**
   * Sends a GET request to the provided path, {@link types.RequestPath<string, "GET">} with the
   * provided query, {@link Q}, in the non-strict context.
   *
   * In the non-strict context, errors that occur during the request, {@link errors.HttpError}, will
   * not be thrown, but will instead be included in the method return.
   *
   * @param {types.RequestPath<string, "GET">} path The path to send the GET request.
   *
   * @param {types.ClientRequestOptions<S, { query: Q }>} options
   * 	 The options for the request.  These options will override any options that were provided
   *   during the configuration of the {@link HttpClient} instance.
   *
   *   @see {types.ClientRequestOptions}
   *
   * @returns {Promise<types.ClientResponse<S, { query: Q }>>}
   *   A {@link Promise} whose contents contain the JSON serialized response body, {@link S}, in the
   *   case that the request succeeded, or an instance of an error, {@link errors.HttpError}, in the
   *   case that the request failed.
   *
   *   @see types.ClientResponse
   */
  public get = async <S extends types.ApiResponseBody, Q extends types.RawQuery = types.RawQuery>(
    path: types.RequestPath<string, "GET">,
    options?: types.ClientRequestOptions<S, { query: Q }>,
  ): Promise<types.ClientResponse<S, { query: Q }>> =>
    this.request<"GET", S, { query: Q }, false>(path, types.HttpMethods.GET, false, options);

  /**
   * Sends a GET request to the provided path, {@link types.RequestPath<string, "GET">} with the
   * provided query, {@link Q}, in the strict context.
   *
   * In the strict context, errors that occur during the request, {@link errors.HttpError}, will not
   * be included in the return of the method, but will instead be thrown.
   *
   * @param {types.RequestPath<string, "GET">} path The path to send the GET request.
   *
   * @param {types.ClientRequestOptions<S, { query: Q }>} options
   * 	 The options for the request.  These options will override any options that were provided
   *   during the configuration of the {@link HttpClient} instance.
   *
   *   @see {types.ClientRequestOptions}
   *
   * @returns {Promise<types.ClientStrictResponse<S, { query: Q }>>}
   *   A {@link Promise} whose contents contain the JSON serialized response body, {@link S}, of the
   *   response in the case that the request succeeds.
   *
   *   @see types.ClientStrictResponse
   */
  public getStrict = async <
    S extends types.ApiResponseBody,
    Q extends types.RawQuery = types.RawQuery,
  >(
    path: types.RequestPath<string, "GET">,
    options?: types.ClientRequestOptions<S, { query: Q }>,
  ): Promise<types.ClientStrictResponse<S, { query: Q }>> =>
    this.request<"GET", S, { query: Q }, true>(path, types.HttpMethods.GET, true, options);

  public createParameterizedGetService =
    <
      U extends types.RequestPath<string, "GET">,
      S extends types.ApiResponseBody,
      Q extends types.RawQuery = types.RawQuery,
    >(
      urlPattern: U,
      opts?: types.ServiceOptions<S, { query: Q }>,
    ): types.ParameterizedService<"GET", U, S, { query: Q }> =>
    (params, options?) =>
      this.get<S, Q>(
        injectUrlPathParams(urlPattern, params) as types.RequestPath<string, "GET">,
        mergeWithServiceOptions(opts, options),
      );

  public createGetService =
    <S extends types.ApiResponseBody, Q extends types.RawQuery = types.RawQuery>(
      url: types.RequestPath<string, "GET">,
      opts?: types.ServiceOptions<S, { query: Q }>,
    ): types.Service<S, { query: Q }> =>
    (options?) =>
      this.get<S, Q>(url, mergeWithServiceOptions(opts, options));

  /**
   * Retrieves a model at the provided path, {@link types.RequestPath<string, "GET">}, using a
   * request with the optionally provided provided query, {@link Q},
   *
   * @param {types.RequestPath<string, "GET">} path The path to send the GET request.
   *
   * @param {types.ClientRequestOptions<M, { query: Q }>} options
   * 	 The options for the request.  These options will override any options that were provided
   *   during the configuration of the {@link HttpClient} instance.
   *
   *   @see {types.ClientRequestOptions}
   *
   * @returns {Promise<types.ClientResponse<M, { query: Q }>>}
   *   A {@link Promise} whose contents contain the JSON serialized response body, {@link M}, in the
   *   case that the request succeeded, or an instance of an error, {@link errors.HttpError}, in the
   *   case that the request failed.
   *
   *   @see types.ClientResponse
   */
  public retrieve = async <
    M extends import("lib/model").Model,
    Q extends types.RawQuery = types.RawQuery,
  >(
    path: types.RequestPath<string, "GET">,
    options?: types.ClientRequestOptions<M, { query: Q }>,
  ): Promise<types.ClientResponse<M, { query: Q }>> =>
    this.get<types.ApiSuccessResponse<M>, Q>(path, options);

  public createParameterizedRetrieveService =
    <
      U extends types.RequestPath<string, "GET">,
      M extends import("lib/model").Model,
      Q extends types.RawQuery = types.RawQuery,
    >(
      urlPattern: U,
      opts?: types.ServiceOptions<M, { query: Q }>,
    ): types.ParameterizedService<"GET", U, M, { query: Q }> =>
    async (params, options?) =>
      this.retrieve<M, Q>(
        injectUrlPathParams(urlPattern, params) as types.RequestPath<string, "GET">,
        mergeWithServiceOptions(opts, options),
      );

  /**
   * Retrieves a series of data, {@link M[]}, at the provided path,
   * {@link types.RequestPath<string, "GET">}, using a request with the optionally provided provided
   * query, {@link Q},
   *
   * @param {types.RequestPath<string, "GET">} path The path to send the GET request.
   *
   * @param {types.ClientRequestOptions<M, { query: Q }>} options
   * 	 The options for the request.  These options will override any options that were provided
   *   during the configuration of the {@link HttpClient} instance.
   *
   *   @see {types.ClientRequestOptions}
   *
   * @returns {Promise<types.ClientResponse<types.ApiListResponse<M>, { query: Q }>>}
   *   A {@link Promise} whose contents contain the JSON serialized response body, {@link M[]}, in
   *   the case that the request succeeded, or an instance of an error, {@link errors.HttpError},
   *   in the case that the request failed.
   *
   *   @see types.ClientResponse
   */
  public list = async <
    M extends types.ListResponseIteree,
    Q extends types.ListQuery = types.ListQuery,
  >(
    path: types.RequestPath<string, "GET">,
    options?: types.ClientRequestOptions<M, { query: Q }>,
  ): Promise<types.ClientResponse<types.ApiListResponse<M>, { query: Q }>> =>
    this.get<types.ApiListResponse<M>, Q>(path, {
      ...options,
      schema:
        options?.schema !== undefined
          ? types.createApiListResponseSchema<M>(options.schema)
          : undefined,
    });

  public createParameterizedListService =
    <
      U extends types.RequestPath<string, "GET">,
      M extends types.ListResponseIteree,
      Q extends types.ListQuery = types.ListQuery,
    >(
      urlPattern: U,
      opts?: types.ServiceOptions<M, { query: Q }>,
    ): types.ParameterizedService<"GET", U, types.ApiListResponse<M>, { query: Q }, M> =>
    async (params, options?) =>
      this.list<M, Q>(
        injectUrlPathParams(urlPattern, params) as types.RequestPath<string, "GET">,
        mergeWithServiceOptions(opts, options),
      );

  public createListService =
    <M extends types.ListResponseIteree, Q extends types.ListQuery = types.ListQuery>(
      url: types.RequestPath<string, "GET">,
      opts?: types.ServiceOptions<M, { query: Q }>,
    ): types.Service<types.ApiListResponse<M>, { query: Q }, M> =>
    async (options?) =>
      this.list<M, Q>(url, mergeWithServiceOptions(opts, options));

  /**
   * Retrieves a series of models, {@link M[]}, at the provided path,
   * {@link types.RequestPath<string, "GET">}, using a request with the optionally provided provided
   * query, {@link Q},
   *
   * @param {types.RequestPath<string, "GET">} path The path to send the GET request.
   *
   * @param {types.ClientRequestOptions<M, { query: Q }>} options
   * 	 The options for the request.  These options will override any options that were provided
   *   during the configuration of the {@link HttpClient} instance.
   *
   *   @see {types.ClientRequestOptions}
   *
   * @returns {Promise<types.ClientResponse<M, { query: Q }>>}
   *   A {@link Promise} whose contents contain the JSON serialized response body, {@link M[]}, in
   *   the case that the request succeeded, or an instance of an error, {@link errors.HttpError},
   *   in the case that the request failed.
   *
   *   @see types.ClientResponse
   */
  public listModels = async <
    M extends import("lib/model").ApiModel,
    Q extends types.ApiModelListQuery<M> = types.ApiModelListQuery<M>,
  >(
    path: types.RequestPath<string, "GET">,
    options?: types.ClientRequestOptions<M, { query: Q }>,
  ): Promise<types.ClientResponse<types.ApiListResponse<M>, { query: Q }>> =>
    this.get<types.ApiListResponse<M>, Q>(path, {
      ...options,
      schema:
        options?.schema !== undefined
          ? types.createApiListResponseSchema<M>(options.schema)
          : undefined,
    });

  public createParameterizedListModelsService =
    <
      U extends types.RequestPath<string, "GET">,
      M extends import("lib/model").ApiModel,
      Q extends types.ApiModelListQuery<M> = types.ApiModelListQuery<M>,
    >(
      urlPattern: U,
      opts?: types.ServiceOptions<M, { query: Q }>,
    ): types.ParameterizedService<"GET", U, types.ApiListResponse<M>, { query: Q }, M> =>
    async (params, options?) =>
      this.listModels<M, Q>(
        injectUrlPathParams(urlPattern, params) as types.RequestPath<string, "GET">,
        mergeWithServiceOptions(opts, options),
      );

  public createListModelsService =
    <
      M extends import("lib/model").ApiModel,
      Q extends types.ApiModelListQuery<M> = types.ApiModelListQuery<M>,
    >(
      url: types.RequestPath<string, "GET">,
      opts?: types.ServiceOptions<M, { query: Q }>,
    ): types.Service<types.ApiListResponse<M>, { query: Q }, M> =>
    async (options?) =>
      this.listModels<M, Q>(url, mergeWithServiceOptions(opts, options));

  /**
   * Sends a POST request to the provided path, {@link types.RequestPath<string, "POST">} with the
   * provided body, {@link P}, in the non-strict context.
   *
   * In the non-strict context, errors that occur during the request, {@link errors.HttpError}, will
   * not be thrown, but will instead be included in the method return.
   *
   * @param {types.RequestPath<string, "POST">} path The path to send the POST request.
   *
   * @param {types.ClientRequestOptions<S, { body: P }>} options
   * 	 The options for the request.  These options will override any options that were provided
   *   during the configuration of the {@link HttpClient} instance.
   *
   *   @see {types.ClientRequestOptions}
   *
   * @returns {Promise<types.ClientResponse<S, { body: P }>>}
   *   A {@link Promise} whose contents contain the JSON serialized response body or an instance
   *   of {@link errors.HttpError} in the case that the request failed or the response indicated
   *   there was an error.
   *
   *   @see types.ClientResponse
   */
  public post = async <
    S extends types.ApiResponseBody | null,
    P extends types.Payload = types.Payload,
  >(
    path: types.RequestPath<string, "POST">,
    options?: types.ClientRequestOptions<S, { body: P }>,
  ): Promise<types.ClientResponse<S, { body: P }>> =>
    this.request<"POST", S, { body: P }, false>(path, types.HttpMethods.POST, false, options);

  /**
   * Sends a POST request to the provided path, {@link types.RequestPath<string, "POST">} with the
   * provided body, {@link P}, in the strict context.
   *
   * In the strict context, errors that occur during the request, {@link errors.HttpError}, will not
   * be included in the return of the method, but will instead be thrown.
   *
   * @param {types.RequestPath<string, "POST">} path The path to send the GET request.
   *
   * @param {types.ClientRequestOptions<S, { body: P }>} options
   * 	 The options for the request.  These options will override any options that were provided
   *   during the configuration of the {@link HttpClient} instance.
   *
   *   @see {types.ClientRequestOptions}
   *
   * @returns {Promise<types.ClientStrictResponse<S, { body: P }>>}
   *   A {@link Promise} whose contents contain the JSON serialized response body, {@link S}, of the
   *   response in the case that the request succeeds.
   *
   *   @see types.ClientStrictResponse
   */
  public postStrict = async <
    S extends types.ApiResponseBody | null,
    P extends types.Payload = types.Payload,
  >(
    path: types.RequestPath<string, "POST">,
    options?: types.ClientRequestOptions<S, { body: P }>,
  ): Promise<types.ClientStrictResponse<S, { body: P }>> =>
    this.request<"POST", S, { body: P }, true>(path, types.HttpMethods.POST, true, options);

  public createPostService =
    <S extends types.ApiResponseBody | null, P extends types.Payload = types.Payload>(
      url: types.RequestPath<string, "POST">,
      opts?: types.ServiceOptions<S, { body: P }>,
    ): types.Service<S, { body: P }> =>
    async (options?) =>
      this.post<S, P>(url, mergeWithServiceOptions(opts, options));

  public createParameterizedPostService =
    <
      U extends types.RequestPath<string, "POST">,
      S extends types.ApiResponseBody | null,
      P extends types.Payload = types.Payload,
    >(
      urlPattern: U,
      opts?: types.ServiceOptions<S, { body: P }>,
    ): types.ParameterizedService<"POST", U, S, { body: P }> =>
    async (params, options?) =>
      this.post<S, P>(
        injectUrlPathParams(urlPattern, params) as types.RequestPath<string, "POST">,
        mergeWithServiceOptions(opts, options),
      );

  /**
   * Sends a POST request to the provided path, {@link types.RequestPath<string, "POST">} in the
   * non-strict context, for purposes of uploading files.
   *
   * In the non-strict context, errors that occur during the request, {@link errors.HttpError}, will
   * not be thrown, but will instead be included in the method return.
   *
   * @param {types.RequestPath<string, "POST">} path The path to send the POST request.
   *
   * @param {Omit<types.ClientRequestOptions<S, { body: FormData }>, "body">} options
   * 	 The options for the request.  These options will override any options that were provided
   *   during the configuration of the {@link HttpClient} instance.
   *
   *   @see {types.ClientRequestOptions}
   *
   * @returns {Promise<types.ClientResponse<S, { body: FormData }>>}
   *   A {@link Promise} whose contents contain the JSON serialized response body, {@link S}, in the
   *   case that the request succeeded, or an instance of an error, {@link errors.HttpError}, in the
   *   case that the request failed.
   *
   *   @see types.ClientResponse
   */
  public upload = <S extends types.ApiResponseBody | null>(
    path: types.RequestPath<string, "POST">,
    file: File | types.FilepondFile | (File | types.FilepondFile)[] | FileList,
    options?: Omit<types.ClientRequestOptions<S, { body: FormData }>, "body">,
  ): Promise<types.ClientResponse<S, { body: FormData }>> => {
    const formData = new FormData();
    if (types.isSingleFile(file)) {
      formData.append("file", file, file.name);
    } else if (types.isFiles(file)) {
      for (let i = 0; i < file.length; i++) {
        formData.append("files", file[i], file[i].name);
      }
    } else {
      Object.entries(file).forEach((v: [string, File]) =>
        formData.append("files", v[1], v[1].name),
      );
    }
    return this.post<S, FormData>(path, { ...options, body: formData });
  };

  public createUploadService =
    <S extends types.ApiResponseBody | null>(url: types.RequestPath<string, "POST">) =>
    async (
      file: File | types.FilepondFile | (File | types.FilepondFile)[] | FileList,
      options?: Omit<types.ClientRequestOptions<S, { body: FormData }>, "body">,
    ): Promise<types.ClientResponse<S, { body: FormData }>> =>
      this.upload<S>(url, file, options);

  public createParameterizedUploadService =
    <U extends types.RequestPath<string, "POST">, S extends types.ApiResponseBody | null>(
      urlPattern: U,
      opts?: types.ServiceOptions<S, { body: FormData }>,
    ) =>
    async (
      params: types.UrlPathParamsObj<U>,
      file: File | types.FilepondFile | (File | types.FilepondFile)[] | FileList,
      options?: Omit<types.ClientRequestOptions<S, { body: FormData }>, "body">,
    ): Promise<types.ClientResponse<S, { body: FormData }>> =>
      this.upload<S>(
        injectUrlPathParams(urlPattern, params) as types.RequestPath<string, "POST">,
        file,
        mergeWithServiceOptions(opts, options),
      );

  /**
   * Sends a DELETE request to the provided path, {@link types.RequestPath<string, "DELETE">} in the
   * non-strict context.
   *
   * In the non-strict context, errors that occur during the request, {@link errors.HttpError}, will
   * not be thrown, but will instead be included in the method return.
   *
   * @param {types.RequestPath<string, "DELETE">} path The path to send the DELETE request.
   *
   * @param {types.ClientRequestOptions<S>} options
   * 	 The options for the request.  These options will override any options that were provided
   *   during the configuration of the {@link HttpClient} instance.
   *
   *   @see {types.ClientRequestOptions}
   *
   * @returns {Promise<types.ClientResponse<S>>}
   *   A {@link Promise} whose contents contain the JSON serialized response body, {@link S}, in the
   *   case that the request succeeded, or an instance of an error, {@link errors.HttpError}, in the
   *   case that the request failed.
   *
   *   @see types.ClientResponse
   */
  public delete = async <S extends types.ApiResponseBody | null = null>(
    path: types.RequestPath<string, "DELETE">,
    options?: types.ClientRequestOptions<S>,
  ): Promise<types.ClientResponse<S>> =>
    this.request<"DELETE", S, types.ClientRequestData, false>(
      path,
      types.HttpMethods.DELETE,
      false,
      options,
    );

  /**
   * Sends a DELETE request to the provided path, {@link types.RequestPath<string, "DELETE">} in the
   * strict context.
   *
   * In the strict context, errors that occur during the request, {@link errors.HttpError}, will not
   * be included in the return of the method, but will instead be thrown.
   *
   * @param {types.RequestPath<string, "DELETE">} path The path to send the DELETE request.
   *
   * @param {types.ClientRequestOptions<S>} options
   * 	 The options for the request.  These options will override any options that were provided
   *   during the configuration of the {@link HttpClient} instance.
   *
   *   @see {types.ClientRequestOptions}
   *
   * @returns {Promise<types.ClientStrictResponse<S>>}
   *   A {@link Promise} whose contents contain the JSON serialized response body, {@link S}, of the
   *   response in the case that the request succeeds.
   *
   *   @see types.ClientStrictResponse
   */
  public deleteStrict = async <S extends types.ApiResponseBody | null = null>(
    path: types.RequestPath<string, "DELETE">,
    options?: types.ClientRequestOptions<S>,
  ): Promise<types.ClientStrictResponse<S>> =>
    this.request<"DELETE", S, types.ClientRequestData, true>(
      path,
      types.HttpMethods.DELETE,
      true,
      options,
    );

  public createParameterizedDeleteService =
    <U extends types.RequestPath<string, "DELETE">, S extends types.ApiResponseBody | null = null>(
      urlPattern: U,
      opts?: types.ServiceOptions<S>,
    ): types.ParameterizedService<"DELETE", U, S, types.ClientRequestData> =>
    async (params, options?) =>
      this.delete<S>(
        injectUrlPathParams(urlPattern, params) as types.RequestPath<string, "DELETE">,
        mergeWithServiceOptions(opts, options),
      );

  /**
   * Sends a PATCH request to the provided path, {@link types.RequestPath<string, "PATCH">} with the
   * provided body, {@link P}, in the non-strict context.
   *
   * In the non-strict context, errors that occur during the request, {@link errors.HttpError}, will
   * not be thrown, but will instead be included in the method return.
   *
   * @param {types.RequestPath<string, "PATCH">} path The path to send the PATCH request.
   *
   * @param {types.ClientRequestOptions<S, { body: P }>} options
   * 	 The options for the request.  These options will override any options that were provided
   *   during the configuration of the {@link HttpClient} instance.
   *
   *   @see {types.ClientRequestOptions}
   *
   * @returns {Promise<types.ClientResponse<S, { body: P }>>}
   *   A {@link Promise} whose contents contain the JSON serialized response body, {@link S}, in the
   *   case that the request succeeded, or an instance of an error, {@link errors.HttpError}, in the
   *   case that the request failed.
   *
   *   @see types.ClientResponse
   */
  public patch = async <
    S extends types.ApiResponseBody | null,
    P extends types.Payload = types.Payload,
  >(
    path: types.RequestPath<string, "PATCH">,
    options?: types.ClientRequestOptions<S, { body: P }>,
  ): Promise<types.ClientResponse<S, { body: P }>> =>
    this.request<"PATCH", S, { body: P }, false>(path, types.HttpMethods.PATCH, false, options);

  /**
   * Sends a PATCH request to the provided path, {@link types.RequestPath<string, "PATCH">} with the
   * provided body, {@link P}, in the strict context.
   *
   * In the strict context, errors that occur during the request, {@link errors.HttpError}, will not
   * be included in the return of the method, but will instead be thrown.
   *
   * @param {types.RequestPath<string, "PATCH">} path The path to send the GET request.
   *
   * @param {types.ClientRequestOptions<S, { body: P }>} options
   * 	 The options for the request.  These options will override any options that were provided
   *   during the configuration of the {@link HttpClient} instance.
   *
   *   @see {types.ClientRequestOptions}
   *
   * @returns {Promise<types.ClientStrictResponse<S, { body: P }>>}
   *   A {@link Promise} whose contents contain the JSON serialized response body, {@link S}, of the
   *   response in the case that the request succeeds.
   *
   *   @see types.ClientStrictResponse
   */
  public patchStrict = async <
    S extends types.ApiResponseBody | null,
    P extends types.Payload = types.Payload,
  >(
    path: types.RequestPath<string, "PATCH">,
    options?: types.ClientRequestOptions<S, { body: P }>,
  ): Promise<types.ClientStrictResponse<S, { body: P }>> =>
    this.request<"PATCH", S, { body: P }, true>(path, types.HttpMethods.GET, true, options);

  public createParameterizedPatchService =
    <
      U extends types.RequestPath<string, "PATCH">,
      S extends types.ApiResponseBody | null,
      P extends types.Payload = types.Payload,
    >(
      urlPattern: U,
      opts?: types.ServiceOptions<S, { body: P }>,
    ): types.ParameterizedService<"PATCH", U, S, { body: P }> =>
    async (params, options?) =>
      this.patch<S, P>(
        injectUrlPathParams(urlPattern, params) as types.RequestPath<string, "PATCH">,
        mergeWithServiceOptions(opts, options),
      );

  public createPatchService =
    <S extends types.ApiResponseBody | null, P extends types.Payload = types.Payload>(
      url: types.RequestPath<string, "PATCH">,
      opts?: types.ServiceOptions<S, { body: P }>,
    ): types.Service<S, { body: P }> =>
    async (options?) =>
      this.patch<S, P>(url, mergeWithServiceOptions(opts, options));
}
