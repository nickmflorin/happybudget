import { enumeratedLiterals } from "lib/util/literals";

export const DateLocalizationCodes = enumeratedLiterals(["DISPLAY", "API"] as const);
export type DateLocalizationCode = import("lib/util/types").EnumeratedLiteralType<
  typeof DateLocalizationCodes
>;

export const TimeLocalizationCodes = enumeratedLiterals(["DISPLAY"] as const);
export type TimeLocalizationCode = import("lib/util/types").EnumeratedLiteralType<
  typeof TimeLocalizationCodes
>;

export const DateTimeLocalizationCodes = enumeratedLiterals([
  "ABBREVIATED",
  "DISPLAY",
  "API",
] as const);
export type DateTimeLocalizationCode = import("lib/util/types").EnumeratedLiteralType<
  typeof DateTimeLocalizationCodes
>;

export const DateLocalizations = {
  [DateLocalizationCodes.DISPLAY]: "MM/DD/YYYY" as const,
  [DateLocalizationCodes.API]: "YYYY-MM-DD" as const,
};

export type DateLocalization = typeof DateLocalizations[keyof typeof DateLocalizations];

export const TimeLocalizations = {
  [TimeLocalizationCodes.DISPLAY]: "hh:mm A" as const,
};

export type TimeLocalization = typeof TimeLocalizations[keyof typeof TimeLocalizations];

export const DateTimeLocalizations = {
  [DateTimeLocalizationCodes.DISPLAY]: "MMM D, YYYY h:mm:ss A" as const,
  [DateTimeLocalizationCodes.ABBREVIATED]: "lll" as const,
  [DateTimeLocalizationCodes.API]: "YYYY-MM-DD HH:mm:ss" as const,
};

export type DateTimeLocalization = typeof DateTimeLocalizations[keyof typeof DateTimeLocalizations];

export const LocalizationTypes = enumeratedLiterals(["time", "date", "datetime"] as const);
export type LocalizationType = import("lib/util/types").EnumeratedLiteralType<
  typeof LocalizationTypes
>;

export type Localizations = {
  date: typeof DateLocalizations & Record<DateLocalizationCode, string>;
  time: typeof TimeLocalizations & Record<TimeLocalizationCode, string>;
  datetime: typeof DateTimeLocalizations & Record<DateTimeLocalizationCode, string>;
};

export type LocalizationCodes = { [key in LocalizationType]: keyof Localizations[key] };

export const AllLocalizations: Localizations = {
  date: DateLocalizations,
  time: TimeLocalizations,
  datetime: DateTimeLocalizations,
};

export const getLocalization = <T extends LocalizationType, C extends LocalizationCodes[T]>(
  type: T,
  code: C,
): Localizations[T][C] & string => AllLocalizations[type][code] as Localizations[T][C] & string;
