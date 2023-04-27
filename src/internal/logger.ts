import pino, { LoggerOptions } from "pino";
import pretty from "pino-pretty";
import { ulid } from "ulid";

export enum ProductionEnvironments {
  APP = "app",
  DEV = "dev",
  LOCAL = "local",
}

type ProductionEnvironment = typeof ProductionEnvironments[keyof typeof ProductionEnvironments];

type LogContextValue = Exclude<import("lib/schemas").JsonLiteral, ArrayBuffer>;

export type LogMessageContext = Record<string, LogContextValue>;

// The `instanceId` is used to correlate logs in a high concurrency environment.
const instanceId = ulid();

const productionEnv = process.env.NEXT_PUBLIC_PRODUCTION_ENV;
if (
  productionEnv === undefined ||
  ![ProductionEnvironments.APP, ProductionEnvironments.DEV, ProductionEnvironments.LOCAL].includes(
    productionEnv as ProductionEnvironment,
  )
) {
  throw new TypeError(`Detected invalid value '${productionEnv}' for NEXT_PUBLIC_PRODUCTION_ENV.`);
}

const application = process.env.npm_package_name;
if (application === undefined && typeof window === "undefined") {
  throw new TypeError(`Detected invalid value '${application}' for npm_package_name.`);
}

const pinoConfig: LoggerOptions = {
  mixin() {
    return {
      application: application || "application-name-not-available",
      instanceId,
      productionEnv,
    };
  },
};
let _LOGGER = pino(pinoConfig);
if (process.env.PRETTY_LOG !== undefined && process.env.PRETTY_LOG.toLowerCase() === "true") {
  _LOGGER = pino(
    pinoConfig,
    pretty({
      colorize: true,
    }),
  );
}

type InconsistentReduxStateErrorParams<
  A extends import("application/store/types/actions").BasicAction<P> | string,
  P,
> = {
  readonly action?: A;
  readonly payload?: P;
};

export type Logger = typeof _LOGGER & {
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

const LOGGER = Object.assign(_LOGGER, {
  applicationError(
    error: import("application/errors/errors/base").ApplicationError,
    message?: string,
  ) {
    // The error message will be in the context regardless.
    _LOGGER.error({ ...error.logContext }, message || error.message);
  },
  requestError(error: import("application/errors/errors/http").HttpError, message?: string) {
    // The error message will be in the context regardless.
    _LOGGER.error({ ...error.logContext }, message || error.message);
  },
  inconsistentReduxStateError<
    A extends import("application/store/types/actions").BasicAction<P> | string,
    P,
  >(
    params: InconsistentReduxStateErrorParams<A, P> | LogMessageContext,
    additionalContext?: string | LogMessageContext,
    message?: string,
  ) {
    /* eslint-disable-next-line @typescript-eslint/no-var-requires */
    const { toSentence } = require("lib/util/formatters/formal");

    let updatedContext =
      typeof additionalContext === "string" || typeof additionalContext === "undefined"
        ? {}
        : { ...additionalContext };

    const isAction = (v: LogContextValue | A | undefined): v is Exclude<A, string> =>
      typeof v === "object" && v !== null && (v as Exclude<A, string>).type !== undefined;

    const isPayload = (v: LogContextValue | P | undefined): v is P =>
      typeof v === "object" && v !== null;

    updatedContext =
      typeof params.action === "string"
        ? { ...updatedContext, action: params.action }
        : isAction(params.action)
        ? { ...updatedContext, action: params.action.type }
        : updatedContext;

    updatedContext = isPayload(params.payload)
      ? { ...updatedContext, payload: JSON.stringify(params.payload) }
      : isAction(params.action)
      ? { ...updatedContext, payload: JSON.stringify(params.action.payload) }
      : updatedContext;

    let updatedMessage = typeof additionalContext === "string" ? additionalContext : message;
    updatedMessage =
      updatedMessage !== undefined
        ? `Inconsistent State: ${toSentence(updatedMessage)}`
        : "Inconsistent State";

    _LOGGER.warn(updatedContext, updatedMessage);
  },
}) as Logger;

export default LOGGER;
