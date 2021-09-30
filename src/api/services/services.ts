import urljoin from "url-join";
import { map } from "lodash";

import { client } from "api";

export const URL = {
  v1: (...args: Http.PathParams): Http.V1Url => {
    return urljoin("v1", ...map(args, (arg: string | number) => String(arg)), "/") as Http.V1Url;
  }
};

export const postService = <P extends Http.Payload, R>(path: Http.PathParams) => {
  return async (payload: P, options: Http.RequestOptions = {}): Promise<R> => {
    const url = URL.v1(...path);
    return client.post<R>(url, payload, options);
  };
};

export const patchService = <P extends Http.Payload, R>(path: Http.PathParams) => {
  return async (payload: P, options: Http.RequestOptions = {}): Promise<R> => {
    const url = URL.v1(...path);
    return client.patch<R>(url, payload, options);
  };
};

export const detailPostService = <P extends Http.Payload, R>(
  path: Http.PathParams | ((id: number) => Http.PathParams)
) => {
  return async (id: number, payload: P, options: Http.RequestOptions = {}): Promise<R> => {
    path = typeof path === "function" ? path(id) : path;
    const url = URL.v1(...path);
    return client.post<R>(url, payload, options);
  };
};

export const detailPatchService = <P extends Http.Payload, R>(
  path: Http.PathParams | ((id: number) => Http.PathParams)
) => {
  return async (id: number, payload: Partial<P>, options: Http.RequestOptions = {}): Promise<R> => {
    path = typeof path === "function" ? path(id) : path;
    const url = URL.v1(...path);
    return client.patch<R>(url, payload, options);
  };
};

export const retrieveService = <M extends Model.HttpModel>(
  path: Http.PathParams | ((id: number) => Http.PathParams)
) => {
  return async (id: number, options: Http.RequestOptions = {}): Promise<M> => {
    path = typeof path === "function" ? path(id) : path;
    const url = URL.v1(...path);
    return client.retrieve<M>(url, options);
  };
};

export const listService = <M extends Model.HttpModel>(path: Http.PathParams | ((id: number) => Http.PathParams)) => {
  return async (
    id: number,
    query: Http.ListQuery = {},
    options: Http.RequestOptions = {}
  ): Promise<Http.ListResponse<M>> => {
    path = typeof path === "function" ? path(id) : path;
    const url = URL.v1(...path);
    return client.list<M>(url, query, options);
  };
};
