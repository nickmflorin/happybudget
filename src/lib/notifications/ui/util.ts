import { reduce, isEqual } from "lodash";

import * as api from "api";

import { objToJson } from "../util";
import * as typeguards from "./typeguards";

export const notificationDetailToString = (e: UINotificationDetail) => {
  return e instanceof api.RequestError ? (e instanceof api.ClientError ? e.userFacingMessage : e.message) : e;
};

export const notificationDetailsEqual = (
  n1: UINotificationDetail | undefined,
  n2: UINotificationDetail | undefined
): boolean => {
  if (typeof n1 === "string" && typeof n2 === "string" && n1 === n2) {
    return true;
  } else if (n1 === undefined && n2 === undefined) {
    return true;
  } else if (n1 === undefined || n2 === undefined) {
    return false;
  } else if (n1 instanceof api.RequestError && n2 instanceof api.RequestError) {
    return n1.equals(n2);
  }
  return false;
};

const ErrorEquality: UINotificationEquality<Http.ApiError> = {
  typeguard: (n: UINotificationType): n is Http.ApiError =>
    n instanceof api.ClientError || n instanceof api.NetworkError || n instanceof api.ServerError,
  func: (n1: Http.ApiError, n2: Http.ApiError) => notificationDetailsEqual(n1, n2)
};

const StringEquality: UINotificationEquality<string> = {
  typeguard: (n: UINotificationType): n is string => typeof n === "string",
  func: (n1: string, n2: string) => n1 === n2
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
  UINotificationEquality<Http.ApiError>,
  UINotificationEquality<string>,
  UINotificationEquality<UIFieldNotification>,
  UINotificationEquality<UINotification>
] = [ErrorEquality, StringEquality, UIFieldNotificationEquality, UINotificationEquality];

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

const ErrorStandard: UINotificationStandard<Http.ApiError> = {
  typeguard: (n: UINotificationType): n is Http.ApiError =>
    n instanceof api.ClientError || n instanceof api.NetworkError || n instanceof api.ServerError,
  func: (e: Http.ApiError, opts?: Omit<UINotificationOptions, "behavior">) =>
    CentralStandardizer(
      {
        level: "error",
        message: "There was an error.",
        detail: e instanceof api.ClientError ? e.userFacingMessage : e.message,
        ...opts
      },
      opts
    )
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

const UINotificationDataStandard: UINotificationStandard<UINotificationData> = {
  typeguard: typeguards.isUiNotification,
  func: (e: UINotificationData) => e
};

const NotificationStandards: [
  UINotificationStandard<Http.ApiError>,
  UINotificationStandard<string>,
  UINotificationStandard<UIFieldNotification>,
  UINotificationStandard<UINotificationData>
] = [ErrorStandard, StringStandard, UIFieldNotificationStandard, UINotificationDataStandard];

export const standardizeNotificationData = (
  n: UINotificationType,
  opts?: Omit<UINotificationOptions, "behavior">
): UINotificationData | null => {
  for (let i = 0; i < NotificationStandards.length; i++) {
    const standard = NotificationStandards[i];
    if (standard.typeguard(n)) {
      const func = standard.func as (
        e: typeof n,
        opts?: Omit<UINotificationOptions, "behavior">
      ) => UINotificationData | null;
      return func(n, opts);
    }
  }
  console.warn(`Could not standardize notification ${objToJson(n)}!`);
  return null;
};

export const flattenFieldNotifications = (ns: (UIFieldNotification | api.FieldsError)[]): UIFieldNotification[] =>
  reduce(
    ns,
    (curr: UIFieldNotification[], e: api.FieldsError | UIFieldNotification) =>
      e instanceof api.FieldsError ? [...curr, ...e.errors] : [...curr, e],
    []
  );

export const combineFieldNotifications = (
  ns: (UIFieldNotification | api.FieldsError)[],
  opts?: Omit<UINotificationOptions, "behavior">
): UINotificationData | null => {
  /* If there is only a single field related error, just treat it as we would
     without assembling them together. */
  if (ns.length === 1) {
    return standardizeNotificationData(ns[0]);
  }
  return {
    message: opts?.message || "There were errors related to the following fields:",
    detail: api.stringifyResponseFieldErrors(flattenFieldNotifications(ns)).join("\n"),
    level: "warning"
  };
};
