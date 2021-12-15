import { toast } from "react-toastify";
import * as Sentry from "@sentry/react";
import { isNil } from "lodash";

import * as api from "api";
import { isNotificationForConsole, isNotificationForSentry } from "./typeguards";
import { notificationDetailToString } from ".";

export const userFacingMessage = (e: InternalNotification): string => {
  const contextualMessage = e?.message;
  if (!isNil(contextualMessage)) {
    return contextualMessage;
  }
  const detail: NotificationDetail | undefined = e.detail;
  return detail !== undefined ? notificationDetailToString(detail) : "";
};

/* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
const consoleMethodMap: { [key in AppNotificationConsoleLevel]: "warn" | "error" | "info" } = {
  warning: "warn",
  error: "error",
  info: "info"
};

/* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
const toastMethodMap: { [key in AppNotificationLevel]: (content: string) => void } = {
  warning: toast.warning,
  error: toast.error,
  info: toast.info,
  success: toast.success
};

const consoleMethod = (level: AppNotificationConsoleLevel): Console["warn" | "error" | "info"] => {
  return console[consoleMethodMap[level]];
};

export const notifyUser = (e: InternalNotification) => {
  const toaster = toastMethodMap[e.level];
  toaster(userFacingMessage(e));
};

export const notify = (e: InternalNotification) => {
  /* Note: Issuing a console.warn or console.error will automatically dispatch
     to Sentry. */
  const defaultDispatchToSentry = isNotificationForSentry(e) ? true : false;
  const dispatchToSentry = e.dispatchToSentry === undefined ? defaultDispatchToSentry : e.dispatchToSentry;

  let consoler: Console["warn" | "error" | "info"] | null = null;
  if (isNotificationForConsole(e)) {
    consoler = consoleMethod(e.level);
    /* If this is a warning or error, it will be automatically dispatched to
       Sentry - unless we disable it temporarily. */
    if (dispatchToSentry === false && isNotificationForSentry(e)) {
      /* If this is an error or warning and we do not want to send to Sentry,
         we must temporarily disable it. */
      Sentry.withScope((scope: Sentry.Scope) => {
        scope.setExtra("ignore", true);
        consoler?.(e);
      });
    } else if (dispatchToSentry === true && e instanceof Error) {
      /* If this is an error or warning but we have the actual Error object, we\
         want to send that to Sentry - not via the console because we will lose
         the error trace in the console. */
      Sentry.captureException(e);
      /* Perform the console action as before, not propogating it to Sentry
         since we already did that via the captureException method. */
      Sentry.withScope((scope: Sentry.Scope) => {
        scope.setExtra("ignore", true);
        consoler?.(e);
      });
    } else {
      consoler(e);
    }
  }
  if (e.notifyUser) {
    notifyUser(e);
  }
};

export const success = (e: string) => notify({ message: e, notifyUser: true, level: "success" });

export const info = (e: string) => notify({ message: e, notifyUser: true, level: "info" });

export const warn = (e: Omit<InternalNotification, "level"> | string) => {
  notify({ ...(typeof e === "string" ? { message: e } : e), level: "warning" });
};

export const error = (e: Omit<InternalNotification, "level"> | string) => {
  notify({ ...(typeof e === "string" ? { message: e } : e), level: "error" });
};

export const requestError = (e: Error, c?: Omit<InternalNotification, "level" | "detail" | "dispatchToSentry">) => {
  if (e instanceof api.ClientError) {
    warn({
      detail: e,
      notifyUser: true,
      dispatchToSentry: false,
      message: "There was a problem with your request.",
      ...c
    });
  } else if (e instanceof api.NetworkError) {
    warn({
      detail: e,
      notifyUser: true,
      message: "There was a problem communicating with the server.",
      ...c,
      dispatchToSentry: true
    });
  } else if (!(e instanceof api.ForceLogout)) {
    throw e;
  }
};
