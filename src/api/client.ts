import axios, { AxiosError, AxiosInstance, AxiosResponse, AxiosRequestConfig } from "axios";
import axiosRetry from "axios-retry";
import Cookies from "universal-cookie";
import { isNil } from "lodash";

import { util } from "lib";

import { ClientError, NetworkError, ServerError, ForceLogout, AuthenticationError } from "./errors";
import { parseAuthError } from "./util";

/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
export enum ErrorCodes {
  UNKNOWN = "unknown",
  NOT_FOUND = "not_found"
}

/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
export enum HttpRequestMethods {
  GET = "GET",
  POST = "POST",
  DELETE = "DELETE",
  PUT = "PUT",
  PATCH = "PATCH"
}

export const instance = axios.create({
  baseURL: process.env.REACT_APP_API_DOMAIN,
  withCredentials: true
});

instance.interceptors.request.use((config: AxiosRequestConfig): AxiosRequestConfig => {
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
});

export const filterPayload = <T extends { [key: string]: any } = { [key: string]: any }>(payload: T): T => {
  let newPayload: { [key: string]: any } = {};
  Object.keys(payload).forEach((key: string) => {
    if (payload[key] !== undefined) {
      newPayload[key] = payload[key];
    }
  });
  return newPayload as T;
};

/**
 * Parses the error information from the response embedded in an AxiosError
 * and returns an appropriate ClientError to be handled.
 *
 * @param error The AxiosError that was raised.
 */
const createClientError = (error: AxiosError<Http.ErrorResponse>): ClientError | ForceLogout | undefined => {
  if (isNil(error.response) || isNil(error.response.data)) {
    return;
  }
  const response = error.response;
  const url = !isNil(error.response.config.url) ? error.response.config.url : "";

  if (!isNil(response.data.errors)) {
    if (response.status === 403 || response.status === 401) {
      const authError = parseAuthError(response.data);
      if (!isNil(authError) && authError.force_logout === true) {
        return new ForceLogout();
      } else {
        return new AuthenticationError(response, response.data.errors, url);
      }
    }
    return new ClientError(response, response.data.errors, response.status, url);
  } else {
    // On 404's Django will sometimes bypass DRF exception handling and
    // return a 404.html template response.  We should bypass this in the
    // backend, but for the time being we can manually raise a ClientError.
    if (error.response.status === 404) {
      return new ClientError(
        response,
        [
          {
            message: "The requested resource could not be found.",
            code: ErrorCodes.NOT_FOUND,
            error_type: "http"
          }
        ],
        response.status,
        url
      );
    } else {
      /* eslint-disable no-console */
      console.warn(`
        The response body from the backend does not conform to a standard convention for indicating
        a client error - the specific type of error cannot be determined.
    `);
      return new ClientError(
        response,
        [{ message: "Unknown client error.", error_type: "unknown", code: ErrorCodes.UNKNOWN }],
        response.status,
        url
      );
    }
  }
};

