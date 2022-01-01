import * as Sentry from "@sentry/react";
import { isNil } from "lodash";

import * as api from "api";
import { toTitleCase } from "lib/util/formatters";

type InternalNotificationOptions = Pick<InternalNotification, "dispatchToSentry" | "level">;

const consoleMethodMap: { [key in AppNotificationConsoleLevel]: "warn" | "error" | "info" } = {
  warning: "warn",
  error: "error",
  info: "info"
};

const consoleMethod = (level: AppNotificationConsoleLevel): Console["warn" | "error" | "info"] => {
  return console[consoleMethodMap[level]];
};

const isNotificationObj = (n: InternalNotification | NotificationDetail): n is InternalNotification =>
  typeof n !== "string" && !(n instanceof Error) && !api.typeguards.isHttpError(n);

const isError = (n: InternalNotification | NotificationDetail): n is Error =>
  typeof n !== "string" && n instanceof Error;

const shouldDispatchToSentry = (
  e: InternalNotification | NotificationDetail,
  opts?: InternalNotificationOptions
): boolean => {
  const optsSentry = opts?.dispatchToSentry !== undefined ? opts?.dispatchToSentry : true;
  if (isNotificationObj(e)) {
    return e.dispatchToSentry !== undefined ? e.dispatchToSentry : optsSentry;
  }
  /* By default, we dispatch to Sentry unless we are given contextual information
	   telling us not to do so. */
  return opts?.dispatchToSentry !== undefined ? opts?.dispatchToSentry : true;
};

const notificationLevel = (
  e: InternalNotification | NotificationDetail,
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

const consoleMessage = (e: InternalNotification | NotificationDetail): string | Error => {
  if (isNotificationObj(e)) {
    if (!isNil(e.message) && !isNil(e.error)) {
      return `${e.message}\nError: ${e.error.message}`;
    }
    return e.message || e.error || "";
  }
  return api.typeguards.isHttpError(e) ? e.message : e;
};

export const notify = (e: InternalNotification | NotificationDetail, opts?: InternalNotificationOptions): void => {
  /* Note: Issuing a console.warn or console.error will automatically dispatch
     to Sentry. */
  const dispatchToSentry = shouldDispatchToSentry(e, opts);
  const level = notificationLevel(e, opts);

  const consoler: Console["warn" | "error"] = consoleMethod(level);
  /* If this is a warning or error, it will be automatically dispatched to
       Sentry - unless we disable it temporarily. */
  if (dispatchToSentry === false) {
    /* If this is an error or warning and we do not want to send to Sentry,
       we must temporarily disable it. */
    Sentry.withScope((scope: Sentry.Scope) => {
      scope.setExtra("ignore", true);
      consoler?.(consoleMessage(e));
    });
  } else if (dispatchToSentry === true && isError(e)) {
    /* If this is an error or warning but we have the actual Error object, we\
       want to send that to Sentry - not via the console because we will lose
       the error trace in the console. */
    Sentry.captureException(e);
    /* Perform the console action as before, not propogating it to Sentry
       since we already did that via the captureException method. */
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
    ? JSON.stringify(payload)
    : !isNil(action) && typeof action !== "string"
    ? JSON.stringify(action.payload)
    : payload;

  const addParamValue = (message: string, paramName: string, value: ParamV<P>) =>
    message + `\n\t${toTitleCase(paramName)}: ${value}`;

  const addParam = (message: string, paramName: string, paramValue: ParamV<P>) => {
    if (paramValue !== undefined) {
      return addParamValue(message, paramName, paramValue);
    }
    return message;
  };

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

export const requestError = (e: Error, opts?: InternalNotificationOptions) => {
  if (e instanceof api.ClientError) {
    notify({
      dispatchToSentry: true,
      level: "error",
      ...opts,
      error: e
    });
  } else if (e instanceof api.NetworkError) {
    notify({
      dispatchToSentry: true,
      level: "error",
      ...opts,
      error: e
    });
  } else if (!(e instanceof api.ForceLogout)) {
    throw e;
  }
};
