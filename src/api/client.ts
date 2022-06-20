import axios, { AxiosInstance, AxiosResponse } from "axios";
import { isNil } from "lodash";

import * as config from "config";
import { http } from "lib";

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
  baseURL: config.env.API_DOMAIN,
  withCredentials: true
});

export const tokenValidationInstance = axios.create({
  baseURL: config.env.API_DOMAIN,
  withCredentials: true
});

export const unauthenticatedInstance = axios.create({
  baseURL: config.env.API_DOMAIN,
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
    method:
      | HttpRequestMethods.POST
      | HttpRequestMethods.GET
      | HttpRequestMethods.PUT
      | HttpRequestMethods.DELETE
      | HttpRequestMethods.PATCH,
    query?: Http.ListQuery | undefined
  ): Http.V1Url => {
    if (method === HttpRequestMethods.GET) {
      if (!isNil(query)) {
        const { ordering, ...rest } = query;
        let rawQuery: Http.RawQuery = { ...rest };
        // Convert Ordering to String if Present
        if (method === HttpRequestMethods.GET && !isNil(ordering)) {
          rawQuery = { ...rawQuery, ordering: http.convertOrderingQueryToString(ordering) };
        }
        url = http.addQueryParamsToUrl(url, rawQuery, { filter: [""] }) as Http.V1Url;
      }
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
    query?: Http.ListQuery | undefined,
    payload?: Partial<Http.Payload> | undefined,
    options?: Http.RequestOptions | undefined
  ): Promise<T> => {
    const lookup = {
      [HttpRequestMethods.POST]: this.instance.post.bind(ApiClient),
      [HttpRequestMethods.GET]: this.instance.get.bind(ApiClient),
      [HttpRequestMethods.PUT]: this.instance.put.bind(ApiClient),
      [HttpRequestMethods.DELETE]: this.instance.delete.bind(ApiClient),
      [HttpRequestMethods.PATCH]: this.instance.patch.bind(ApiClient)
    };
    url = this._prepare_url(url, method, query);
    let response: AxiosResponse<T>;
    let headers: { [key: string]: string } = {};

    options = options || {};
    if (!isNil(options.publicTokenId)) {
      headers = { ...headers, "X-PublicToken": options.publicTokenId };
    }
    if (method === HttpRequestMethods.GET || method === HttpRequestMethods.DELETE) {
      response = await lookup[method](url, { cancelToken: options.cancelToken, timeout: options.timeout, headers });
    } else {
      const _payload = payload || {};
      response = await lookup[method](url, apiUtil.filterPayload<typeof _payload>(_payload), {
        cancelToken: options.cancelToken,
        timeout: options.timeout,
        headers
      });
    }
    return response.data;
  };

  /**
   * Submits a GET request to the provided URL.
   *
   * @param url     The URL to send the POST request.
   * @param query   The query parameters to embed in the URL.
   * @param options The options for the request (see IRequestOptions).
   */
  get = async <T>(url: Http.V1Url, query?: Http.ListQuery, options?: Http.RequestOptions): Promise<T> => {
    return this.request<T>(HttpRequestMethods.GET, url, query, {}, options);
  };

  /**
   * Submits a GET request to the provided URL to retrieve a specific resource
   * at it's detail endpoint.
   *
   * @param url     The URL to send the POST request.
   * @param options The options for the request (see IRequestOptions).
   */
  retrieve = async <T extends Model.HttpModel>(url: Http.V1Url, options?: Http.RequestOptions): Promise<T> => {
    return this.request<Http.DetailResponse<T>>(HttpRequestMethods.GET, url, {}, {}, options);
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
    query?: Http.ListQuery,
    options?: Http.RequestOptions
  ): Promise<Http.ListResponse<T>> => {
    return this.request<Http.RawListResponse<T>>(HttpRequestMethods.GET, url, query, {}, options).then(
      // Include the query used to make the request in the response.
      (rsp: Http.RawListResponse<T>) => ({ data: rsp.data, count: rsp.count, query: query || {} })
    );
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
    payload?: P,
    options?: Http.RequestOptions
  ): Promise<T> => {
    return this.request<T>(HttpRequestMethods.POST, url, {}, payload, options);
  };

  upload = async <T, P extends Http.Payload = Http.Payload>(
    url: Http.V1Url,
    payload?: P,
    options?: Http.RequestOptions
  ): Promise<AxiosResponse<T>> => {
    url = this._prepare_url(url, HttpRequestMethods.POST);
    return this.instance.post(url, payload, options);
  };

  /**
   * Sends a DELETE request to the provided URL.
   *
   * @param url        The URL to send the DELETE request.
   * @param payload    The JSON body of the request.
   * @param options    The options for the request (see IRequestOptions).
   */
  delete = async <T>(url: Http.V1Url, options?: Http.RequestOptions): Promise<T> => {
    return this.request<T>(HttpRequestMethods.DELETE, url, {}, {}, options);
  };

  /**
   * Sends a PATCH request to the provided URL.
   *
   * @param url        The URL to send the PATCH request.
   * @param payload    The JSON body of the request.
   * @param options    The options for the request (see IRequestOptions).
   */
  patch = async <T, P extends Partial<Http.Payload> = Partial<Http.Payload>>(
    url: Http.V1Url,
    payload?: P,
    options?: Http.RequestOptions
  ): Promise<T> => {
    return this.request(HttpRequestMethods.PATCH, url, {}, payload, options);
  };
}

export const client = new ApiClient(authenticatedInstance);
export const unauthenticatedClient = new ApiClient(unauthenticatedInstance);
export const tokenClient = new ApiClient(tokenValidationInstance);

export default client;
