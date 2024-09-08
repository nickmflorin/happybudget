import * as Sentry from "@sentry/react";
import { isNil, map } from "lodash";

import * as api from "api";
import * as config from "config";
import { formatters } from "lib";

import { objToJson } from "./util";

type InternalNotificationOptions = Pick<InternalNotificationObj, "dispatchToSentry" | "level">;

const consoleMethodMap: { [key in AppNotificationConsoleLevel]: "warn" | "error" | "info" } = {
  warning: "warn",
  error: "error",
  info: "info"
};

const consoleMethod = (level: AppNotificationConsoleLevel): Console["warn" | "error" | "info"] => {
  return console[consoleMethodMap[level]];
};

const isNotificationObj = (n: InternalNotification | Error | string): n is InternalNotificationObj =>
  typeof n !== "string" && !(n instanceof Error);

/**
 * For a given InternalNotification and set of notification options, determines
 * whether or not the notification should be dispatched to Sentry.
 *
 * Preference is always given to the configuration of `dispatchToSentry` on
 * the InternalNotification object.  If that is not defined, the determination
 * is made based on the optional configuration of `dispatchToSentry` on the
 * provided set of options.
 *
 * By default, the decision is to dispatch to Sentry unless contextual
 * information indicating otherwise is included.
 *
 * @param {(InternalNotification)} e:
 *   The object that contains the information that is used to create and issue
 *   the notification.
 * @param {(InternalNotificationOptions)} opts:
 *   The options that affect how the notification is dispatched.
 */
const shouldDispatchToSentry = (e: InternalNotification, opts?: InternalNotificationOptions): boolean => {
  const optsSentry = opts?.dispatchToSentry !== undefined ? opts?.dispatchToSentry : true;
  if (isNotificationObj(e)) {
    return e.dispatchToSentry !== undefined ? e.dispatchToSentry : optsSentry;
  }
  return optsSentry;
};

const notificationLevel = (
  e: InternalNotification | Error | string,
  opts?: InternalNotificationOptions
): "error" | "warning" => {
  if (isNotificationObj(e)) {
    return e.level !== undefined
      ? e.level
      : opts?.level !== undefined
      ? opts.level
      : e.error !== undefined
      ? "error"
      : "warning";
  }
  return opts?.level !== undefined ? opts?.level : "warning";
};

const consoleMessage = (e: InternalNotification | Error | string): string | Error => {
  if (isNotificationObj(e)) {
    if (!isNil(e.message) && !isNil(e.error)) {
      return `${e.message}\nError: ${e.error.message}`;
    }
    return e.message || e.error || "";
  }
  return e instanceof api.RequestError ? e.message : e;
};

/**
 * Dispatches an internal notification that is created based on the provided
 * InternalNotification and optionally provided options.  Makes the
 * determination as to how the notification should be dispatched based on
 * provided options and the Node environment.
 *
 * Note: This is not to be used for handling notifications that should be shown
 * to users, but only notifications that are used for internal logging and
 * error reporting purposes.
 *
 * @param {(InternalNotification)} e:
 *   The object that contains the information that is used to create and issue
 *   the notification.
 *
 * @param {(InternalNotificationOptions)} opts:
 *   The options that affect how the notification is dispatched.
 */
export const notify = (e: InternalNotification, opts?: InternalNotificationOptions): void => {
  const dispatchToSentry = shouldDispatchToSentry(e, opts);
  const level = notificationLevel(e, opts);

  const consoler: Console["warn" | "error"] = consoleMethod(level);
  /* If this is a warning or error, it will be automatically dispatched to
     Sentry - unless we disable it temporarily. */
  if (dispatchToSentry === false) {
    /*
		If this is an error or warning and we do not want to send to Sentry,
    we must temporarily disable it.
		*/
    Sentry.withScope((scope: Sentry.Scope) => {
      scope.setExtra("ignore", true);
      consoler?.(consoleMessage(e));
    });
  } else if (dispatchToSentry === true && e instanceof Error) {
    /*
		In local development, we do not use Sentry - so we still have to issue
    the message to the console.
		*/
    if (config.env.environmentIsLocal()) {
      consoler(consoleMessage(e));
    }
    /*
		If this is an error or warning but we have the actual Error object, we\
    want to send that to Sentry - not via the console because we will lose
    the error trace in the console.
		*/
    Sentry.captureException(e);
    /*
		Perform the console action as before, not propagating it to Sentry
    since we already did that via the captureException method.
		*/
    Sentry.withScope((scope: Sentry.Scope) => {
      scope.setExtra("ignore", true);
      consoler?.(consoleMessage(e));
    });
  } else {
    consoler(consoleMessage(e));
  }
};

type InconsistentStateError<P extends Redux.ActionPayload = Redux.ActionPayload> = {
  readonly action?: Redux.Action | string;
  readonly payload?: P;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  [key: string]: any;
};

type ParamV<P extends Redux.ActionPayload = Redux.ActionPayload> =
  | Redux.Action
  | P
  | null
  | undefined
  | string
  | number
  | string[]
  | number[];

export const inconsistentStateError = <P extends Redux.ActionPayload = Redux.ActionPayload>(
  e: InconsistentStateError<P>,
  opts?: InternalNotificationOptions
): void => {
  const { action, payload, ...context } = e;
  const actionString: string | undefined = !isNil(action)
    ? typeof action === "string"
      ? action
      : action.type
    : action;

  const payloadString: string | null | undefined = !isNil(payload)
    ? objToJson(payload)
    : !isNil(action) && typeof action !== "string"
    ? objToJson(action.payload)
    : payload;

  const addParamValue = (message: string, paramName: string, value: ParamV<P>) =>
    message + `\n\t${formatters.titleCaseFormatter(paramName)}: ${String(value)}`;

  const addParam = (message: string, paramName: string, paramValue: ParamV<P>) =>
    paramValue !== undefined ? addParamValue(message, paramName, paramValue) : message;

  let message = addParam(addParam("Inconsistent State!", "action", actionString), "payload", payloadString);
  Object.keys(context).forEach((key: string) => {
    message = addParam(message, key, context[key]);
  });

  notify({
    dispatchToSentry: true,
    level: "warning",
    ...opts,
    message
  });
};

export const handleRequestError = (e: SingleOrArray<Error>, opts?: InternalNotificationOptions) => {
  const errors = Array.isArray(e) ? e : [e];
  map(errors, (er: Error) => {
    if (er instanceof api.ClientError || er instanceof api.ServerError) {
      notify({
        dispatchToSentry: true,
        level: "error",
        ...opts,
        error: er
      });
    } else if (er instanceof api.NetworkError) {
      notify({
        dispatchToSentry: false,
        level: "error",
        ...opts,
        error: er
      });
    } else if (!(er instanceof api.ForceLogout)) {
      throw er;
    }
  });
};
