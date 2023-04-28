import { Logger as PinoLogger } from "pino";

export enum ProductionEnvironments {
  APP = "app",
  DEV = "dev",
  LOCAL = "local",
}

export type ProductionEnvironment =
  typeof ProductionEnvironments[keyof typeof ProductionEnvironments];

export type LogContextValue = Exclude<import("lib/schemas").JsonLiteral, ArrayBuffer>;

export type LogMessageContext = Record<string, LogContextValue>;

export type InconsistentReduxStateErrorParams<
  A extends import("application/store/types/actions").BasicAction<P> | string,
  P,
> = {
  readonly action?: A;
  readonly payload?: P;
};

export type LogLevel = "error" | "fatal" | "warn" | "info" | "debug" | "trace" | "silent";

export const toLogLevel = (value: string): LogLevel => {
  if (
    ["error", "fatal", "warn", "info", "debug", "trace", "silent"].includes(value.toLowerCase())
  ) {
    return value.toLowerCase() as LogLevel;
  }
  throw new TypeError(`Invalid log level ${value} detected.`);
};

export type Logger = PinoLogger & {
  readonly requestError: (
    error: import("application/errors/errors/http").HttpError,
    message?: string,
  ) => void;
  readonly applicationError: (
    error: import("application/errors/errors/base").ApplicationError,
    message?: string,
  ) => void;
  readonly inconsistentReduxStateError: <
    A extends import("application/store/types/actions").BasicAction<P> | string,
    P,
  >(
    params: InconsistentReduxStateErrorParams<A, P> | LogMessageContext,
    additionalContext?: string | LogMessageContext,
    message?: string,
  ) => void;
};
