import { useRef, useEffect, useCallback } from "react";
import axios, { CancelTokenSource, CancelToken } from "axios";

export const useCancelToken = (): (() => CancelToken) => {
  const axiosSource = useRef<CancelTokenSource | null>(null);

  const newCancelToken = useCallback(() => {
    axiosSource.current = axios.CancelToken.source();
    return axiosSource.current.token;
  }, []);

  useEffect(() => () => axiosSource.current?.cancel(), []);

  return newCancelToken;
};
