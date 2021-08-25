import { useRef, useCallback, useEffect } from "react";
import { dequal as deepEqual } from "dequal";
import { isEqual } from "lodash";

var equal = require("fast-deep-equal/es6");

type UseEffectParams = Parameters<typeof useEffect>;
type EffectCallback = UseEffectParams[0];
type DependencyList = UseEffectParams[1];
type UseEffectReturn = ReturnType<typeof useEffect>;

export const useDynamicCallback = <T = any>(callback: (...args: any[]) => T) => {
  const ref = useRef<any>();
  ref.current = callback;
  const func: (...args: any[]) => T = (...args: any[]) => ref.current.apply(this, args);
  return useCallback(func, []);
};

export type DeepEqualCheck = "lodash" | "dequal" | "fast";

export const deepCompare = (a: any, b: any, method?: DeepEqualCheck) => {
  method = method || "lodash";
  return {
    lodash: isEqual,
    dequal: deepEqual,
    fast: equal
  }[method](a, b);
};

export const useDeepEqualMemoDeps = (value: DependencyList, method?: DeepEqualCheck) => {
  const ref = useRef<DependencyList>();
  const signalRef = useRef<number>(0);
  if (!deepCompare(value, ref.current, method || "dequal")) {
    ref.current = value;
    signalRef.current += 1;
  }
  return [signalRef.current];
};

export const useDeepEqualEffect = (callback: EffectCallback, dependencies: DependencyList): UseEffectReturn => {
  return useEffect(callback, useDeepEqualMemoDeps(dependencies));
};

export function useDeepEqualMemo<T>(value: T, method?: DeepEqualCheck) {
  const ref = useRef<T | undefined>(undefined);
  const signalRef = useRef<number>(0);

  if (!deepCompare(ref.current, value, method)) {
    ref.current = value;
    signalRef.current += 1;
  }
  return signalRef.current;
}

export function usePrevious<T>(value: T) {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}
