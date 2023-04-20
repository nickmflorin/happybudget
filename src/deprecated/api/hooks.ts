import * as api from "api";
import { CancelToken } from "axios";

import { http } from "lib";

import { useModel, ModelHookOptions } from "../lib/model/hooks";

export const useMarkup = (
  id: number,
  options?: Omit<ModelHookOptions<Model.Markup>, "request">,
): [Model.Markup | null, boolean, Error | null] =>
  useModel(id, { ...options, request: api.getMarkup });

export const useGroup = (
  id: number,
  options?: Omit<ModelHookOptions<Model.Group>, "request">,
): [Model.Group | null, boolean, Error | null] =>
  useModel(id, { ...options, request: api.getGroup });

export const useGroupColors = (
  options?: Omit<http.ApiHookOptions<Http.ApiListResponse<string>>, "request">,
): [string[], boolean, Error | null] => {
  const [response, error, loading] = http.useApiHook({
    ...options,
    request: (token: CancelToken | undefined) => api.getGroupColors({}, { cancelToken: token }),
  });
  return [response !== null ? response.data : [], error, loading];
};

export const useFringeColors = (
  options?: Omit<http.ApiHookOptions<Http.ApiListResponse<string>>, "request">,
): [string[], boolean, Error | null] => {
  const [response, error, loading] = http.useApiHook({
    ...options,
    request: (token: CancelToken | undefined) => api.getFringeColors({}, { cancelToken: token }),
  });
  return [response !== null ? response.data : [], error, loading];
};

import * as api from "api";

import { useModel, ModelHookOptions } from "../hooks";

export const useContact = (
  id: number,
  options?: Omit<ModelHookOptions<Model.Contact>, "request">,
): [Model.Contact | null, boolean, Error | null] =>
  useModel(id, { ...options, request: api.getContact });
