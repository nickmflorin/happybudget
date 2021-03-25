import { useRef, useCallback } from "react";

export * from "./ui";

export const useDynamicCallback = (callback: any) => {
  const ref = useRef<any>();
  ref.current = callback;
  return useCallback((...args) => ref.current.apply(this, args), []);
};
