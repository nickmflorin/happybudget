import React from "react";
import { includes, isNil } from "lodash";

export const iconIsJSX = (icon: IconOrElement): icon is JSX.Element => React.isValidElement(icon);

export const clickableIconIsCallback = (icon: ClickableIconOrElement): icon is ClickableIconCallback =>
  typeof icon === "function";

export const isRawFormNotification = (obj: FormNotification): obj is RawFormNotification =>
  /* eslint-disable-next-line indent */
  (obj as FormNotificationWithMeta<string | Error>).notification === undefined;

export const isFormFieldNotification = (obj: FormNotification): obj is FormFieldNotification =>
  (obj as FormFieldNotification).field !== undefined;

export const isAlert = (a: IAlert | any): a is IAlert =>
  !isNil(a) &&
  typeof a === "object" &&
  (a as IAlert).type !== undefined &&
  includes(["error", "warning", "info", "success"], (a as IAlert).type);
