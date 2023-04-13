import { config } from "application";

import * as formatter from "./formatter";
import * as schemas from "./schemas";
import * as types from "./types";

export const currencyFormatter = formatter.createFormatter<types.Currency>(schemas.CurrencySchema);

export const percentFormatter = formatter.createFormatter<types.Percent>(schemas.PercentSchema);

export const createLocalizationFormatter = <
  T extends config.localization.LocalizationType,
  C extends config.localization.LocalizationCodes[T] = config.localization.LocalizationCodes[T],
>(
  type: T,
  code: C,
) => {
  const schema = schemas.createLocalizationSchema(type, code);
  return formatter.createFormatter<string>(schema);
};

export const dateFormatter = (code: config.localization.LocalizationCodes["date"]) =>
  createLocalizationFormatter<"date">("date", code);

export const timeFormatter = (code: config.localization.LocalizationCodes["time"]) =>
  createLocalizationFormatter<"time">("time", code);

export const dateTimeFormatter = (code: config.localization.LocalizationCodes["datetime"]) =>
  createLocalizationFormatter<"datetime">("datetime", code);

export const timeSinceFormatter = formatter.createFormatter<string>(
  schemas.DateTimeDifferenceSchema,
);

export const phoneNumberFormatter = formatter.createFormatter<string>(schemas.PhoneNumberSchema);

export const titleCaseFormatter = formatter.createFormatter<string>(schemas.TitleCaseSchema);