instance.interceptors.response.use(
  (response: AxiosResponse<any>): AxiosResponse<any> => response,
  (error: AxiosError<Http.ErrorResponse>) => {
    if (!isNil(error.response)) {
      const response = error.response;
      if (response.status >= 400 && response.status < 500) {
        const clientError: ClientError | ForceLogout | undefined = createClientError(error);
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

export class ApiClient {
  readonly instance: AxiosInstance;

  constructor(instance: AxiosInstance) {
    this.instance = instance;
  }

  _prepare_url = (
    url: string,
    query: Http.Query = {},
    method:
      | HttpRequestMethods.POST
      | HttpRequestMethods.GET
      | HttpRequestMethods.PUT
      | HttpRequestMethods.DELETE
      | HttpRequestMethods.PATCH
  ): string => {
    if (method === HttpRequestMethods.GET) {
      const { ordering, ...rest } = query;
      // Convert Ordering to String if Present
      if (method === HttpRequestMethods.GET && !isNil(ordering)) {
        if (typeof ordering !== "string") {
          rest.ordering = util.urls.convertOrderingQueryToString(ordering);
        } else {
          rest.ordering = ordering;
        }
      }
      url = util.urls.addQueryParamsToUrl(url, rest, { filter: [""] });
    } else if (!url.endsWith("/")) {
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
   * @param options    The options for the request (see Http.RequestOptions).
   */
  request = async <T>(
    method:
      | HttpRequestMethods.POST
      | HttpRequestMethods.GET
      | HttpRequestMethods.PUT
      | HttpRequestMethods.DELETE
      | HttpRequestMethods.PATCH,
    url: string,
    query: Http.Query = {},
    payload: Http.Payload = {},
    options: Http.RequestOptions
  ): Promise<T> => {
    axiosRetry(this.instance, { retries: options.retries });

    const lookup: { [key: string]: any } = {
      [HttpRequestMethods.POST]: this.instance.post,
      [HttpRequestMethods.GET]: this.instance.get,
      [HttpRequestMethods.PUT]: this.instance.put,
      [HttpRequestMethods.DELETE]: this.instance.delete,
      [HttpRequestMethods.PATCH]: this.instance.patch
    };
    url = this._prepare_url(url, query, method);
    let response: AxiosResponse<T>;

    try {
      response = await lookup[method](url, filterPayload(payload), {
        cancelToken: options.cancelToken,
        headers: options.headers
      });
      return response.data;
    } catch (e: unknown) {
      if (e instanceof ForceLogout) {
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
  get = async <T>(url: string, query: Http.Query = {}, options: Http.RequestOptions = {}): Promise<T> => {
    return this.request<T>(HttpRequestMethods.GET, url, query, {}, options);
  };

  /**
   * Submits a GET request to the provided URL to retrieve a specific resource
   * at it's detail endpoint.
   *
   * @param url     The URL to send the POST request.
   * @param options The options for the request (see IRequestOptions).
   */
  retrieve = async <T>(url: string, options: Http.RequestOptions = {}): Promise<T> => {
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
    query: Http.ListQuery,
    options: Http.RequestOptions = {}
  ): Promise<Http.ListResponse<T>> => {
    return this.request<Http.ListResponse<T>>(HttpRequestMethods.GET, url, query, {}, options);
  };

  /**
   * Sends a POST request to the provided URL.
   *
   * @param url        The URL to send the POST request.
   * @param payload    The JSON body of the request.
   * @param options    The options for the request (see IRequestOptions).
   */
  post = async <T>(url: string, payload: Http.Payload = {}, options: Http.RequestOptions = {}): Promise<T> => {
    return this.request<T>(HttpRequestMethods.POST, url, {}, payload, options);
  };

  upload = async <T>(
    url: string,
    payload: Http.Payload = {},
    options: Http.RequestOptions = {}
  ): Promise<AxiosResponse<T>> => {
    url = this._prepare_url(url, {}, HttpRequestMethods.POST);
    return this.instance.post(url, payload, {
      cancelToken: options.cancelToken,
      headers: options.headers
    });
  };

  /**
   * Sends a PUT request to the provided URL.
   *
   * @param url        The URL to send the PUT request.
   * @param payload    The JSON body of the request.
   * @param options    The options for the request (see IRequestOptions).
   */
  put = async <T>(url: string, payload: Http.Payload = {}, options: Http.RequestOptions = {}): Promise<T> => {
    return this.request<T>(HttpRequestMethods.PUT, url, {}, payload, options);
  };

  /**
   * Sends a DELETE request to the provided URL.
   *
   * @param url        The URL to send the DELETE request.
   * @param payload    The JSON body of the request.
   * @param options    The options for the request (see IRequestOptions).
   */
  delete = async <T>(url: string, options: Http.RequestOptions = {}): Promise<T> => {
    return this.request<T>(HttpRequestMethods.DELETE, url, {}, {}, options);
  };

  /**
   * Sends a PATCH request to the provided URL.
   *
   * @param url        The URL to send the PATCH request.
   * @param payload    The JSON body of the request.
   * @param options    The options for the request (see IRequestOptions).
   */
  patch = async <T>(url: string, payload: Http.Payload = {}, options: Http.RequestOptions = {}): Promise<T> => {
    return this.request(HttpRequestMethods.PATCH, url, {}, payload, options);
  };
}

export const client = new ApiClient(instance);
export default client;
