import { reduce } from "lodash";

import * as api from "api";
import * as typeguards from "./typeguards";

export const notificationDetailToString = (e: NotificationDetail) => {
  return e instanceof Error ? String(e) : typeof e === "string" ? e : api.standardizeError(e).message;
};

const CentralStandardizer = (n: UINotificationData, opts?: Omit<UINotificationOptions, "behavior">) => {
  n = { ...n, closable: opts?.closable !== undefined ? opts.closable : n.closable };
  if (n.message === undefined) {
    return { ...n, message: opts?.defaultMessageOrDetail };
  } else if (n.detail === undefined) {
    return { ...n, detail: opts?.defaultMessageOrDetail };
  }
  return n;
};

export const ErrorStandard: UINotificationStandard<Error> = {
  typeguard: typeguards.isError,
  func: (e: Error, opts?: Omit<UINotificationOptions, "behavior">) =>
    CentralStandardizer(
      {
        message: opts?.message,
        level: "error"
      },
      opts
    )
};

export const StringStandard: UINotificationStandard<string> = {
  typeguard: (n: UINotificationType): n is string => typeof n === "string",
  func: (e: string, opts?: Omit<UINotificationOptions, "behavior">) =>
    CentralStandardizer(
      {
        message: e,
        level: "warning"
      },
      opts
    )
};

export const HttpErrorStandard: UINotificationStandard<Http.Error> = {
  typeguard: (n: UINotificationType): n is Http.Error => api.typeguards.isHttpError(n),
  func: (e: Http.Error, opts?: Omit<UINotificationOptions, "behavior">) =>
    CentralStandardizer(
      {
        message: opts?.message || opts?.defaultMessageOrDetail || api.standardizeError(e).message,
        /* If there is an explicit message provided, we use the API error as the
           detail and the more general, explicitly provided message as the
					 message. */
        detail:
          opts?.message !== undefined || opts?.defaultMessageOrDetail !== undefined
            ? api.standardizeError(e).message
            : undefined,
        level: "warning"
      },
      opts
    )
};

export const UIFieldNotificationStandard: UINotificationStandard<UIFieldNotification> = {
  typeguard: typeguards.isUIFieldNotification,
  func: (e: UIFieldNotification, opts?: Omit<UINotificationOptions, "behavior">) =>
    CentralStandardizer(
      {
        message: opts?.message || `There was an error related to field ${e.field}.`,
        detail: e.message,
        level: "warning"
      },
      opts
    )
};

export const UINotificationStandard: UINotificationStandard<UINotification> = {
  typeguard: typeguards.isUiNotification,
  func: (e: UINotification) => e
};

const NotificationStandards: [
  UINotificationStandard<Error>,
  UINotificationStandard<string>,
  UINotificationStandard<Http.Error>,
  UINotificationStandard<UIFieldNotification>,
  UINotificationStandard<UINotification>
] = [
  ErrorStandard,
  StringStandard,
  /* Since UIFieldNotification is assignable to Http.FieldError, this
     standardizer must come before `UIFieldNotificationStandard`. */
  HttpErrorStandard,
  UIFieldNotificationStandard,
  UINotificationStandard
];

export const standardizeNotification = (
  n: UINotificationType,
  opts?: Omit<UINotificationOptions, "behavior">
): UINotification => {
  for (let i = 0; i < NotificationStandards.length; i++) {
    const standard = NotificationStandards[i];
    if (standard.typeguard(n)) {
      const func = standard.func as (e: typeof n, opts?: Omit<UINotificationOptions, "behavior">) => UINotification;
      return func(n, opts);
    }
  }
  throw new Error(`Could not standardize notification ${JSON.stringify(n)}.`);
};

export const combineFieldNotifications = (
  ns: (UIFieldNotification | Http.FieldError)[],
  opts?: Omit<UINotificationOptions, "behavior">
): UINotificationData => {
  /* If there is only a single field related error, just treat it as we would
     without assembling them together. */
  if (ns.length === 1) {
    return standardizeNotification(ns[0]);
  }
  const detailLines = reduce(
    ns,
    (curr: string[], n: UIFieldNotification | Http.FieldError, index: number) => {
      return [...curr, `(${index + 1}) <b>${n.field}</b>: ${standardizeNotification(n).message}`];
    },
    []
  );
  return {
    message: opts?.message || "There were errors related to the following fields:",
    detail: detailLines.join("\n"),
    level: "warning"
  };
};
