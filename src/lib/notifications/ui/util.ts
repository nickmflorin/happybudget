import { reduce, isEqual } from "lodash";

import * as api from "api";
import { objToJson } from "../util";
import * as typeguards from "./typeguards";

/**
 * Safely converts an object with potential circular references to JSON for
 * logging, which avoids potential circular references errors in our logs
 * as the `inspect` package will replace circular references with [Circular].
 */
export const notificationDetailToString = (e: NotificationDetail) => {
  return e instanceof Error ? String(e) : typeof e === "string" ? e : api.standardizeError(e).message;
};

export const notificationDetailsEqual = (
  n1: NotificationDetail | undefined,
  n2: NotificationDetail | undefined
): boolean => {
  /* We never consider two separately thrown Errors as being equal in terms of
     notifications. */
  if (typeof n1 === "string" && typeof n2 === "string" && n1 === n2) {
    return true;
  } else if (n1 === undefined && n2 === undefined) {
    return true;
  } else if (n1 === undefined || n2 === undefined) {
    return false;
  } else if (api.typeguards.isHttpError(n1) && api.typeguards.isHttpError(n2) && isEqual(n1, n2)) {
    return true;
  }
  return false;
};

const ErrorEquality: UINotificationEquality<Error> = {
  typeguard: typeguards.isError,
  /* We never consider two separately thrown Errors as being equal in terms of
     notifications. */
  func: () => false
};

const StringEquality: UINotificationEquality<string> = {
  typeguard: (n: UINotificationType): n is string => typeof n === "string",
  func: (n1: string, n2: string) => n1 === n2
};

const HttpErrorEquality: UINotificationEquality<Http.Error> = {
  typeguard: (n: UINotificationType): n is Http.Error => api.typeguards.isHttpError(n),
  func: (n1: Http.Error, n2: Http.Error) => isEqual(n1, n2)
};

const UIFieldNotificationEquality: UINotificationEquality<UIFieldNotification> = {
  typeguard: typeguards.isUIFieldNotification,
  func: (n1: UIFieldNotification, n2: UIFieldNotification) => isEqual(n1, n2)
};

const UINotificationEquality: UINotificationEquality<UINotification> = {
  typeguard: typeguards.isUiNotification,
  func: (n1: UINotification, n2: UINotification) =>
    n1.message === n2.message && notificationDetailsEqual(n1.detail, n2.detail)
};

const NotificationEqualities: [
  UINotificationEquality<Error>,
  UINotificationEquality<string>,
  UINotificationEquality<Http.Error>,
  UINotificationEquality<UIFieldNotification>,
  UINotificationEquality<UINotification>
] = [
  ErrorEquality,
  StringEquality,
  /* Since UIFieldNotification is assignable to Http.FieldError, this
     standardizer must come before `UIFieldNotificationStandard`. */
  HttpErrorEquality,
  UIFieldNotificationEquality,
  UINotificationEquality
];

export const notificationsAreEqual = (n1: UINotificationType, n2: UINotificationType): boolean => {
  for (let i = 0; i < NotificationEqualities.length; i++) {
    const equality = NotificationEqualities[i];
    if (equality.typeguard(n1) && equality.typeguard(n2)) {
      const func = equality.func as (e1: typeof n1, e2: typeof n2) => boolean;
      return func(n1, n2);
    }
  }
  return false;
};

const CentralStandardizer = (n: UINotificationData, opts?: Omit<UINotificationOptions, "behavior">) => {
  return {
    ...n,
    message: n.message === undefined ? opts?.message : n.message,
    detail: n.detail === undefined ? opts?.detail : n.detail,
    closable: opts?.closable !== undefined ? opts.closable : n.closable
  };
};

const ErrorStandard: UINotificationStandard<Error> = {
  typeguard: typeguards.isError,
  func: (e: Error, opts?: Omit<UINotificationOptions, "behavior">) =>
    CentralStandardizer({ level: "error", message: "There was an error.", detail: e.message, ...opts }, opts)
};

const StringStandard: UINotificationStandard<string> = {
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

const HttpErrorStandard: UINotificationStandard<Http.Error> = {
  typeguard: (n: UINotificationType): n is Http.Error => api.typeguards.isHttpError(n),
  func: (e: Http.Error, opts?: Omit<UINotificationOptions, "behavior">) =>
    CentralStandardizer(
      {
        message: opts?.message || api.standardizeError(e).message,
        detail:
          opts?.detail !== undefined
            ? opts?.detail
            : opts?.message !== undefined
            ? api.standardizeError(e).message
            : undefined,
        level: "warning"
      },
      opts
    )
};

const UIFieldNotificationStandard: UINotificationStandard<UIFieldNotification> = {
  typeguard: typeguards.isUIFieldNotification,
  func: (e: UIFieldNotification, opts?: Omit<UINotificationOptions, "behavior">) =>
    CentralStandardizer(
      {
        message: opts?.message || `There was an error related to field ${e.field}.`,
        detail: opts?.detail || e.message,
        level: "warning"
      },
      opts
    )
};

const UINotificationStandard: UINotificationStandard<UINotification> = {
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
): UINotification | null => {
  for (let i = 0; i < NotificationStandards.length; i++) {
    const standard = NotificationStandards[i];
    if (standard.typeguard(n)) {
      const func = standard.func as (
        e: typeof n,
        opts?: Omit<UINotificationOptions, "behavior">
      ) => UINotification | null;
      return func(n, opts);
    }
  }
  console.warn(`Could not standardize notification ${objToJson(n)}!`);
  return null;
};

export const combineFieldNotifications = (
  ns: (UIFieldNotification | Http.FieldError)[],
  opts?: Omit<UINotificationOptions, "behavior">
): UINotificationData | null => {
  /* If there is only a single field related error, just treat it as we would
     without assembling them together. */
  if (ns.length === 1) {
    return standardizeNotification(ns[0]);
  }
  const detailLines = reduce(
    ns,
    (curr: string[], n: UIFieldNotification | Http.FieldError, index: number) => {
      const standardized = standardizeNotification(n);
      if (standardized !== null) {
        return [...curr, `(${index + 1}) <b>${n.field}</b>: ${standardized.message}`];
      }
      return curr;
    },
    []
  );
  return {
    message: opts?.message || "There were errors related to the following fields:",
    detail: detailLines.join("\n"),
    level: "warning"
  };
};
