import { useRef, useEffect, useCallback, useState } from "react";
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

export type ModelHookOptions<M extends Model.Model> = {
  readonly onModelLoaded?: (m: M) => void;
  readonly conditional?: () => boolean;
  readonly getToken?: null | (() => CancelToken);
};

export const useModel = <M extends Model.Model>(
  id: number,
  options: ModelHookOptions<M> & {
    readonly request: (i: number, opts?: Http.RequestOptions) => Promise<M>;
  }
): [M | null, boolean, Error | null] => {
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState<M | null>(null);

  useEffect(() => {
    if (isNil(options?.conditional) || options?.conditional() === true) {
      setLoading(true);
      options
        .request(id, { cancelToken: options.getToken?.() })
        .then((response: M) => {
          setModel(response);
          options?.onModelLoaded?.(response);
        })
        .catch((e: Error) => {
          setError(e);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, []);

  return [model, loading, error];
};

export const useMarkup = (
  id: number,
  options?: ModelHookOptions<Model.Markup>
): [Model.Markup | null, boolean, Error | null] => {
  return useModel(id, { ...options, request: services.getMarkup });
};

export const useGroup = (
  id: number,
  options?: ModelHookOptions<Model.Group>
): [Model.Group | null, boolean, Error | null] => {
  return useModel(id, { ...options, request: services.getGroup });
};

export const useContact = (
  id: number,
  options?: ModelHookOptions<Model.Contact>
): [Model.Contact | null, boolean, Error | null] => {
  return useModel(id, { ...options, request: services.getContact });
};

export const useGroupColors = (): [string[], boolean, Error | null] => {
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const [colors, setColors] = useState<string[]>([]);

  useEffect(() => {
    setLoading(true);
    services
      .getGroupColors()
      .then((response: Http.ListResponse<string>) => {
        setColors(response.data);
      })
      .catch((e: Error) => {
        setError(e);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return [colors, loading, error];
};

export const useFringeColors = (): [string[], boolean, Error | null] => {
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const [colors, setColors] = useState<string[]>([]);

  useEffect(() => {
    setLoading(true);
    services
      .getFringeColors()
      .then((response: Http.ListResponse<string>) => {
        setColors(response.data);
      })
      .catch((e: Error) => {
        setError(e);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return [colors, loading, error];
};
