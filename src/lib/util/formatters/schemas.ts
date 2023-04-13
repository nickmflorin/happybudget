import moment from "moment-timezone";
import { z } from "zod";

import { config } from "application";

import * as types from "./types";

export const CurrencySchema: z.ZodType<types.Currency, z.ZodTypeDef, unknown> = z
  .custom<string | number>(
    val => typeof val === "string" || typeof val === "number",
    params => ({
      message: `The provided value ${JSON.stringify(
        params.input,
      )} is not a string or a number and cannot be parsed as a currency formatted value.`,
    }),
  )
  .transform<types.Currency>((value, ctx): types.Currency => {
    const numeric = typeof value === "string" ? parseFloat(value) : value;
    if (!isNaN(numeric)) {
      return numeric.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,") as types.Currency;
    }
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      params: {
        received: value,
        expected: "A number formatted as a string or a number.",
      },
      message:
        typeof value === "string"
          ? "The provided value does not represent a stringified valid number."
          : "The provided value is NaN.",
    });
    return z.NEVER;
  });

export const PercentSchema: z.ZodType<types.Percent, z.ZodTypeDef, unknown> = z
  .custom<string | number>(
    val => typeof val === "string" || typeof val === "number",
    params => ({
      message: `The provided value ${JSON.stringify(
        params.input,
      )} is not a string or a number and cannot be parsed as a percent formatted value.`,
    }),
  )
  .transform<types.Percent>((value, ctx): types.Percent => {
    const numeric = typeof value === "string" ? parseFloat(value) : value;
    if (!isNaN(numeric)) {
      return numeric.toLocaleString(undefined, {
        style: "percent",
        minimumFractionDigits: 2,
      }) as types.Percent;
    }
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      params: {
        received: value,
        expected: "A number formatted as a string or a number.",
      },
      message:
        typeof value === "string"
          ? "The provided value does not represent a stringified valid number."
          : "The provided value is NaN.",
    });
    return z.NEVER;
  });

/**
 * A schema that converts a string to a number, removing non integer values from the string in the
 * case that it fails to parse as a number.
 */
export const FlexibleNumericSchema = z
  .custom<string | number>(
    (value: unknown) => typeof value === "string" || typeof value === "number",
  )
  .transform<number>((val, ctx) => {
    if (typeof val === "number") {
      return val;
    }
    let parsed = z.coerce.number().safeParse(val);
    if (parsed.success) {
      return parsed.data;
    }
    const stringValue: string = val.replace(/[^0-9.-]+/g, "");
    parsed = z.coerce.number().safeParse(stringValue);
    if (parsed.success) {
      return parsed.data;
    }
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      params: {
        received: val,
        expected: "A number formatted as a string or a number.",
      },
      message: "The value cannot be properly parsed as a number.",
    });
    return z.NEVER;
  });

export const PercentToDecimalSchema = z
  .custom<string | number>(
    (value: unknown) => typeof value === "string" || typeof value === "number",
  )
  .transform<number>((val, ctx) => {
    if (typeof val === "number") {
      return val;
    }
    const parsed = z.coerce.number().safeParse(val);
    if (parsed.success) {
      return parsed.data / 100;
    }
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      params: {
        received: val,
        expected: "A number formatted as a string or a number.",
      },
      message: "The value cannot be properly parsed as a decimal.",
    });
    return z.NEVER;
  });

const DateLikeSchema = z.union([z.number(), z.string(), z.date()]);
export const DateSchema = DateLikeSchema.pipe(z.coerce.date());

export const createLocalizationSchema = <
  T extends config.localization.LocalizationType,
  C extends config.localization.LocalizationCodes[T],
>(
  type: T,
  localizationCode: C,
) => {
  const localizationFormat = config.localization.getLocalization<T, C>(type, localizationCode);
  return DateSchema.transform<string>((value): string => moment(value).format(localizationFormat));
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

export const PhoneNumberSchema = z.union([z.string(), z.number()]).transform<string>(v => {
  const numeric = String(v).replace(/\D/g, "");
  if (numeric.length >= 12) {
    // Don't format string.
    return numeric;
  } else if (numeric.length === 11 || numeric.length === 10) {
    const match = /^(1|)?(\d{3})(\d{3})(\d{4})$/.exec(numeric);
    if (match) {
      const intlCode = match[1] ? "+1 " : "";
      return [intlCode, "(", match[2], ") ", match[3], " ", match[4]].join("");
    } else {
      return numeric;
    }
  } else if (numeric.length < 3) {
    return numeric;
  }
  const firstPart = "(" + numeric.slice(0, 3) + ")";
  if (numeric.length === 3) {
    return firstPart;
  }
  const secondPart = numeric.slice(3, 6);
  if (numeric.length <= 6) {
    return firstPart + " " + secondPart;
  }
  const thirdPart = numeric.slice(6, 10);
  return firstPart + " " + secondPart + " " + thirdPart;
});

export const TitleCaseSchema = z.string().transform<string>(value =>
  value.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  }),
);
