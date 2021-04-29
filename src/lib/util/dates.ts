import moment from "moment-timezone";
import { Moment } from "moment";
import { isNil } from "lodash";
import { mergeWithDefaults } from "lib/util";

import {
  MOMENT_API_DATETIME_FORMAT,
  MOMENT_API_DATE_FORMAT,
  DATETIME_DISPLAY_FORMAT,
  DATE_DISPLAY_FORMAT,
  TIME_DISPLAY_FORMAT,
  DATETIME_ABBV_DISPLAY_FORMAT,
  MOMENT_DATETIME_FORMAT,
  MOMENT_DATE_FORMAT
} from "config";

export const nowAsString = (): string => {
  const mmt = moment();
  return mmt.format(MOMENT_DATETIME_FORMAT);
};

interface IDateOptions {
  strict: boolean;
  onError: string | null;
  tz: string | null;
}

const createDefaultMergedOptions = (options?: Partial<IDateOptions>) => {
  return mergeWithDefaults<IDateOptions>(options || {}, {
    strict: false,
    tz: null,
    onError: null
  });
};

/**
 * Returns a moment cast to the specified timezone, not adding a timezone casts to utc time
 *
 * @param {(string | Moment)} value:            The value to be converted to a moment, defaults to utilizing utc
 * @param {Partial<IDateOptions>} [options]     Options used modify moment. The moment will be cast to tz, or utc if there is none
 * @returns {(Moment | undefined)}
 */
export const toLocalizedMoment = (value: string | Moment, options?: Partial<IDateOptions>): Moment | undefined => {
  const Options = createDefaultMergedOptions(options);
  if (typeof value === "string") {
    value = isNil(Options.tz) ? moment.utc(value) : moment.tz(value, Options.tz);
    if (!value.isValid()) {
      if (Options.strict === true) {
        throw new Error(`Value ${value} could not be converted to a valid date/time.`);
      } else {
        return undefined;
      }
    }
  }
  if (isNil(Options.tz)) {
    return moment.utc(value);
  }
  return value.tz(Options.tz);
};

/**
 * Converts the moment from one formatting type into another specified moment
 *
 * @param {string} formatter  Formatter string used to dictate the convertion
 */
const Converter = (formatter: string) => (value: string | Moment, options?: Partial<IDateOptions>) => {
  const Options = createDefaultMergedOptions(options);
  const mmt = toLocalizedMoment(value, Options);
  if (isNil(mmt)) {
    if (!isNil(Options.onError)) {
      return Options.onError;
    }
    return undefined;
  }
  return mmt.format(formatter);
};

export const toDate = Converter(MOMENT_DATE_FORMAT);
export const toDateTime = Converter(MOMENT_DATETIME_FORMAT);
export const toApiDate = Converter(MOMENT_API_DATE_FORMAT);
export const toApiDateTime = Converter(MOMENT_API_DATETIME_FORMAT);
/**
 * Converts a provided string or Moment instance to a standardized
 * string representation of the date and time used for display in the UI.
 *
 * @param value:   Either a string date/time or a Moment instance that will
 *                 be converted to a datetime display format.
 */
export const toDisplayDateTime = Converter(DATETIME_DISPLAY_FORMAT);
/**
 * Converts a provided string or Moment instance to a standardized
 * abbreviated string representation of the date and time used for display in
 * the UI.
 *
 * @param value:   Either a string date/time or a Moment instance that will
 *                 be converted to a datetime display format.
 */
export const toAbbvDisplayDateTime = Converter(DATETIME_ABBV_DISPLAY_FORMAT);

/**
 * Converts a provided string or Moment instance to a standardized
 * string representation of the date used for display in the UI.
 *
 * @param value:   Either a string date/time or a Moment instance that will
 *                 be converted to a date display format.
 */
export const toDisplayDate = Converter(DATE_DISPLAY_FORMAT);
/**
 * Converts a provided string or Moment instance to a standardized
 * string representation of the time used for display in the UI.
 *
 * @param value:   Either a string date/time or a Moment instance that will
 *                 be converted to a time display format.
 */
export const toDisplayTime = Converter(TIME_DISPLAY_FORMAT);

/**
 * A string representing a general time from now to the specified moment
 *
 * @param {string} value                        The time string, assumed to be in utc
 * @param {Partial<IDateOptions>} [options]     Options used modify moment. The moment will be cast to tz, or utc if there is none
 * @returns {string}                            String determining an amount of time lapse, in readable form
 */
export const toDisplayTimeSince = (value: string | Moment, options?: Partial<IDateOptions>): string => {
  const Options = createDefaultMergedOptions(options);
  const mmt = toLocalizedMoment(value, Options);
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
 * @param {(string | Moment)} value:          Either a string date/time or a Moment instance that will
 *                                            be converted to a date display format. A string is assumed
 *                                            to be in UTC.
 * @param {Partial<IDateOptions>} [options]   Options used modify moment. The moment will be cast to tz, or utc if there is none
 *
 * @returns {boolean}:                        Boolean as to whether the moment occured in the past 24 hours
 */
export const isToday = (value: string | Moment, options?: Partial<IDateOptions>): boolean => {
  const Options = createDefaultMergedOptions(options);
  const mmt = toLocalizedMoment(value, Options);
  const now = moment();

  const duration = moment.duration(now.diff(mmt));
  let days = duration.days();
  return days < 1 ? true : false;
};
