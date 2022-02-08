import axios, { AxiosInstance, AxiosResponse } from "axios";
import { isNil } from "lodash";

import { util } from "lib";

import * as apiUtil from "./util";
import * as middleware from "./middleware";

export enum HttpRequestMethods {
  GET = "GET",
  POST = "POST",
  DELETE = "DELETE",
  PUT = "PUT",
  PATCH = "PATCH"
}

export const authenticatedInstance = axios.create({
  baseURL: process.env.REACT_APP_API_DOMAIN,
  withCredentials: true
});

export const tokenValidationInstance = axios.create({
  baseURL: process.env.REACT_APP_API_DOMAIN,
  withCredentials: true
});

export const unauthenticatedInstance = axios.create({
  baseURL: process.env.REACT_APP_API_DOMAIN,
  withCredentials: true
});

/* CSRF Tokens must be included for both authenticated and unauthenticated
   requests, but not token validation requests. */
authenticatedInstance.interceptors.request.use(middleware.HttpHeaderRequestMiddleware);
unauthenticatedInstance.interceptors.request.use(middleware.HttpHeaderRequestMiddleware);

/* The authenticated AxiosInstance should forcefully log out users on a 401
   response. */
authenticatedInstance.interceptors.response.use(
  (response: AxiosResponse<Http.Response>): AxiosResponse<Http.Response> => response,
  middleware.HttpErrorResponseMiddlware(true)
);

/* The token validation AxiosInstance should not forcefully log out users on a
	 401 response, because this is done in the route components. */
tokenValidationInstance.interceptors.response.use(
  (response: AxiosResponse<Http.Response>): AxiosResponse<Http.Response> => response,
  middleware.HttpErrorResponseMiddlware(false)
);

/* The unauthenticated AxiosInstance should not forcefully log out users on a 401
   response. */
unauthenticatedInstance.interceptors.response.use(
  (response: AxiosResponse<Http.Response>): AxiosResponse<Http.Response> => response,
  middleware.HttpErrorResponseMiddlware(false)
);

export class ApiClient {
  readonly instance: AxiosInstance;

  constructor(ins: AxiosInstance) {
    this.instance = ins;
  }

  _prepare_url = (
    url: Http.V1Url,
    query: Http.ListQuery<string> = {},
    method:
      | HttpRequestMethods.POST
      | HttpRequestMethods.GET
      | HttpRequestMethods.PUT
      | HttpRequestMethods.DELETE
      | HttpRequestMethods.PATCH
  ): Http.V1Url => {
    if (method === HttpRequestMethods.GET) {
      const { ordering, ...rest } = query;
      let rawQuery: Http.RawQuery = { ...rest };
      // Convert Ordering to String if Present
      if (method === HttpRequestMethods.GET && !isNil(ordering)) {
        rawQuery = { ...rawQuery, ordering: util.urls.convertOrderingQueryToString(ordering) };
      }
      url = util.urls.addQueryParamsToUrl(url, rawQuery, { filter: [""] }) as Http.V1Url;
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
    query: Http.ListQuery<string> = {},
    payload: Partial<Http.Payload> = {},
    options: Http.RequestOptions
  ): Promise<T> => {
    const lookup = {
      [HttpRequestMethods.POST]: this.instance.post,
      [HttpRequestMethods.GET]: this.instance.get,
      [HttpRequestMethods.PUT]: this.instance.put,
      [HttpRequestMethods.DELETE]: this.instance.delete,
      [HttpRequestMethods.PATCH]: this.instance.patch
    };
    url = this._prepare_url(url, query, method);
    let response: AxiosResponse<T>;
    if (method === HttpRequestMethods.GET || method === HttpRequestMethods.DELETE) {
      response = await lookup[method](url, { cancelToken: options.cancelToken });
    } else {
      response = await lookup[method](url, apiUtil.filterPayload(payload as Http.PayloadObj), {
        cancelToken: options.cancelToken,
        timeout: options.timeout
      });
    }
    /* We are getting sporadic errors where the response is not defined.  I am
       not exactly sure why this is happening, but it could be related to request
       cancellation.  For now, we will just allow the return value to be undefined
       here and force coerce it, with the understanding that the value only seems
       to be undefined in cases where we would not be accessing the response
       data anyways (i.e. task cancellation). */
    return response.data;
  };

  /**
   * Submits a GET request to the provided URL.
   *
   * @param url     The URL to send the POST request.
   * @param query   The query parameters to embed in the URL.
   * @param options The options for the request (see IRequestOptions).
   */
  get = async <T>(
    url: Http.V1Url,
    query: Http.ListQuery<string> = {},
    options: Http.RequestOptions = {}
  ): Promise<T> => {
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
  post = async <T, P extends Http.Payload = Http.Payload>(
    url: Http.V1Url,
    payload: P = {} as P,
    options: Http.RequestOptions = {}
  ): Promise<T> => {
    return this.request<T>(HttpRequestMethods.POST, url, {}, payload, options);
  };

  upload = async <T, P extends Http.Payload = Http.Payload>(
    url: Http.V1Url,
    payload: P = {} as P,
    options: Http.RequestOptions = {}
  ): Promise<AxiosResponse<T>> => {
    url = this._prepare_url(url, {}, HttpRequestMethods.POST);
    return this.instance.post(url, payload, {
      cancelToken: options.cancelToken || undefined,
      headers: options.headers
    });
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
  patch = async <T, P extends Http.Payload = Http.Payload>(
    url: Http.V1Url,
    payload: Partial<P> = {} as P,
    options: Http.RequestOptions = {}
  ): Promise<T> => {
    return this.request(HttpRequestMethods.PATCH, url, {}, payload, options);
  };
}

export const client = new ApiClient(authenticatedInstance);
export const unauthenticatedClient = new ApiClient(unauthenticatedInstance);
export const tokenClient = new ApiClient(tokenValidationInstance);

export default client;
