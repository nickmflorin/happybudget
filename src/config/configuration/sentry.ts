import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";
import { ExtraErrorData } from "@sentry/integrations";
import SentryRRWeb from "@sentry/rrweb";

import { logger } from "internal";
import { parsers } from "lib";

export const configure = () => {
  const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (SENTRY_DSN === undefined || SENTRY_DSN.toLowerCase() === "none") {
    logger.warn("No SENTRY_DSN found in the environment, skipping Sentry configuration.");
    return;
  }
  const SENTRY_ENV = process.env.NEXT_PUBLIC_SENTRY_ENV;
  if (SENTRY_ENV === undefined) {
    throw new Error("No SENTRY_ENV found in the environment.");
  }
  const SENTRY_ERROR_DATA_DEPTH_STRING = process.env.NEXT_PUBLIC_SENTRY_ERROR_DATA_DEPTH;
  const SENTRY_ERROR_DATA_DEPTH: number | null =
    SENTRY_ERROR_DATA_DEPTH_STRING === undefined
      ? null
      : parsers.stringToInt(SENTRY_ERROR_DATA_DEPTH_STRING);
  if (SENTRY_ERROR_DATA_DEPTH === null) {
    throw new TypeError(
      `Invalid value ${SENTRY_ERROR_DATA_DEPTH_STRING} detected for 'NEXT_PUBLIC_SENTRY_ERROR_DATA_DEPTH' in environment.`,
    );
  }
  const SENTRY_NORMALIZE_DEPTH_STRING = process.env.NEXT_PUBLIC_SENTRY_NORMALIZE_DEPTH;
  const SENTRY_NORMALIZE_DEPTH: number | null =
    SENTRY_NORMALIZE_DEPTH_STRING === undefined
      ? null
      : parsers.stringToInt(SENTRY_NORMALIZE_DEPTH_STRING);
  if (SENTRY_NORMALIZE_DEPTH === null) {
    throw new TypeError(
      `Invalid value ${SENTRY_NORMALIZE_DEPTH_STRING} detected for 'NEXT_PUBLIC_SENTRY_NORMALIZE_DEPTH' in environment.`,
    );
  }

  Sentry.configureScope((scope: Sentry.Scope) => {
    scope.setTag("userAgent", window.navigator.userAgent);
  });
  // TODO: Figure out how to funnel logs through to Sentry.
  Sentry.init({
    dsn: SENTRY_DSN,
    normalizeDepth: SENTRY_NORMALIZE_DEPTH,
    integrations: [
      new Integrations.BrowserTracing(),
      new ExtraErrorData({
        /*
        Limit of how deep the object serializer should go. Anything deeper than limit will be
        replaced with standard Node.js REPL notation of [Object], [Array], [Function] or a primitive
        value. Defaults to 3. When changing this value, make sure to update `normalizeDepth` of the
        whole SDK to `depth + 1` in order to get it serialized properly. */
        depth: SENTRY_ERROR_DATA_DEPTH,
      }),
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
};
