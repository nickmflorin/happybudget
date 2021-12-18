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
  return async (payload: Partial<P>, options: Http.RequestOptions = {}): Promise<R> => {
    const url = URL.v1(...path);
    return client.patch<R, P>(url, payload, options);
  };
};

export const detailPostService = <P extends Http.Payload, R>(
  path: Http.PathParams | ((id: number) => Http.PathParams)
) => {
  return async (id: number, payload: P, options: Http.RequestOptions = {}): Promise<R> => {
    const pt = typeof path === "function" ? path(id) : path;
    const url = URL.v1(...pt);
    return client.post<R>(url, payload, options);
  };
};

export const detailPatchService = <P extends Http.Payload, R>(
  path: Http.PathParams | ((id: number) => Http.PathParams)
) => {
  return async (id: number, payload: Partial<P>, options: Http.RequestOptions = {}): Promise<R> => {
    const pt = typeof path === "function" ? path(id) : path;
    const url = URL.v1(...pt);
    return client.patch<R, P>(url, payload, options);
  };
};

export const deleteService = (path: Http.PathParams | ((id: number) => Http.PathParams)) => {
  return async (id: number, options: Http.RequestOptions = {}): Promise<null> => {
    const pt = typeof path === "function" ? path(id) : path;
    const url = URL.v1(...pt);
    return client.delete<null>(url, options);
  };
};
export const detailDeleteService = (path: Http.PathParams | ((id: number, objId: number) => Http.PathParams)) => {
  return async (id: number, objId: number, options: Http.RequestOptions = {}): Promise<null> => {
    const pt = typeof path === "function" ? path(id, objId) : path;
    const url = URL.v1(...pt);
    return client.delete<null>(url, options);
  };
};

export const retrieveService = <M extends Model.HttpModel>(
  path: Http.PathParams | ((id: number) => Http.PathParams)
) => {
  return async (id: number, options: Http.RequestOptions = {}): Promise<M> => {
    const pt = typeof path === "function" ? path(id) : path;
    const url = URL.v1(...pt);
    return client.retrieve<M>(url, options);
  };
};

export const detailListService = <M extends Model.HttpModel>(
  path: Http.PathParams | ((id: number) => Http.PathParams)
) => {
  return async (
    id: number,
    query: Http.ListQuery = {},
    options: Http.RequestOptions = {}
  ): Promise<Http.ListResponse<M>> => {
    const pt = typeof path === "function" ? path(id) : path;
    const url = URL.v1(...pt);
    return client.list<M>(url, query, options);
  };
};

export const listService = <M extends Model.HttpModel>(path: Http.PathParams) => {
  return async (query: Http.ListQuery = {}, options: Http.RequestOptions = {}): Promise<Http.ListResponse<M>> => {
    const url = URL.v1(...path);
    return client.list<M>(url, query, options);
  };
};
