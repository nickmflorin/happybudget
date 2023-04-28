import pino, { LoggerOptions } from "pino";

import * as types from "./types";
import { isolateVariableFromHotReload } from "./util";

const LOG_LEVEL = types.toLogLevel(process.env.NEXT_PUBLIC_LOG_LEVEL || "info");
const PRETTY_LOG =
  process.env.PRETTY_LOG !== undefined && process.env.PRETTY_LOG.toLowerCase() === "true";

export const initializeLogger = () => {
  const productionEnv = process.env.NEXT_PUBLIC_PRODUCTION_ENV;
  if (
    productionEnv === undefined ||
    ![
      types.ProductionEnvironments.APP,
      types.ProductionEnvironments.DEV,
      types.ProductionEnvironments.LOCAL,
    ].includes(productionEnv as types.ProductionEnvironment)
  ) {
    throw new TypeError(
      `Detected invalid value '${productionEnv}' for NEXT_PUBLIC_PRODUCTION_ENV.`,
    );
  }
  const application = process.env.npm_package_name;
  if (application === undefined && typeof window === "undefined") {
    throw new TypeError(`Detected invalid value '${application}' for npm_package_name.`);
  }

  const pinoConfig: LoggerOptions = {
    level: LOG_LEVEL,
    browser: { asObject: true },
    mixin() {
      return {
        application: application || "application-name-not-available",
        productionEnv,
      };
    },
  };

  let _LOGGER = pino(pinoConfig);
  if (PRETTY_LOG && typeof window === "undefined") {
    /* eslint-disable-next-line @typescript-eslint/no-var-requires */
    const pretty = require("pino-pretty");
    _LOGGER = pino(
      pinoConfig,
      pretty({
        colorize: true,
      }),
    );
  }

  return Object.assign(_LOGGER, {
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
      params: types.InconsistentReduxStateErrorParams<A, P> | types.LogMessageContext,
      additionalContext?: string | types.LogMessageContext,
      message?: string,
    ) {
      /* eslint-disable-next-line @typescript-eslint/no-var-requires */
      const { toSentence } = require("lib/util/formatters/formal");

      let updatedContext =
        typeof additionalContext === "string" || typeof additionalContext === "undefined"
          ? {}
          : { ...additionalContext };

      const isAction = (v: types.LogContextValue | A | undefined): v is Exclude<A, string> =>
        typeof v === "object" && v !== null && (v as Exclude<A, string>).type !== undefined;

      const isPayload = (v: types.LogContextValue | P | undefined): v is P =>
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
  }) as types.Logger;
};

export const logger = isolateVariableFromHotReload("logger", initializeLogger);
