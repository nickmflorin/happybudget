import { useReducer, useEffect, useMemo, useRef } from "react";

import { enumeratedLiterals, EnumeratedLiteralType } from "../util";

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

const ProgressActionTypes = enumeratedLiterals([
  "increment_actual",
  "increment_dampened",
  "cancel",
] as const);
type ProgressActionType = EnumeratedLiteralType<typeof ProgressActionTypes>;

type IProgressAction<T extends ProgressActionType, P = null> = {
  readonly type: T;
  readonly payload: P;
};

type ProgressIncrementAction = IProgressAction<
  "increment_actual",
  {
    readonly value: number;
    readonly total: number;
  }
>;

type ProgressAction =
  | ProgressIncrementAction
  | IProgressAction<"cancel">
  | IProgressAction<"increment_dampened">;

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
    let { actual, progress, dampened }: ProgressState = { ...state };
    switch (action.type) {
      case ProgressActionTypes.INCREMENT_ACTUAL:
        actual = Math.min(...[action.payload.value / action.payload.total, 1.0]);
        break;
      case ProgressActionTypes.INCREMENT_DAMPENED:
        dampened = Math.min(...[dampened + config.rate, 1.0]);
        break;
      case ProgressActionTypes.CANCEL:
        return InitialProgressState;
      default:
        throw new Error("This should never happen!");
    }
    progress = Math.min(dampened, actual);
    return { ...state, dampened, actual, progress, active: progress !== 1.0 && progress !== 0.0 };
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
        dispatch({ type: ProgressActionTypes.INCREMENT_DAMPENED, payload: null });
      }
      dispatch({ type: ProgressActionTypes.INCREMENT_ACTUAL, payload: { value, total } });
    },
    [state.active],
  );

  const cancel = useMemo(
    () => () => {
      if (interval.current !== undefined) {
        clearInterval(interval.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (state.active === true) {
      interval.current = window.setInterval(() => {
        dispatch({ type: ProgressActionTypes.INCREMENT_DAMPENED, payload: null });
      }, config?.perMilliseconds || 100);
      return () => clearInterval(interval.current);
    }
  }, [state.active, config?.perMilliseconds]);

  return [state.progress, state.active, progress, cancel];
};
