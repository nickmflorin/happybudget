import { Moment } from "moment";

import { logger } from "internal";

import { toDisplayDate } from "../dates";

import * as types from "./types";

type Fmt<T extends types.FormatValue = string | number> = (
  v: T,
  opts: types.FormatterOpts<T>,
) => string;

type RT<
  T extends types.FormatValue = string | number,
  P extends types.FormatterArgChoices<T> = types.FormatterArgChoices<T>,
> = P extends types.FormatterParams<T> ? string : types.Formatter<T>;

/**
 * @deprecated
 */
const formatAs = <
  T extends types.FormatValue = string | number,
  O extends types.FormatterOpts<T> = types.FormatterOpts<T>,
  P extends types.FormatterArgChoices<T> = types.FormatterArgChoices<T>,
>(
  fmt: Fmt<T>,
  fmtType: types.FormatType,
  p: P,
): RT<T, P> => {
  const valuedFormatter = (params: types.FormatterParams<T>, options: O): string => {
    const v: T | null = types.isTableFormatterParams(params) ? params.value : params;
    if (v === null || (typeof v === "string" && v.trim() === "")) {
      return "";
    }
    return fmt(v, options);
  };

  if (types.isFormatterParams(p)) {
    return valuedFormatter(p, {
      onError: (v: T) => logger.error(`Could not parse value ${String(v)} into ${fmtType}!`),
    } as O) as RT<T, P>;
  } else if (types.isErrorHandler(p)) {
    const opts = { onError: p } as O;
    return ((params: types.FormatterParams<T>) => valuedFormatter(params, opts)) as RT<T, P>;
  } else {
    return ((params: types.FormatterParams<T>) => valuedFormatter(params, p as unknown as O)) as RT<
      T,
      P
    >;
  }
};

/**
 * @deprecated
 */
export const currencyFormatter = <P extends types.FormatterArgChoices<string | number>>(
  params: P,
) =>
  formatAs<string | number, types.FormatterOpts, P>(
    (v: string | number, opts: types.FormatterOpts) => {
      const numericValue = parseFloat(String(v));
      if (isNaN(numericValue)) {
        if (types.isFormatterCallbackOpts(opts)) {
          opts.onError(v);
          return "";
        }
        return opts.errorValue;
      }
      return numericValue.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");
    },
    "currency",
    params,
  );

/**
 * @deprecated
 */
export const percentageFormatter = <P extends types.FormatterArgChoices<string | number>>(
  params: P,
) =>
  formatAs<string | number, types.FormatterOpts, P>(
    (v: string | number, opts: types.FormatterOpts) => {
      const numericValue = parseFloat(String(v));
      if (isNaN(numericValue)) {
        if (types.isFormatterCallbackOpts(opts)) {
          opts.onError(v);
          return "";
        }
        return opts.errorValue;
      }
      return Number(v).toLocaleString(undefined, { style: "percent", minimumFractionDigits: 2 });
    },
    "percentage",
    params,
  );

/**
 * @deprecated
 */
export const phoneNumberFormatter = <P extends types.FormatterArgChoices<string | number>>(
  params: P,
) =>
  formatAs<string | number, types.FormatterOpts, P>(
    (v: string | number) => {
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
      } else {
        if (numeric.length < 3) {
          return numeric;
        } else {
          const firstPart = "(" + numeric.slice(0, 3) + ")";
          if (numeric.length === 3) {
            return firstPart;
          } else {
            const secondPart = numeric.slice(3, 6);
            if (numeric.length <= 6) {
              return firstPart + " " + secondPart;
            } else {
              const thirdPart = numeric.slice(6, 10);
              return firstPart + " " + secondPart + " " + thirdPart;
            }
          }
        }
      }
    },
    "phoneNumber",
    params,
  );

/**
 * @deprecated
 */
export const dateFormatter = <P extends types.FormatterArgChoices<string | Moment>>(params: P) =>
  formatAs<string | Moment, types.FormatterOpts<string | Moment>, P>(
    (v: string | Moment, opts: types.FormatterOpts<string | Moment>) => {
      const formatted = toDisplayDate(v);
      if (formatted === undefined) {
        if (types.isFormatterCallbackOpts(opts)) {
          opts.onError(v);
          return "";
        }
        return opts.errorValue;
      }
      return formatted;
    },
    "percentage",
    params,
  );

/**
 * @deprecated
 */
export const titleCaseFormatter = <P extends types.FormatterArgChoices<string>>(params: P) =>
  formatAs<string, types.FormatterOpts<string>, P>(
    (v: string) =>
      v.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      }),
    "percentage",
    params,
  );
