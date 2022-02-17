import { useRef, useEffect, useCallback, useState, useMemo } from "react";
import axios, { CancelTokenSource, CancelToken, Canceler } from "axios";
import { isNil } from "lodash";

import * as services from "./services";

/* eslint-disable @typescript-eslint/no-empty-function */
const DefaultCanceler: Canceler = () => {};

interface UseCancelTokenConfig {
  readonly createOnInit?: boolean;
  readonly preserve?: boolean;
}

export const useCancelToken = (config?: UseCancelTokenConfig): [() => CancelToken] => {
  const axiosSource = useRef<CancelTokenSource | null>(null);
  const axiosCanceler = useRef<Canceler>(DefaultCanceler);

  const newCancelToken = useCallback(() => {
    if (config?.preserve === true && !isNil(axiosSource.current)) {
      return axiosSource.current.token;
    }
    axiosSource.current = axios.CancelToken.source();
    axiosCanceler.current = axiosSource.current.cancel;
    return axiosSource.current.token;
  }, []);

  useEffect(() => {
    if (config?.createOnInit === true) {
      newCancelToken();
    }
    return () => axiosCanceler.current?.();
  }, []);

  return [newCancelToken];
};

export type ApiHookOptions<RSP> = {
  readonly onLoading?: (v: boolean) => void;
  readonly onError?: (e: Error | null) => void;
  readonly getToken?: null | (() => CancelToken);
  readonly conditional?: () => boolean;
  readonly onResponse?: (r: RSP) => void;
  readonly request: (token: CancelToken | undefined) => Promise<RSP>;
};

export const useApiHook = <RSP>(options: ApiHookOptions<RSP>): [RSP | null, boolean, Error | null] => {
  const [error, _setError] = useState<Error | null>(null);
  const [loading, _setLoading] = useState(false);
  const [response, _setResponse] = useState<RSP | null>(null);

  const setLoading = useMemo(
    () => (v: boolean) => {
      _setLoading(v);
      options.onLoading?.(v);
    },
    []
  );

  const setError = useMemo(
    () => (e: Error | null) => {
      _setError(e);
      options.onError?.(e);
    },
    []
  );

  const setResponse = useMemo(
    () => (r: RSP) => {
      _setResponse(r);
      options.onResponse?.(r);
    },
    []
  );

  useEffect(() => {
    if (isNil(options?.conditional) || options?.conditional() === true) {
      setLoading(true);
      setError(null);
      options
        .request(options.getToken?.())
        .then((r: RSP) => setResponse(r))
        .catch((e: Error) => setError(e))
        .finally(() => setLoading(false));
    }
  }, []);

  return [response, loading, error];
};

type ModelHookOptions<M extends Model.Model> = Omit<ApiHookOptions<M>, "request"> & {
  readonly request: (i: number, opts?: Http.RequestOptions) => Promise<M>;
};

export const useModel = <M extends Model.Model>(
  id: number,
  options: ModelHookOptions<M>
): [M | null, boolean, Error | null] => {
  return useApiHook<M>({
    ...options,
    request: (token: CancelToken | undefined) => {
      const response = options.request(id, { cancelToken: token });
      return response;
    }
  });
};

export const useMarkup = (
  id: number,
  options?: Omit<ModelHookOptions<Model.Markup>, "request">
): [Model.Markup | null, boolean, Error | null] => {
  return useModel(id, { ...options, request: services.getMarkup });
};

export const useGroup = (
  id: number,
  options?: Omit<ModelHookOptions<Model.Group>, "request">
): [Model.Group | null, boolean, Error | null] => {
  return useModel(id, { ...options, request: services.getGroup });
};

export const useContact = (
  id: number,
  options?: Omit<ModelHookOptions<Model.Contact>, "request">
): [Model.Contact | null, boolean, Error | null] => {
  return useModel(id, { ...options, request: services.getContact });
};

export const useGroupColors = (
  options?: Omit<ApiHookOptions<Http.ListResponse<string>>, "request">
): [string[], boolean, Error | null] => {
  const [response, error, loading] = useApiHook({
    ...options,
    request: (token: CancelToken | undefined) => services.getGroupColors({}, { cancelToken: token })
  });
  return [response !== null ? response.data : [], error, loading];
};

export const useFringeColors = (
  options?: Omit<ApiHookOptions<Http.ListResponse<string>>, "request">
): [string[], boolean, Error | null] => {
  const [response, error, loading] = useApiHook({
    ...options,
    request: (token: CancelToken | undefined) => services.getFringeColors({}, { cancelToken: token })
  });
  return [response !== null ? response.data : [], error, loading];
};
