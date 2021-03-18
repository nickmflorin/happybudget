import axios, { AxiosError, AxiosResponse, AxiosRequestConfig } from "axios";
import axiosRetry from "axios-retry";
import Cookies from "universal-cookie";
import { isNil } from "lodash";
import { addQueryParamsToUrl, convertOrderingQueryToString } from "util/urls";
import { ClientError, NetworkError, ServerError, AuthenticationError } from "./errors";
import { HttpRequestMethods } from "./model";
import { ErrorCodes } from "./codes";

const _client = axios.create({
  baseURL: process.env.REACT_APP_API_DOMAIN,
  withCredentials: true
});

_client.interceptors.request.use(
  (config: AxiosRequestConfig): AxiosRequestConfig => {
    config = config || {};
    const cookies = new Cookies();
    // The CSRF Token needs to be set as a header for POST/PATCH/PUT requests
    // with Django - unfortunately, we cannot include it as a cookie only
    // because their middleware looks for it in the headers.
    const csrfToken: string = cookies.get("greenbudgetcsrftoken");
    if (!isNil(csrfToken)) {
      config.headers["X-CSRFToken"] = csrfToken;
    }
    return config;
  }
);

/**
 * Parses the error information from the response embedded in an AxiosError
 * and returns an appropriate ClientError to be handled.
 *
 * @param error The AxiosError that was raised.
 */
const createClientError = (error: AxiosError): ClientError | undefined => {
  if (isNil(error.response) || isNil(error.response.data)) {
    return;
  }
  const response = error.response;
  const body = response.data;
  const url = !isNil(error.response.config.url) ? error.response.config.url : "";

  if (response.status === 403) {
    return new AuthenticationError(response, body.errors, url);
  }

  if (!isNil(body.errors)) {
    return new ClientError(response, body.errors, response.status, url);
  } else {
    // On 404's Django will sometimes bypass DRF exception handling and
    // return a 404.html template response.  We should bypass this in the
    // backend, but for the time being we can manually raise a ClientError.
    if (error.response.status === 404) {
      return new ClientError(
        response,
        {
          __all__: [
            {
              message: "The requested resource could not be found.",
              code: ErrorCodes.NOT_FOUND
            }
          ]
        },
        response.status,
        url
      );
    } else {
      /* eslint-disable no-console */
      console.warn(`
        The response body from the backend does not conform to a
        standard convention for indicating a client error - the
        specific type of error cannot be determined.
    `);
      return new ClientError(
        response,
        { __all__: [{ message: "Unknown client error.", code: ErrorCodes.UNKNOWN }] },
        response.status,
        url
      );
    }
  }
};

_client.interceptors.response.use(
  (response: AxiosResponse<any>): AxiosResponse<any> => {
    return response;
  },
  (error: AxiosError<any>) => {
    if (!isNil(error.response)) {
      const response = error.response;
      if (response.status >= 400 && response.status < 500) {
        const clientError: ClientError | undefined = createClientError(error);
        if (!isNil(clientError)) {
          throw clientError;
        }
      } else {
        const url = !isNil(error.request.config) ? error.request.config.url : undefined;
        throw new ServerError(error.response.status, url);
      }
    } else if (!isNil(error.request)) {
      throw new NetworkError(!isNil(error.request.config) ? error.request.conf.url : undefined);
    } else {
      throw error;
    }
  }
);

/**
 * A client for making HTTP requests to the backend API.
 */
