import moment from "moment-timezone";
import { Moment } from "moment";
import { isNil } from "lodash";

import { localization } from "config";

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
export const toLocalizedMoment = (value?: string | Moment, options?: IDateOptions): Moment | undefined => {
  if (value === undefined) {
    value = moment();
  }
  const tz = options?.tz;
  if (typeof value === "string") {
    value = isNil(tz) ? moment.utc(value) : moment.tz(value, tz);
    if (!value.isValid()) {
      if (options?.warnOnInvalid !== false) {
        console.warn(`Value ${value} could not be converted to a valid moment.`);
      }
      return undefined;
    }
  }
  return isNil(tz) ? moment.utc(value) : value.tz(tz);
};

/**
 * Converts the moment from one formatting type into another specified moment
 *
 * @param {string} formatter  Formatter string used to dictate the convertion
 */
const Converter = (formatter: string) => (value?: string | null | Moment, options?: IDateOptions) => {
  if (value === null) {
    return "";
  }
  const mmt = toLocalizedMoment(value, options);
  if (isNil(mmt)) {
    return !isNil(options?.onError) ? options?.onError : undefined;
  }
  return mmt.format(formatter);
};

export const toDate = Converter(localization.MOMENT_DATE_FORMAT);
export const toDateTime = Converter(localization.MOMENT_DATETIME_FORMAT);
export const toApiDate = Converter(localization.MOMENT_API_DATE_FORMAT);
export const toApiDateTime = Converter(localization.MOMENT_API_DATETIME_FORMAT);
/**
 * Converts a provided string or Moment instance to a standardized
 * string representation of the date and time used for display in the UI.
 *
 * @param value:   Either a string date/time or a Moment instance that will
 *                 be converted to a datetime display format.
 */
export const toDisplayDateTime = Converter(localization.DATETIME_DISPLAY_FORMAT);
/**
 * Converts a provided string or Moment instance to a standardized
 * abbreviated string representation of the date and time used for display in
 * the UI.
 *
 * @param value:   Either a string date/time or a Moment instance that will
 *                 be converted to a datetime display format.
 */
export const toAbbvDisplayDateTime = Converter(localization.DATETIME_ABBV_DISPLAY_FORMAT);

/**
 * Converts a provided string or Moment instance to a standardized
 * string representation of the date used for display in the UI.
 *
 * @param value:   Either a string date/time or a Moment instance that will
 *                 be converted to a date display format.
 */
export const toDisplayDate = Converter(localization.DATE_DISPLAY_FORMAT);
/**
 * Converts a provided string or Moment instance to a standardized
 * string representation of the time used for display in the UI.
 *
 * @param value:   Either a string date/time or a Moment instance that will
 *                 be converted to a time display format.
 */
export const toDisplayTime = Converter(localization.TIME_DISPLAY_FORMAT);

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
