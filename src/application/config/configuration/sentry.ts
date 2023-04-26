import { ExtraErrorData } from "@sentry/integrations";
import * as Sentry from "@sentry/react";
import SentryRRWeb from "@sentry/rrweb";
import { Integrations } from "@sentry/tracing";

import { logger } from "internal";

import { parseEnvVar, getNextLoc } from "../util";

export const getSentryDSN = (): string | null => {
  const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (SENTRY_DSN === undefined || SENTRY_DSN.toLowerCase() === "none") {
    return null;
  }
  return SENTRY_DSN;
};

const SENTRY_DSN = getSentryDSN();

export const sentryIsConfigured = (): boolean => SENTRY_DSN !== null;

/* Sentry does not expose the Integration type outside of the package, so the only way to exclude
   the function callback from the type Integrations is to exclude all function types.
   Sentry.BrowserOptions["integrations"] =
   | Integration[]
   | (integrations: Integration[]) => Integration[]; */
type Integrations = Exclude<Sentry.BrowserOptions["integrations"], (...args: any[]) => unknown>;

const getSentryParams = ():
  | (Pick<
      Sentry.BrowserOptions,
      "dsn" | "normalizeDepth" | "environment" | "tracesSampleRate" | "beforeSend"
    > & { readonly integrations: Integrations })
  | null => {
  if (SENTRY_DSN === null) {
    logger.warn(
      `No SENTRY_DSN found in the environment, skipping Sentry configuration for ${getNextLoc()}.`,
    );
    return null;
  }
  return {
    dsn: SENTRY_DSN,
    normalizeDepth: parseEnvVar(
      process.env.NEXT_PUBLIC_SENTRY_NORMALIZE_DEPTH,
      "NEXT_PUBLIC_SENTRY_NORMALIZE_DEPTH",
      { type: "integer", required: true },
    ),
    tracesSampleRate: 1.0,
    beforeSend: (event: Sentry.Event) => {
      // Allows us to disable Sentry for a single line of code.
      if (event.extra?.ignore === true) {
        return null;
      }
      return event;
    },
    integrations: [
      new ExtraErrorData({
        /* Limit of how deep the object serializer should go. Anything deeper than limit will be
           replaced with standard Node.js REPL notation of [Object], [Array], [Function] or a
           primitive value. Defaults to 3. When changing this value, make sure to update
           `normalizeDepth` of the whole SDK to `depth + 1` in order to get it serialized
           properly. */
        depth: parseEnvVar(
          process.env.NEXT_PUBLIC_SENTRY_ERROR_DATA_DEPTH,
          "NEXT_PUBLIC_SENTRY_ERROR_DATA_DEPTH",
          { type: "integer", required: true },
        ),
      }),
    ],
    environment: parseEnvVar(process.env.NEXT_PUBLIC_SENTRY_ENV, "NEXT_PUBLIC_SENTRY_ENV", {
      type: "string",
      required: true,
    }),
  };
};

export const configureClientSentry = (): void => {
  const params = getSentryParams();
  if (params !== null) {
    Sentry.configureScope((scope: Sentry.Scope) => {
      scope.setTag("userAgent", window.navigator.userAgent);
    });
    // TODO: Figure out how to funnel logs through to Sentry.
    Sentry.init({
      ...params,
      integrations: [
        ...(params.integrations || []),
        new Integrations.BrowserTracing(),
        new SentryRRWeb(),
      ],
      denyUrls: [
        // Chrome extensions
        /extensions\//i,
        /^chrome:\/\//i,
      ],
      ignoreErrors: [
        // Random plugins/extensions
        "top.GLOBALS",
      ],
      environment: process.env.NEXT_PUBLIC_SENTRY_ENV,
      tracesSampleRate: 1.0,
      beforeSend: (event: Sentry.Event) => {
        // Allows us to disable Sentry for a single line of code.
        if (event.extra?.ignore === true) {
          return null;
        }
        return event;
      },
    });
  }
};
