import moment from "moment-timezone";
import { Moment } from "moment";
import { isNil } from "lodash";

import * as config from "config";

type IDateOptions = {
  readonly warnOnInvalid?: boolean;
  readonly onError?: string | null;
  readonly tz?: string | null;
};

/**
 * Returns a moment cast to the specified timezone, not adding a timezone casts
 * to UTC time.
 *
 * @param {(string | Moment)} value:
 *   The value to be converted to a moment, defaults to utilizing utc
 * @param {IDateOptions} [options]
 *   Options used modify moment. The moment will be cast to tz, or utc if
 *   there is none.
 * @returns {(Moment | undefined)}
 */
export const toMoment = (value?: string | Moment | Date, options?: IDateOptions): Moment | undefined => {
  if (value === undefined) {
    value = moment();
  }
  if (typeof value === "string" || value instanceof Date) {
    value = moment(value);
    if (!value.isValid()) {
      if (options?.warnOnInvalid !== false) {
        console.warn(`Value ${String(value)} could not be converted to a valid moment.`);
      }
      return undefined;
    }
    return value;
  }
  return value;
};

/**
 * Returns a moment cast to the specified timezone, not adding a timezone casts
 * to UTC time.
 *
 * @param {(string | Moment)} value:
 *   The value to be converted to a moment, defaults to utilizing utc
 * @param {IDateOptions} [options]
 *   Options used modify moment. The moment will be cast to tz, or utc if
 *   there is none.
 * @returns {(Moment | undefined)}
 */
export const toLocalizedMoment = (value?: string | Moment, options?: IDateOptions): Moment | undefined => {
  if (value === undefined) {
    value = moment();
  }
  const tz = options?.tz;
  if (typeof value === "string" || value instanceof Date) {
    value = isNil(tz) ? moment.utc(value) : moment.tz(value, tz);
    if (!value.isValid()) {
      if (options?.warnOnInvalid !== false) {
        console.warn(`Value ${String(value)} could not be converted to a valid moment.`);
      }
      return undefined;
    }
    return value;
  }
  return isNil(tz) ? moment.utc(value) : value.tz(tz);
};

/**
 * Converts the moment from one formatting type into another specified moment
 * with provided formatting.  Moment will be localized in UTC or the timezone
 * provided.
 *
 * @param {string} formatter  Formatter string used to dictate the convertion
 */
const LocalizedConverter = (formatter: string) => (value?: string | null | Moment, options?: IDateOptions) => {
  if (value === null) {
    return "";
  }
  const mmt = toLocalizedMoment(value, options);
  if (isNil(mmt)) {
    return !isNil(options?.onError) ? options?.onError : undefined;
  }
  return mmt.format(formatter);
};

/**
 * Converts the moment from one formatting type into another specified moment
 * with provided formatting without timezone considerations.
 *
 * @param {string} formatter  Formatter string used to dictate the convertion
 */
const Converter = (formatter: string) => (value?: string | null | Moment, options?: Omit<IDateOptions, "tz">) => {
  if (value === null) {
    return "";
  }
  const mmt = toMoment(value, options);
  if (isNil(mmt)) {
    return !isNil(options?.onError) ? options?.onError : undefined;
  }
  return mmt.format(formatter);
};

export const toLocalizedDate = LocalizedConverter(config.localization.MOMENT_DATE_FORMAT);
export const toDate = Converter(config.localization.MOMENT_DATE_FORMAT);
export const toLocalizedDateTime = LocalizedConverter(config.localization.MOMENT_DATETIME_FORMAT);
export const toDateTime = Converter(config.localization.MOMENT_DATETIME_FORMAT);
export const toLocalizedApiDate = LocalizedConverter(config.localization.MOMENT_API_DATE_FORMAT);
export const toApiDate = Converter(config.localization.MOMENT_API_DATE_FORMAT);
export const toLocalizedApiDateTime = LocalizedConverter(config.localization.MOMENT_API_DATETIME_FORMAT);
export const toApiDateTime = Converter(config.localization.MOMENT_API_DATETIME_FORMAT);
/**
 * Converts a provided string or Moment instance to a standardized
 * string representation of the date and time used for display in the UI.
 *
 * @param value:   Either a string date/time or a Moment instance that will
 *                 be converted to a datetime display format.
 */
export const toLocalizedDisplayDateTime = LocalizedConverter(config.localization.DATETIME_DISPLAY_FORMAT);
export const toDisplayDateTime = Converter(config.localization.DATETIME_DISPLAY_FORMAT);

/**
 * Converts a provided string or Moment instance to a standardized
 * abbreviated string representation of the date and time used for display in
 * the UI.
 *
 * @param value:   Either a string date/time or a Moment instance that will
 *                 be converted to a datetime display format.
 */
export const toLocalizedAbbvDisplayDateTime = LocalizedConverter(config.localization.DATETIME_ABBV_DISPLAY_FORMAT);
export const toAbbvDisplayDateTime = Converter(config.localization.DATETIME_ABBV_DISPLAY_FORMAT);

/**
 * Converts a provided string or Moment instance to a standardized
 * string representation of the date used for display in the UI.
 *
 * @param value:   Either a string date/time or a Moment instance that will
 *                 be converted to a date display format.
 */
export const toLocalizedDisplayDate = LocalizedConverter(config.localization.DATE_DISPLAY_FORMAT);
export const toDisplayDate = Converter(config.localization.DATE_DISPLAY_FORMAT);
/**
 * Converts a provided string or Moment instance to a standardized
 * string representation of the time used for display in the UI.
 *
 * @param value:   Either a string date/time or a Moment instance that will
 *                 be converted to a time display format.
 */
export const toLocalizedDisplayTime = LocalizedConverter(config.localization.TIME_DISPLAY_FORMAT);
export const toDisplayTime = Converter(config.localization.TIME_DISPLAY_FORMAT);

/**
 * A string representing a general time from now to the specified moment
 *
 * @param {string} value
 *   The time string, assumed to be in utc
 * @param {IDateOptions} [options]
 *   Options used modify moment. The moment will be cast to tz, or utc if there
 *   is none.
 * @returns {string}
 *   String determining an amount of time lapse, in readable form
 */
export const toDisplayTimeSince = (value: string | Moment, options?: IDateOptions): string => {
  const mmt = toLocalizedMoment(value, options);
  const now = moment();

  const duration = moment.duration(now.diff(mmt));
  let days = duration.days();
  if (days < 1) {
    let hours = duration.asHours();
    if (hours < 1) {
      const minutes = duration.asMinutes();
      if (minutes < 1) {
        const seconds = duration.asSeconds();
        if (parseInt(String(seconds)) === 1) {
          return "1 second ago";
        }
        return `${parseInt(String(seconds))} seconds ago`;
      }
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

/**
 * Determines whether or not the specified moment occured within the past 24 hours
 *
 * @param {(string | Moment)} value:
 *   Either a string date/time or a Moment instance that will be converted to a
 *   date display format. A string is assumed to be in UTC.
 * @param {IDateOptions} [options]
 *   Options used modify moment. The moment will be cast to tz, or utc if there
 *   is none.
 * @returns {boolean}:
 *   Boolean as to whether the moment occured in the past 24 hours
 */
export const isToday = (value: string | Moment, options?: IDateOptions): boolean => {
  const mmt = toLocalizedMoment(value, options);
  const now = moment();
  const duration = moment.duration(now.diff(mmt));
  const days = duration.days();
  return days < 1 ? true : false;
};
