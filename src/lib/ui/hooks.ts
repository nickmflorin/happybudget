import { useState, useEffect, useRef, useMemo } from "react";

import { isEqual } from "lodash";
import { useMediaQuery } from "react-responsive";

import { constants } from "style";

const createRootElement = (id: string | number): HTMLElement => {
  const rootContainer = document.createElement("div");
  rootContainer.setAttribute("id", String(id));
  return rootContainer;
};

export const useLessThanBreakpoint = (id: constants.BreakpointId): boolean =>
  useMediaQuery({ query: `(max-width: ${constants.breakpoints[id]}px)` });

export const useGreaterThanBreakpoint = (id: constants.BreakpointId): boolean =>
  useMediaQuery({ query: `(min-width: ${constants.breakpoints[id]}px)` });

export const usePortal = (id: string | number | undefined): Element | null => {
  const [parent, setParent] = useState<Element | null>(null);

  useEffect(() => {
    if (id !== undefined) {
      const existingParent = document.querySelector(`#${id}`);
      const parentElem = existingParent || createRootElement(id);
      setParent(parentElem);
    }
  }, [id]);

  return parent;
};

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
type Comparator = (a: any, b: any) => boolean;

/**
 * A hook that returns a value of type {@link number} that increments each time the provided value,
 * {@link T}, changes - where a change is determined by a comparison function {@link Comparator}
 * that can be provided to the hook.
 */
export function useComparedValueRef<T>(value: T, comparator?: Comparator) {
  const ref = useRef<T | undefined>(undefined);
  const signalRef = useRef<number>(0);

  comparator = comparator || isEqual;
  if (!comparator(ref.current, value)) {
    ref.current = value;
    signalRef.current += 1;
  }
  return signalRef.current;
}

/**
 * A variation of React's `useMemo` hook that performs a deep comparison rather than a value
 * comparison when determining if a value has changed.
 */
export const useDeepEqualMemo = <T>(
  callback: Parameters<typeof useMemo<T>>[0],
  dependencies: Parameters<typeof useMemo<T>>[1],
) => useMemo<T>(callback, [callback, useComparedValueRef(dependencies, isEqual)]);
