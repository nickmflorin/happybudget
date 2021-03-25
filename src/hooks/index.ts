import { useRef, useCallback, useEffect } from "react";
import { isEqual } from "lodash";

export * from "./ui";

export const useDynamicCallback = (callback: any) => {
  const ref = useRef<any>();
  ref.current = callback;
  return useCallback((...args) => ref.current.apply(this, args), []);
};

export function useDeepEqualMemo<T>(value: T) {
  const ref = useRef<T | undefined>(undefined);
  if (!isEqual(ref.current, value)) {
    ref.current = value;
  }
  return ref.current;
}

export function usePrevious<T>(value: T) {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}
