import { toast } from "react-toastify";
import * as Sentry from "@sentry/react";
import { isNil, includes } from "lodash";

import * as api from "api";

export const notificationToString = (e: AppNotification) => {
  return e instanceof Error ? String(e) : typeof e === "string" ? e : JSON.stringify(e);
};

export const userFacingMessage = (e: AppNotification, context?: AppNotificationContext): string => {
  const contextualMessage = context?.message;
  if (!isNil(contextualMessage)) {
    return contextualMessage;
  }
  return notificationToString(e);
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

const isConsoleNotification = (
  context: AppNotificationContext
): context is AppNotificationContext<AppNotificationConsoleLevel> =>
  includes(["error", "warning", "info"], context.level);

export const notifyUser = (e: AppNotification, context: AppNotificationContext) => {
  const toaster = toastMethodMap[context.level];
  toaster(userFacingMessage(e, context));
};

export const isContextForSentry = (context: AppNotificationContext) => includes(["error", "warning"], context.level);

export const notify = (e: AppNotification, context: AppNotificationContext) => {
  // Note: Issuing a console.warn or console.error will automatically dispatch to Sentry.
  const defaultDispatchToSentry = isContextForSentry(context) ? true : false;
  const dispatchToSentry = context.dispatchToSentry === undefined ? defaultDispatchToSentry : context.dispatchToSentry;

  let consoler: Console["warn" | "error" | "info"] | null = null;
  if (isConsoleNotification(context)) {
    consoler = consoleMethod(context.level);
    // If this is a warning or error, it will be automatically dispatched to Sentry - unless
    // we disable it temporarily.
    if (dispatchToSentry === false && isContextForSentry(context)) {
      // If this is an error or warning and we do not want to send to Sentry, we must temporarily
      // disable it.
      Sentry.withScope((scope: Sentry.Scope) => {
        scope.setExtra("ignore", true);
        consoler?.(e);
      });
    } else if (dispatchToSentry === true && e instanceof Error) {
      // If this is an error or warning but we have the actual Error object, we want to send
      // that to Sentry - not via the console because we will lose the error trace in the
      // console.
      Sentry.captureException(e);
      // Perform the console action as before, not propogating it to Sentry since we
      // already did that via the captureException method.
      Sentry.withScope((scope: Sentry.Scope) => {
        scope.setExtra("ignore", true);
        consoler?.(e);
      });
    } else {
      consoler(e);
    }
  }
  if (context.notifyUser) {
    notifyUser(e, context);
  }
};

export const success = (e: string) => notify(e, { notifyUser: true, level: "success" });

export const info = (e: string) => notify(e, { notifyUser: true, level: "info" });

export const warn = (e: AppNotification, c?: string | Omit<AppNotificationContext, "level">) => {
  const context = typeof c === "string" ? { message: c } : c;
  notify(e, { ...context, level: "warning" });
};

export const error = (e: AppNotification, c?: string | Omit<AppNotificationContext, "level">) => {
  const context = typeof c === "string" ? { message: c } : c;
  notify(e, { ...context, level: "error" });
};

export const requestError = (e: Error, c?: string | Omit<AppNotificationContext, "level">) => {
  const context = typeof c === "string" ? { message: c } : c;
  if (e instanceof api.ClientError) {
    warn(e, {
      notifyUser: true,
      dispatchToSentry: false,
      message: "There was a problem with your request.",
      ...context
    });
  } else if (e instanceof api.NetworkError) {
    warn(e, {
      notifyUser: true,
      message: "There was a problem communicating with the server.",
      ...context,
      dispatchToSentry: true
    });
  } else {
    throw e;
  }
};
