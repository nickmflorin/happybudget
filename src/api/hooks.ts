import { useRef, useEffect, useCallback } from "react";
import axios, { CancelTokenSource, CancelToken, Canceler } from "axios";

export const useCancelToken = (): (() => CancelToken) => {
  const axiosSource = useRef<CancelTokenSource | null>(null);

  const newCancelToken = useCallback(() => {
    axiosSource.current = axios.CancelToken.source();
    return axiosSource.current.token;
  }, []);

  useEffect(
    () => () => {
      axiosSource.current?.cancel();
    },
    []
  );

  return newCancelToken;
};

export const useCancel = (): [CancelToken | null, Canceler | null] => {
  const axiosToken = useRef<CancelToken | null>(null);
  const axiosCanceler = useRef<Canceler | null>(null);

  useEffect(() => {
    axiosToken.current = new axios.CancelToken((cancel: Canceler) => (axiosCanceler.current = cancel));
    return () => {
      axiosCanceler.current?.();
    };
  }, []);

  return [axiosToken.current, axiosCanceler.current];
};
