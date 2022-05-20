import { Moment } from "moment";
import { toDisplayDate } from "./util/dates";

type Fmt<T extends string | number | Moment = string | number, O extends FormatterOpts<T> = FormatterOpts<T>> = (
  v: T,
  opts: O
) => string;

type PARAMS<T extends string | number | Moment = string | number, O extends FormatterOpts<T> = FormatterOpts<T>> =
  | FormatterParams<T>
  | O
  | OnFormatError<T>;

type RT<
  T extends string | number | Moment = string | number,
  O extends FormatterOpts<T> = FormatterOpts<T>,
  P extends PARAMS<T, O> = PARAMS<T, O>
> = P extends FormatterParams<T> ? string : Formatter<T>;

const isNotFormatterParams = <
  T extends string | number | Moment = string | number,
  O extends FormatterOpts<T> = FormatterOpts<T>
>(
  p: PARAMS<T, O>
): p is FormatterParams<T> =>
  typeof p === "function" || (typeof p === "object" && Object.prototype.hasOwnProperty.call(p, "value"));

const isFormatterParams = <
  T extends string | number | Moment = string | number,
  O extends FormatterOpts<T> = FormatterOpts<T>
>(
  p: PARAMS<T, O>
): p is FormatterParams<T> => !isNotFormatterParams(p);

const isErrorHandler = <
  T extends string | number | Moment = string | number,
  O extends FormatterOpts<T> = FormatterOpts<T>
>(
  p: PARAMS<T, O>
): p is OnFormatError<T> => typeof p === "function";

export const isAgFormatterParams = <T extends string | number | Moment = string | number>(
  params: NativeFormatterParams<T> | AGFormatterParams
): params is AGFormatterParams => typeof params === "object";

const formatAs = <
  T extends string | number | Moment = string | number,
  O extends FormatterOpts<T> = FormatterOpts<T>,
  P extends PARAMS<T, O> = PARAMS<T, O>
>(
  fmt: Fmt<T, O>,
  fmtType: FormatType,
  p: P
): RT<T, O, P> => {
  const valuedFormatter = (params: FormatterParams<T>, options: O): string => {
    const v: T | null = isAgFormatterParams(params) ? params.value : params;
    if (v === null || (typeof v === "string" && v.trim() === "")) {
      return "";
    }
    return fmt(v, options);
  };

  if (isFormatterParams(p)) {
    return valuedFormatter(p, {
      onError: (v: T) => console.error(`Could not parse value ${String(v)} into ${fmtType}!`)
    } as O) as RT<T, O, P>;
  } else if (isErrorHandler(p)) {
    const opts = { onError: p } as O;
    return ((params: FormatterParams<T>) => valuedFormatter(params, opts)) as RT<T, O, P>;
  } else {
    return ((params: FormatterParams<T>) => valuedFormatter(params, p as unknown as O)) as RT<T, O, P>;
  }
};

export const currencyFormatter = <P extends PARAMS<string | number, FormatterOpts<string | number>>>(params: P) =>
  formatAs<string | number, FormatterOpts, P>(
    (v: string | number, opts: FormatterOpts) => {
      const numericValue = parseFloat(String(v));
      if (isNaN(numericValue)) {
        opts.onError?.(v);
        return opts.errorValue || "";
      }
      return numericValue.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");
    },
    "currency",
    params
  );

export const percentageFormatter = <P extends PARAMS<string | number, FormatterOpts>>(params: P) =>
  formatAs<string | number, FormatterOpts, P>(
    (v: string | number, opts: FormatterOpts) => {
      const numericValue = parseFloat(String(v));
      if (isNaN(numericValue)) {
        opts.onError?.(v);
        return opts.errorValue || "";
      }
      return Number(v).toLocaleString(undefined, { style: "percent", minimumFractionDigits: 2 });
    },
    "percentage",
    params
  );

export const phoneNumberFormatter = <P extends PARAMS<string | number, FormatterOpts>>(params: P) =>
  formatAs<string | number, FormatterOpts, P>(
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
    params
  );

export const dateFormatter = <P extends PARAMS<string | Moment, FormatterOpts<string | Moment>>>(params: P) =>
  formatAs<string | Moment, FormatterOpts<string | Moment>, P>(
    (v: string | Moment, opts: FormatterOpts<string | Moment>) => {
      const formatted = toDisplayDate(v);
      if (formatted === undefined) {
        opts.onError?.(v);
        return opts.errorValue || "";
      }
      return formatted;
    },
    "percentage",
    params
  );

export const titleCaseFormatter = <P extends PARAMS<string, FormatterOpts<string>>>(params: P) =>
  formatAs<string, FormatterOpts<string>, P>(
    (v: string) =>
      v.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      }),
    "percentage",
    params
  );
