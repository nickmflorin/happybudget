import { createLogWriter as createBrowserLogWriter } from "@roarr/browser-log-writer";
import { intersection } from "lodash";
import {
  Roarr as Logger,
  type MessageContext as RoarrMessageContext,
  type Message,
  type TransformMessageFunction,
} from "roarr";
import { ulid } from "ulid";

export enum ProductionEnvironments {
  APP = "app",
  DEV = "dev",
  LOCAL = "local",
}

type ProductionEnvironment = typeof ProductionEnvironments[keyof typeof ProductionEnvironments];

type LogContextValue =
  | Exclude<import("lib/schemas").JsonLiteral, ArrayBuffer>
  | typeof import("application/errors/errors").ApplicationError;

export type LogMessageContext = Record<string, LogContextValue>;

const RESTRICTED_LOG_CONTEXT = ["application", "environment", "productionEnv"] as const;

// The `instanceId` is used to correlate logs in a high concurrency environment.
const instanceId = ulid();

/* Only log to the browser console if the ENV variable is explicitly true and we are not in the
   server environment.  NEXT_PUBLIC_ROARR_BROWSER_LOG is exposed in both the server and in the
   browser, so if we do not ensure we are on the server then we will be incidentally overwriting
   ROARR.write to write to the browser when we are on the server.

	 To ensure we are not on the server, we can simply check if the window is defined.
	 */
if (process.env.NEXT_PUBLIC_ROARR_BROWSER_LOG === "true" && typeof window !== "undefined") {
  ROARR.write = createBrowserLogWriter();
  /* When using @roarr/browser-log-writer, roarr logging (which is turned off by default) is
     controlled by the value of `ROARR_LOG` in local storage - not an environment variable. */
  window.localStorage.setItem("ROARR_LOG", "true");
}

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

/**
 * A {@link TransformMessageFunction} that includes context attributes of instances of
 * {@link ApplicationError} that are embedded in the context provided to the log function.
 */
const messageContextErrorProcessor: TransformMessageFunction<LogMessageContext> = (
  message: Message<LogMessageContext>,
): Message<RoarrMessageContext> => {
  let jsonContext: RoarrMessageContext = {};

  /* eslint-disable-next-line @typescript-eslint/no-var-requires */
  const { ApplicationError } = require("application/errors/errors/base");

  /* Separate the log context keys that are not associated with instances of errors.ApplicationError
     from those that are. */
  const errors = Object.keys(message.context).reduce(
    (prev: typeof ApplicationError[], key: string): typeof ApplicationError[] => {
      const value: LogContextValue = message.context[key];

      if (value instanceof ApplicationError) {
        return [...prev, value];
      }
      jsonContext = {
        ...jsonContext,
        [key]: value as Exclude<LogContextValue, typeof ApplicationError>,
      };
      return prev;
    },
    [] as typeof ApplicationError[],
  );

  // If the message that was provided is an empty string, use the message from the error.
  if (errors.length !== 0 && message.message.trim() === "") {
    message = { ...message, message: errors[0].message };
  }

  return {
    ...message,
    // Add in the log context for each individual error instance in the original context.
    context: errors.reduce(
      (
        prev: RoarrMessageContext,
        e: import("application/errors/errors").ApplicationError,
      ): RoarrMessageContext => {
        const logContext = e.logContext;
        return Object.keys(logContext).reduce(
          (prev: RoarrMessageContext, key: string, index: number): RoarrMessageContext => {
            /* For the key of the context object for each error, we have to be concerned with the
               key overwriting an existing key of the log context, either from another error or from
               the base context provided to the log method.  To avoid data loss in logs, we prefix
               context keys for errors with randomly generated IDs in the case that the key is
               already in the context. */
            const errorKeyPrefix =
              errors.length > 1 ? `error-${index + 1}-${ulid()}_${key}` : `error-${ulid()}_${key}`;
            if (Object.keys(logContext).includes(key)) {
              return { ...prev, [errorKeyPrefix]: logContext[key] };
            }
            return { ...prev, [key]: logContext[key] };
          },
          prev,
        );
      },
      jsonContext,
    ),
  };
};

const _LOGGER = Logger.child<LogMessageContext>(messageContextErrorProcessor).child(message => {
  const inter = intersection(Object.keys(message.context), RESTRICTED_LOG_CONTEXT);
  if (inter.length > 0) {
    throw new TypeError(`The log context key(s) '${inter.join(", ")} are restricted.`);
  }
  return {
    ...message,
    context: {
      ...message.context,
      application: application || "application-name-not-available",
      instanceId,
      productionEnv,
    },
  };
});

type InconsistentReduxStateErrorParams<
  A extends import("application/store/types/actions").BasicAction<P> | string,
  P,
> = {
  readonly action?: A;
  readonly payload?: P;
};

export type Logger = typeof _LOGGER & {
  readonly inconsistentReduxStateError: <
    A extends import("application/store/types/actions").BasicAction<P> | string,
    P,
  >(
    params: InconsistentReduxStateErrorParams<A, P> | LogMessageContext,
    additionalContext?: string | LogMessageContext,
    message?: string,
  ) => void;
};

const LOGGER: Logger = {
  ..._LOGGER,
  inconsistentReduxStateError<
    A extends import("application/store/types/actions").BasicAction<P> | string,
    P,
  >(
    this: Logger,
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

    this.warn(updatedContext, updatedMessage);
  },
} as Logger;

export default LOGGER;
