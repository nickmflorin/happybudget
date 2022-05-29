import urljoin from "url-join";
import { map } from "lodash";

import { client } from "api";

export const URL = {
  v1: (...args: Http.PathParams): Http.V1Url => {
    return urljoin("v1", ...map(args, (arg: string | number) => String(arg)), "/") as Http.V1Url;
  }
};

export const postService =
  <P extends Http.Payload, R>(path: Http.PathParams): Http.PostService<R, P> =>
  async (payload: P, options?: Http.RequestOptions | undefined): Promise<R> => {
    const url = URL.v1(...path);
    return client.post<R>(url, payload, options);
  };

export const patchService =
  <P extends Http.Payload, R>(path: Http.PathParams): Http.PatchService<R, P> =>
  async (payload: P, options?: Http.RequestOptions | undefined): Promise<R> => {
    const url = URL.v1(...path);
    return client.patch<R, P>(url, payload, options);
  };

export const deleteService =
  (path: Http.PathParams | ((id: number) => Http.PathParams)): Http.DeleteService =>
  async (id: number, options?: Http.RequestOptions | undefined): Promise<null> => {
    const pt = typeof path === "function" ? path(id) : path;
    const url = URL.v1(...pt);
    return client.delete<null>(url, options);
  };

export const detailPostService =
  <P extends Http.Payload, R>(
    path: Http.PathParams | ((id: number) => Http.PathParams)
  ): Http.DetailPostService<R, P> =>
  async (id: number, payload: P, options?: Http.RequestOptions | undefined): Promise<R> => {
    const pt = typeof path === "function" ? path(id) : path;
    const url = URL.v1(...pt);
    return client.post<R>(url, payload, options);
  };

export const detailPatchService =
  <P extends Http.Payload, R>(
    path: Http.PathParams | ((id: number) => Http.PathParams)
  ): Http.DetailPatchService<R, P> =>
  async (id: number, payload: P, options?: Http.RequestOptions | undefined): Promise<R> => {
    const pt = typeof path === "function" ? path(id) : path;
    const url = URL.v1(...pt);
    return client.patch<R, P>(url, payload, options);
  };

export const detailDeleteService =
  (path: Http.PathParams | ((id: number, objId: number) => Http.PathParams)): Http.DetailDeleteService =>
  async (id: number, objId: number, options?: Http.RequestOptions | undefined): Promise<null> => {
    const pt = typeof path === "function" ? path(id, objId) : path;
    const url = URL.v1(...pt);
    return client.delete<null>(url, options);
  };

export const retrieveService =
  <R extends Model.HttpModel>(path: Http.PathParams | ((id: number) => Http.PathParams)): Http.RetrieveService<R> =>
  async (id: number, options?: Http.RequestOptions | undefined): Promise<R> => {
    const pt = typeof path === "function" ? path(id) : path;
    const url = URL.v1(...pt);
    return client.retrieve<R>(url, options);
  };

export const listService =
  <R>(path: Http.PathParams): Http.ListService<R> =>
  async (query?: Http.ListQuery, options?: Http.RequestOptions | undefined): Promise<Http.ListResponse<R>> => {
    const url = URL.v1(...path);
    return client.list<R>(url, query, options);
  };

export const detailListService =
  <R>(path: Http.PathParams | ((id: number) => Http.PathParams)): Http.DetailListService<R> =>
  async (
    id: number,
    query?: Http.ListQuery | undefined,
    options?: Http.RequestOptions | undefined
  ): Promise<Http.ListResponse<R>> => {
    const pt = typeof path === "function" ? path(id) : path;
    const url = URL.v1(...pt);
    return client.list<R>(url, query, options);
  };

export const bulkCreateService = <P extends Http.PayloadObj, R>(
  path: Http.PathParams
): Http.PatchService<R, Http.BulkCreatePayload<P>> => patchService<Http.BulkCreatePayload<P>, R>(path);

export const bulkUpdateService = <P extends Http.PayloadObj, R>(
  path: Http.PathParams
): Http.PatchService<R, Http.BulkUpdatePayload<P>> => patchService<Http.BulkUpdatePayload<P>, R>(path);

export const bulkDeleteService = <R>(path: Http.PathParams): Http.PatchService<R, Http.BulkDeletePayload> =>
  patchService<Http.BulkDeletePayload, R>(path);

export const detailBulkCreateService = <P extends Http.PayloadObj, R>(
  path: Http.PathParams | ((id: number) => Http.PathParams)
): Http.DetailPatchService<R, Http.BulkCreatePayload<P>> => detailPatchService<Http.BulkCreatePayload<P>, R>(path);

export const detailBulkUpdateService = <P extends Http.PayloadObj, R>(
  path: Http.PathParams | ((id: number) => Http.PathParams)
): Http.DetailPatchService<R, Http.BulkUpdatePayload<P>> => detailPatchService<Http.BulkUpdatePayload<P>, R>(path);

export const detailBulkDeleteService = <R>(
  path: Http.PathParams | ((id: number) => Http.PathParams)
): Http.DetailPatchService<R, Http.BulkDeletePayload> => detailPatchService<Http.BulkDeletePayload, R>(path);
