import { useRef, useCallback, useEffect } from "react";
import { isEqual } from "lodash";

export * from "./ui";
export * from "./tagging";

export const useDynamicCallback = <T = any>(callback: (...args: any[]) => T) => {
  const ref = useRef<any>();
  ref.current = callback;
  const func: (...args: any[]) => T = (...args: any[]) => ref.current.apply(this, args);
  return useCallback(func, []);
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
