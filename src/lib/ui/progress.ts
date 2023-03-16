import { useReducer, useEffect, useMemo, useRef } from "react";

import { isNil, includes } from "lodash";

type ProgressState = {
  readonly dampened: number;
  readonly actual: number;
  readonly progress: number;
  readonly active: boolean;
};

const InitialProgressState: ProgressState = {
  dampened: 0.0,
  actual: 0.0,
  progress: 0.0,
  active: false,
};

type ProgressActionType = "INCREMENT_ACTUAL" | "INCREMENT_DAMPENED" | "CANCEL";

type IProgressAction<T extends ProgressActionType, P = null> = {
  readonly type: T;
  readonly payload: P;
};

type ProgressIncrementAction = IProgressAction<
  "INCREMENT_ACTUAL",
  {
    readonly value: number;
    readonly total: number;
  }
>;

type ProgressAction =
  | ProgressIncrementAction
  | IProgressAction<"CANCEL">
  | IProgressAction<"INCREMENT_DAMPENED">;

type ProgressReducerConfig = {
  readonly rate: number;
};

const createProgressReducer = (config: ProgressReducerConfig) => {
  if (config.rate >= 1.0 || config.rate < 0.0) {
    throw new Error("Dampened progress rate must be a positive number < 1.0.");
  }
  const progressReducer = (
    state: ProgressState = InitialProgressState,
    action: ProgressAction,
  ): ProgressState => {
    if (includes(["INCREMENT_ACTUAL", "INCREMENT_DAMPENED"], action.type)) {
      let { actual, progress, dampened }: ProgressState = { ...state };
      if (action.type === "INCREMENT_ACTUAL") {
        actual = Math.min(...[action.payload.value / action.payload.total, 1.0]);
      } else if (action.type === "INCREMENT_DAMPENED") {
        dampened = Math.min(...[dampened + config.rate, 1.0]);
      } else if (action.type === "CANCEL") {
        return InitialProgressState;
      }
      progress = Math.min(dampened, actual);
      return { ...state, dampened, actual, progress, active: progress !== 1.0 && progress !== 0.0 };
    }
    return state;
  };
  return progressReducer;
};

type UseDampenedProgressConfig = {
  readonly dampenedRate?: number;
  readonly perMilliseconds?: number;
};

type UseDampenedProgressReturnType = [
  number,
  boolean,
  (value: number, total: number) => void,
  () => void,
];

export const useDampenedProgress = (
  config?: UseDampenedProgressConfig,
): UseDampenedProgressReturnType => {
  const progressReducer = createProgressReducer({ rate: config?.dampenedRate || 0.05 });
  const [state, dispatch] = useReducer(progressReducer, InitialProgressState);
  const interval = useRef<number | undefined>(undefined);

  const progress = useMemo(
    () => (value: number, total: number) => {
      if (state.active === false) {
        dispatch({ type: "INCREMENT_DAMPENED", payload: null });
      }
      dispatch({ type: "INCREMENT_ACTUAL", payload: { value, total } });
    },
    [state.active],
  );

  const cancel = useMemo(
    () => () => {
      if (!isNil(interval.current)) {
        clearInterval(interval.current);
      }
    },
    [interval.current],
  );

  useEffect(() => {
    if (state.active === true) {
      interval.current = window.setInterval(() => {
        dispatch({ type: "INCREMENT_DAMPENED", payload: null });
      }, config?.perMilliseconds || 100);
      return () => clearInterval(interval.current);
    }
  }, [state.active]);

  return [state.progress, state.active, progress, cancel];
};
