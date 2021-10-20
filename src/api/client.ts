import axios, { AxiosError, AxiosInstance, AxiosResponse, AxiosRequestConfig } from "axios";
import axiosRetry from "axios-retry";
import Cookies from "universal-cookie";
import { isNil } from "lodash";

import { util } from "lib";

import { ClientError, NetworkError, ServerError } from "./errors";

/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars, @typescript-eslint/no-unused-vars */
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

export const getRequestHeaders = (): { [key: string]: string } => {
  const headers: { [key: string]: string } = {};
  const cookies = new Cookies();
  // The CSRF Token needs to be set as a header for POST/PATCH/PUT requests
  // with Django - unfortunately, we cannot include it as a cookie only
  // because their middleware looks for it in the headers.
  const csrfToken: string = cookies.get("greenbudgetcsrftoken");
  if (!isNil(csrfToken)) {
    headers["X-CSRFToken"] = csrfToken;
  }
  return headers;
};

instance.interceptors.request.use((config: AxiosRequestConfig): AxiosRequestConfig => {
  config = config || {};
  config.headers = { ...config.headers, ...getRequestHeaders() };
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
const throwClientError = (error: AxiosError<Http.ErrorResponse>) => {
  if (isNil(error.response) || isNil(error.response.data)) {
    return;
  }
  const response = error.response;
  const url = !isNil(error.response.config.url) ? error.response.config.url : "";
  if (!isNil(response.data.force_logout)) {
    window.location.href = "/login";
  } else {
    if (!isNil(response.data.errors)) {
      throw new ClientError({
        response,
        errors: response.data.errors,
        status: response.status,
        url,
        userId: response.data.user_id
      });
    } else {
      // On 404's Django will sometimes bypass DRF exception handling and
      // return a 404.html template response.  We should bypass this in the
      // backend, but for the time being we can manually raise a ClientError.
      if (error.response.status === 404) {
        throw new ClientError({
          response,
          errors: [
            {
              message: "The requested resource could not be found.",
              code: "not_found",
              error_type: "http"
            }
          ],
          status: response.status,
          url
        });
      } else {
        /* eslint-disable no-console */
        console.warn(`
          The response body from the backend does not conform to a standard convention for indicating
          a client error - the specific type of error cannot be determined.
      `);
        console.log(error.response);
        throw new ClientError({
          response,
          errors: [{ message: "Unknown client error.", error_type: "unknown", code: "unknown" }],
          status: response.status,
          url
        });
      }
    }
  }
};

instance.interceptors.response.use(
  (response: AxiosResponse<any>): AxiosResponse<any> => response,
  (error: AxiosError<Http.ErrorResponse>) => {
    if (!isNil(error.response)) {
      const response = error.response;
      if (response.status >= 400 && response.status < 500) {
        throwClientError(error);
      } else {
        const url = !isNil(error.request.config) ? error.request.config.url : undefined;
        throw new ServerError({ status: error.response.status, url });
      }
    } else if (!isNil(error.request)) {
      throw new NetworkError({ url: !isNil(error.request.config) ? error.request.conf.url : undefined });
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
    url: Http.V1Url,
    query: Http.Query = {},
    method:
      | HttpRequestMethods.POST
      | HttpRequestMethods.GET
      | HttpRequestMethods.PUT
      | HttpRequestMethods.DELETE
      | HttpRequestMethods.PATCH
  ): Http.V1Url => {
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
      url = util.urls.addQueryParamsToUrl(url, rest, { filter: [""] }) as Http.V1Url;
    } else if (!url.endsWith("/")) {
      url = (url + "/") as Http.V1Url;
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
    url: Http.V1Url,
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
    const response: AxiosResponse<T> = await lookup[method](url, filterPayload(payload), {
      cancelToken: options.cancelToken,
      headers: options.headers
    });
    return response.data;
  };

  /**
   * Submits a GET request to the provided URL.
   *
   * @param url     The URL to send the POST request.
   * @param query   The query parameters to embed in the URL.
   * @param options The options for the request (see IRequestOptions).
   */
  get = async <T>(url: Http.V1Url, query: Http.Query = {}, options: Http.RequestOptions = {}): Promise<T> => {
    return this.request<T>(HttpRequestMethods.GET, url, query, {}, options);
  };

  /**
   * Submits a GET request to the provided URL to retrieve a specific resource
   * at it's detail endpoint.
   *
   * @param url     The URL to send the POST request.
   * @param options The options for the request (see IRequestOptions).
   */
  retrieve = async <T>(url: Http.V1Url, options: Http.RequestOptions = {}): Promise<T> => {
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
    url: Http.V1Url,
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
  post = async <T>(url: Http.V1Url, payload: Http.Payload = {}, options: Http.RequestOptions = {}): Promise<T> => {
    return this.request<T>(HttpRequestMethods.POST, url, {}, payload, options);
  };

  upload = async <T>(
    url: Http.V1Url,
    payload: Http.Payload = {},
    options: Http.RequestOptions = {}
  ): Promise<AxiosResponse<T>> => {
    url = this._prepare_url(url, {}, HttpRequestMethods.POST);
    return this.instance.post(url, payload, {
      cancelToken: options.cancelToken || undefined,
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
  put = async <T>(url: Http.V1Url, payload: Http.Payload = {}, options: Http.RequestOptions = {}): Promise<T> => {
    return this.request<T>(HttpRequestMethods.PUT, url, {}, payload, options);
  };

  /**
   * Sends a DELETE request to the provided URL.
   *
   * @param url        The URL to send the DELETE request.
   * @param payload    The JSON body of the request.
   * @param options    The options for the request (see IRequestOptions).
   */
  delete = async <T>(url: Http.V1Url, options: Http.RequestOptions = {}): Promise<T> => {
    return this.request<T>(HttpRequestMethods.DELETE, url, {}, {}, options);
  };

  /**
   * Sends a PATCH request to the provided URL.
   *
   * @param url        The URL to send the PATCH request.
   * @param payload    The JSON body of the request.
   * @param options    The options for the request (see IRequestOptions).
   */
  patch = async <T>(url: Http.V1Url, payload: Http.Payload = {}, options: Http.RequestOptions = {}): Promise<T> => {
    return this.request(HttpRequestMethods.PATCH, url, {}, payload, options);
  };
}

export const client = new ApiClient(instance);
export default client;
