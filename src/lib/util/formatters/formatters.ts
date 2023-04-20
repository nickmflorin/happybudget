import * as formatter from "./formatter";
import * as schemas from "./schemas";
import * as types from "./types";

export const currencyFormatter = formatter.createFormatter<types.Currency>(schemas.CurrencySchema);

export const percentFormatter = formatter.createFormatter<types.Percent>(schemas.PercentSchema);

export const phoneNumberFormatter = formatter.createFormatter<string>(schemas.PhoneNumberSchema);

export const titleCaseFormatter = formatter.createFormatter<string>(schemas.TitleCaseSchema);