export class ApiClient {
  _prepare_url = (
    url: string,
    query: Http.IQuery = {},
    method:
      | HttpRequestMethods.POST
      | HttpRequestMethods.GET
      | HttpRequestMethods.PUT
      | HttpRequestMethods.DELETE
      | HttpRequestMethods.PATCH
  ): string => {
    // TODO: Eventually, we want to restrict the use of ALL query params to GET
    // requests - but there are too many PATCH/POST requests improperly using
    // query parameters.
    const { ordering, ...rest } = query;
    // Convert Ordering to String if Present
    if (method === HttpRequestMethods.GET && !isNil(ordering)) {
      if (typeof ordering !== "string") {
        rest.ordering = convertOrderingQueryToString(ordering);
      } else {
        rest.ordering = ordering;
      }
    }
    // Add Query Params to URL
    url = addQueryParamsToUrl(url, rest, { filter: [""] });
    if (method !== HttpRequestMethods.GET && !url.endsWith("/")) {
      url = url + "/";
    }
    return url;
  };
  /**
   * Submits a request to the provided URL and properly handles the response
   * and any potential error.  Should not be used alone, but should be the
   * interface that other client HTTP methods funnel into.
   *
   * @param method     The request method (GET, POST, PUT, PATCH or DELETE).
   * @param url        The URL to send the request.
   * @param query      The query parameters to embed in the URL.
   * @param payload    The JSON body of the request.
   * @param options    The options for the request (see Http.IRequestOptions).
   */
  request = async <T>(
    method:
      | HttpRequestMethods.POST
      | HttpRequestMethods.GET
      | HttpRequestMethods.PUT
      | HttpRequestMethods.DELETE
      | HttpRequestMethods.PATCH,
    url: string,
    query: Http.IQuery = {},
    payload: Http.IPayload = {},
    options: Http.IRequestOptions
  ): Promise<T> => {
    axiosRetry(_client, { retries: options.retries });

    const lookup: { [key: string]: any } = {
      [HttpRequestMethods.POST]: _client.post,
      [HttpRequestMethods.GET]: _client.get,
      [HttpRequestMethods.PUT]: _client.put,
      [HttpRequestMethods.DELETE]: _client.delete,
      [HttpRequestMethods.PATCH]: _client.patch
    };
    url = this._prepare_url(url, query, method);
    let response: AxiosResponse<T>;
    try {
      response = await lookup[method](url, payload, {
        cancelToken: options.signal,
        headers: options.headers
      });
      return response.data;
    } catch (e) {
      if (e instanceof AuthenticationError && options.redirectOnAuthenticationError !== false) {
        window.location.href = "/login";
      }
      throw e;
    }
  };

  /**
   * Submits a GET request to the provided URL.
   *
   * @param url     The URL to send the POST request.
   * @param query   The query parameters to embed in the URL.
   * @param options The options for the request (see IRequestOptions).
   */
  get = async <T>(url: string, query: Http.IQuery = {}, options: Http.IRequestOptions = {}): Promise<T> => {
    return this.request<T>(HttpRequestMethods.GET, url, query, {}, options);
  };

  /**
   * Submits a GET request to the provided URL to retrieve a specific resource
   * at it's detail endpoint.
   *
   * @param url     The URL to send the POST request.
   * @param options The options for the request (see IRequestOptions).
   */
  retrieve = async <T>(url: string, options: Http.IRequestOptions = {}): Promise<T> => {
    return this.request<T>(HttpRequestMethods.GET, url, {}, {}, options);
  };

  /**
   * Submits a GET request to the provided URL to retrieve a a list of resources
   * from it's non-detail endpoint.
   *
   * @param url     The URL to send the POST request.
   * @param query   The query parameters to embed in the URL.
   * @param options The options for the request (see IRequestOptions).
   */
  list = async <T>(
    url: string,
    query: Http.IListQuery,
    options: Http.IRequestOptions = {}
  ): Promise<Http.IListResponse<T>> => {
    return this.request<Http.IListResponse<T>>(HttpRequestMethods.GET, url, query, {}, options);
  };

  /**
   * Sends a POST request to the provided URL.
   *
   * @param url        The URL to send the POST request.
   * @param payload    The JSON body of the request.
   * @param options    The options for the request (see IRequestOptions).
   */
  post = async <T>(url: string, payload: Http.IPayload = {}, options: Http.IRequestOptions = {}): Promise<T> => {
    return this.request<T>(HttpRequestMethods.POST, url, {}, payload, options);
  };

  /**
   * Sends a PUT request to the provided URL.
   *
   * @param url        The URL to send the PUT request.
   * @param payload    The JSON body of the request.
   * @param options    The options for the request (see IRequestOptions).
   */
  put = async <T>(url: string, payload: Http.IPayload = {}, options: Http.IRequestOptions = {}): Promise<T> => {
    return this.request<T>(HttpRequestMethods.PUT, url, {}, payload, options);
  };

  /**
   * Sends a DELETE request to the provided URL.
   *
   * @param url        The URL to send the DELETE request.
   * @param payload    The JSON body of the request.
   * @param options    The options for the request (see IRequestOptions).
   */
  delete = async <T>(url: string, options: Http.IRequestOptions = {}): Promise<T> => {
    return this.request<T>(HttpRequestMethods.DELETE, url, {}, {}, options);
  };

  /**
   * Sends a PATCH request to the provided URL.
   *
   * @param url        The URL to send the PATCH request.
   * @param payload    The JSON body of the request.
   * @param options    The options for the request (see IRequestOptions).
   */
  patch = async <T>(url: string, payload: Http.IPayload = {}, options: Http.IRequestOptions = {}): Promise<T> => {
    return this.request(HttpRequestMethods.PATCH, url, {}, payload, options);
  };
}

export const client = new ApiClient();
export default client;
