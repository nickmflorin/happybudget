import { toast } from "react-toastify";
import * as Sentry from "@sentry/react";
import { isNil } from "lodash";

interface NotifyConfig {
  readonly error?: Error;
  readonly dispatchToSentry?: boolean;
  readonly notifyUser?: boolean;
}

export const errorToString = (e: Error | string | object) => {
  return e instanceof Error ? String(e) : typeof e === "string" ? e : JSON.stringify(e);
};

export const warn = (e: Error | string | object, config?: NotifyConfig) => {
  const notifyUser = config?.notifyUser === undefined ? false : config.notifyUser;
  const dispatchToSentry = config?.dispatchToSentry === undefined ? true : config.dispatchToSentry;
  // Issuing a warning will dispatch to Sentry, issuing info will not.
  if (dispatchToSentry) {
    if (isNil(config?.error)) {
      console.warn(errorToString(e));
    } else {
      // If the actual error is included, dispatch that to Sentry and just note the
      // string representation in the console.
      console.info(errorToString(e));
      Sentry.captureException(config?.error);
    }
  } else {
    console.info(errorToString(e));
  }
  if (notifyUser === true) {
    toast.warn(errorToString(e));
  }
};

export const error = (e: Error | string | object, config?: NotifyConfig) => {
  const notifyUser = config?.notifyUser === undefined ? false : config.notifyUser;
  const dispatchToSentry = config?.dispatchToSentry === undefined ? true : config.dispatchToSentry;
  // Issuing a error will dispatch to Sentry, issuing info will not.
  if (dispatchToSentry) {
    if (isNil(config?.error)) {
      console.error(errorToString(e));
    } else {
      // If the actual error is included, dispatch that to Sentry and just note the
      // string representation in the console.
      console.info(errorToString(e));
      Sentry.captureException(config?.error);
    }
  } else {
    console.info(errorToString(e));
  }
  if (notifyUser === true) {
    toast.error(errorToString(e));
  }
};
