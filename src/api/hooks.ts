import { useRef, useEffect, useCallback } from "react";
import axios, { CancelTokenSource, CancelToken, Canceler } from "axios";
import { isNil } from "lodash";

const DefaultCanceler: Canceler = () => {};

interface UseCancelTokenConfig {
  readonly createOnInit?: boolean;
  readonly preserve?: boolean;
}

export const useCancelToken = (config?: UseCancelTokenConfig): [() => CancelToken, Canceler] => {
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

  return [newCancelToken, axiosCanceler.current];
};
