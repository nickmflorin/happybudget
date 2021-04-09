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
  MOMENT_DATE_FORMAT,
  DEFAULT_TZ
} from "config";

export const nowAsString = (): string => {
  const mmt = moment();
  return mmt.format(MOMENT_DATETIME_FORMAT);
};

interface IDateOptions {
  strict: boolean;
  onError: string | null;
  tz: string;
}

export const toMoment = (value: string | Moment, options?: Partial<IDateOptions>): Moment | undefined => {
  const Options = mergeWithDefaults<IDateOptions>(options || {}, {
    strict: false,
    tz: DEFAULT_TZ,
    onError: null
  });
  if (typeof value === "string") {
    value = moment(moment(value).toDate()) as Moment;
    if (!value.isValid()) {
      if (Options.strict === true) {
        throw new Error(`Value ${value} could not be converted to a valid date/time.`);
      } else {
        return undefined;
      }
    }
  }
  return value;
};

export const toLocalizedMoment = (value: string | Moment, options?: Partial<IDateOptions>): Moment | undefined => {
  const Options = mergeWithDefaults<IDateOptions>(options || {}, {
    strict: false,
    tz: DEFAULT_TZ,
    onError: null
  });
  if (typeof value === "string") {
    value = moment(moment(value).toDate()) as Moment;
    if (!value.isValid()) {
      if (Options.strict === true) {
        throw new Error(`Value ${value} could not be converted to a valid date/time.`);
      } else {
        return undefined;
      }
    }
  }
  return value.tz(Options.tz);
};

const Converter = (formatter: string) => (value: string | Moment, options?: Partial<IDateOptions>) => {
  const Options = mergeWithDefaults<IDateOptions>(options || {}, {
    strict: false,
    tz: DEFAULT_TZ,
    onError: null
  });
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

export const toDisplayTimeSince = (value: string | Moment, options?: Partial<IDateOptions>): string => {
  const Options = mergeWithDefaults<IDateOptions>(options || {}, {
    strict: false,
    tz: DEFAULT_TZ,
    onError: null
  });
  const mmt = toLocalizedMoment(value, Options);
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
