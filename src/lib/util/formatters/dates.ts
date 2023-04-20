import { Moment } from "moment";
import moment from "moment-timezone";
import { z } from "zod";

import { config } from "application";

import * as formatter from "./formatter";

const DateLikeSchema = z.union([z.number(), z.string(), z.date()]);
export const DateSchema = DateLikeSchema.pipe(z.coerce.date());

export type DatePrimitive = string | number | Date;

export const MomentSchema: z.ZodType<Moment, z.ZodTypeDef, DatePrimitive> =
  DateSchema.transform<Moment>(value => {
    const mmt = moment(value);
    /* Since the 'DateSchema' should guarantee that the value is in fact a valid Date, this is an
     extreme edge case - but something that should be caught early. */
    if (!mmt.isValid()) {
      throw new Error(
        "The date object returned from the 'DateSchema' is invalid and cannot be used to " +
          "construct a Moment object.",
      );
    }
    return mmt;
  });

export const LocalizedMomentSchema = (timezone?: string | null): typeof MomentSchema =>
  MomentSchema.transform<Moment>(value =>
    timezone === null || timezone === undefined ? value : (value.tz(timezone) as Moment),
  );

export const createLocalizationSchema = <
  T extends config.localization.LocalizationType,
  C extends config.localization.LocalizationCodes[T],
>(
  type: T,
  localizationCode: C,
) => {
  const localizationFormat = config.localization.getLocalization<T, C>(type, localizationCode);
  return DateSchema.transform<DatePrimitive>((value): string =>
    moment(value).format(localizationFormat),
  );
};

export const createDateLocalizationSchema = <
  C extends config.localization.LocalizationCodes["date"],
>(
  localizationCode: C,
) => createLocalizationSchema("date", localizationCode);

export const createDateTimeLocalizationSchema = <
  C extends config.localization.LocalizationCodes["datetime"],
>(
  localizationCode: C,
) => createLocalizationSchema("datetime", localizationCode);

export const createTimeLocalizationSchema = <
  C extends config.localization.LocalizationCodes["time"],
>(
  localizationCode: C,
) => createLocalizationSchema("time", localizationCode);

// TODO: Incorporate timezone.
export const DateTimeDifferenceSchema = DateSchema.transform<string>(value => {
  const now = moment(Date.now());
  const provided = moment(value);

  const duration = moment.duration(now.diff(provided));
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
  }
  days = parseInt(String(days));
  if (days === 1) {
    return "1 day ago";
  }
  return `${days} days ago`;
});

export const createLocalizationFormatter = <
  T extends config.localization.LocalizationType,
  C extends config.localization.LocalizationCodes[T] = config.localization.LocalizationCodes[T],
>(
  type: T,
  code: C,
) => {
  const schema = createLocalizationSchema(type, code);
  return formatter.createFormatter<DatePrimitive>(schema);
};

export const dateFormatter = (code: config.localization.LocalizationCodes["date"]) =>
  createLocalizationFormatter<"date">("date", code);

export const timeFormatter = (code: config.localization.LocalizationCodes["time"]) =>
  createLocalizationFormatter<"time">("time", code);

export const dateTimeFormatter = (code: config.localization.LocalizationCodes["datetime"]) =>
  createLocalizationFormatter<"datetime">("datetime", code);

export const localizedMomentFormatter = (timezone?: string | null) =>
  formatter.createFormatter<Moment>(LocalizedMomentSchema(timezone));

export const timeSinceFormatter = formatter.createFormatter<string>(DateTimeDifferenceSchema);
