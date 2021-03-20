import moment from "moment-timezone";
import { Moment } from "moment";
import { isNil } from "lodash";

import {
  MOMENT_DATETIME_FORMAT,
  MOMENT_DATE_FORMAT,
  MOMENT_URL_DATETIME_FORMAT,
  MOMENT_URL_DATE_FORMAT,
  DATETIME_DISPLAY_FORMAT,
  DATE_DISPLAY_FORMAT,
  TIME_DISPLAY_FORMAT,
  DATETIME_ABBV_DISPLAY_FORMAT
} from "config";

export const nowAsString = (): string => {
  const mmt = moment();
  return mmt.format(MOMENT_DATETIME_FORMAT);
};

export const momentToDateTimeUrlString = (mmt: Moment): string => {
  if (!mmt.isValid()) {
    throw new Error("Cannot convert invalid moment to string.");
  }
  return mmt.format(MOMENT_URL_DATETIME_FORMAT);
};

export const momentToDateUrlString = (mmt: Moment): string => {
  if (!mmt.isValid()) {
    throw new Error("Cannot convert invalid moment to string.");
  }
  return mmt.format(MOMENT_URL_DATE_FORMAT);
};

export const momentToDateString = (mmt: Moment): string => {
  if (!mmt.isValid()) {
    throw new Error("Cannot convert invalid moment to string.");
  }
  return mmt.format(MOMENT_DATE_FORMAT);
};

export const momentToDateTimeString = (mmt: Moment): string => {
  if (!mmt.isValid()) {
    throw new Error("Cannot convert invalid moment to string.");
  }
  return mmt.format(MOMENT_DATETIME_FORMAT);
};

interface IDateOptions {
  strict?: boolean;
  defaultTz?: string;
  onError?: string;
  tz?: string | undefined;
}

export const toLocalizedMoment = (
  value: string | Moment,
  options: IDateOptions = { tz: undefined, strict: false, defaultTz: "America/Toronto" }
): Moment | undefined => {
  if (typeof value === "string") {
    value = moment(moment.utc(value).toDate()) as Moment;
    if (!value.isValid()) {
      if (options.strict === true) {
        throw new Error(`Value ${value} could not be converted to a valid date/time.`);
      } else {
        return undefined;
      }
    }
  }
  let timezone = options.tz;
  if (isNil(timezone)) {
    timezone = options.defaultTz;
  }
  if (isNil(timezone)) {
    throw new Error("Cannot determine the timezone.");
  }
  return value.tz(timezone);
};

/**
 * Converts a provided string or Moment instance to a standardized
 * string representation of the date and time used for display in the UI.
 *
 * @param value:   Either a string date/time or a Moment instance that will
 *                 be converted to a datetime display format.
 */
export const toDisplayDateTime = (
  value: string | Moment,
  options: IDateOptions = { tz: undefined, strict: false, defaultTz: "America/Toronto", onError: "" }
): string => {
  const mmt = toLocalizedMoment(value, options);
  if (isNil(mmt)) {
    if (!isNil(options.onError)) {
      return options.onError;
    }
    return "";
  }
  return mmt.format(DATETIME_DISPLAY_FORMAT);
};

/**
 * Converts a provided string or Moment instance to a standardized
 * abbreviated string representation of the date and time used for display in
 * the UI.
 *
 * @param value:   Either a string date/time or a Moment instance that will
 *                 be converted to a datetime display format.
 */
export const toAbbvDisplayDateTime = (
  value: string | Moment,
  options: IDateOptions = { tz: undefined, strict: false, defaultTz: "America/Toronto", onError: "" }
): string => {
  const mmt = toLocalizedMoment(value, options);
  if (isNil(mmt)) {
    if (!isNil(options.onError)) {
      return options.onError;
    }
    return "";
  }
  return mmt.format(DATETIME_ABBV_DISPLAY_FORMAT);
};

/**
 * Converts a provided string or Moment instance to a standardized
 * string representation of the date used for display in the UI.
 *
 * @param value:   Either a string date/time or a Moment instance that will
 *                 be converted to a date display format.
 */
export const toDisplayDate = (
  value: string | Moment,
  options: IDateOptions = { tz: undefined, strict: false, defaultTz: "America/Toronto", onError: "" }
): string | undefined => {
  const mmt = toLocalizedMoment(value, options);
  if (isNil(mmt)) {
    if (!isNil(options.onError)) {
      return options.onError;
    }
    return "";
  }
  return mmt.format(DATE_DISPLAY_FORMAT);
};

/**
 * Converts a provided string or Moment instance to a standardized
 * string representation of the time used for display in the UI.
 *
 * @param value:   Either a string date/time or a Moment instance that will
 *                 be converted to a time display format.
 */
export const toDisplayTime = (
  value: string | Moment,
  options: IDateOptions = { tz: undefined, strict: false, defaultTz: "America/Toronto", onError: "" }
): string | undefined => {
  const mmt = toLocalizedMoment(value, options);
  if (isNil(mmt)) {
    if (!isNil(options.onError)) {
      return options.onError;
    }
    return undefined;
  }
  return mmt.format(TIME_DISPLAY_FORMAT);
};

export const toDisplayTimeSince = (
  value: string | Moment,
  options: IDateOptions = { tz: undefined, strict: false, defaultTz: "America/Toronto", onError: "" }
): string => {
  const mmt = toLocalizedMoment(value, options);
  const now = moment();

  const duration = moment.duration(now.diff(mmt));
  let days = duration.days();
  if (days < 1) {
    let hours = duration.asHours();
    if (hours < 1) {
      const minutes = duration.asMinutes();
      if (parseInt(String(minutes)) === 1) {
        return "1 minute ago";
      }
      return `${parseInt(String(minutes))} minutes ago`;
    } else {
      hours = parseInt(String(hours));
      if (hours === 1) {
        return "1 hour ago";
      }
      return `${hours} hours ago`;
    }
  } else {
    days = parseInt(String(days));
    if (days === 1) {
      return "1 day ago";
    }
    return `${days} days ago`;
  }
};
