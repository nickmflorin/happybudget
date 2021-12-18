import * as Sentry from "@sentry/react";

import * as api from "api";

type InternalNotificationOptions = Pick<InternalNotification, "dispatchToSentry" | "level" | "message">;

/* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
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

/* eslint-disable indent */
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

const consoleMessage = (e: InternalNotification | NotificationDetail): string | Error =>
  isNotificationObj(e) ? e.message || e.error || "" : api.typeguards.isHttpError(e) ? e.message : e;

export const notify = (e: InternalNotification | NotificationDetail, opts?: InternalNotificationOptions) => {
  /* Note: Issuing a console.warn or console.error will automatically dispatch
     to Sentry. */
  const dispatchToSentry = shouldDispatchToSentry(e, opts);
  const level = notificationLevel(e, opts);

  let consoler: Console["warn" | "error"] = consoleMethod(level);
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

export const requestError = (e: Error, opts?: InternalNotificationOptions) => {
  if (e instanceof api.ClientError) {
    notify({
      dispatchToSentry: false,
      level: "warning",
      message: "There was a problem with your request.",
      ...opts,
      error: e
    });
  } else if (e instanceof api.NetworkError) {
    notify({
      dispatchToSentry: true,
      level: "error",
      message: "There was a problem communicating with the server.",
      ...opts,
      error: e
    });
  } else if (!(e instanceof api.ForceLogout)) {
    throw e;
  }
};
