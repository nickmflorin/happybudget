import { isNil } from "lodash";
import { toDisplayDate } from "./dates";

export const toTitleCase = (value: string): string => {
  return value.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
type _OnFormatError = (v: any) => string;

const formatAs = (
  value: number | string | null,
  onError: undefined | OnFormatError,
  fmtType: FormatType,
  fmt: (v: typeof value, onE: _OnFormatError) => string
) => {
  const fullOnError = !isNil(onError)
    ? /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      (v: any) => {
        const errorV = onError(v, fmtType);
        return errorV || "";
      }
    : /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      (v: any) => {
        console.error(`Could not parse value ${v} into ${fmtType}!`);
        return "";
      };
  return fmt(value, fullOnError);
};

export const formatAsCurrency: Table.NativeFormatter<number | string> = (
  value: string | number | null,
  onError?: OnFormatError
): string =>
  formatAs(value, onError, "currency", (v: string | number | null, onE: _OnFormatError) => {
    if (v === null || String(v).trim() === "") {
      return "";
    }
    const numericValue = parseFloat(String(v));
    if (isNaN(numericValue)) {
      const errorV = onE(value);
      return errorV || "";
    }
    return numericValue.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");
  });

export const formatPercentage: Table.NativeFormatter<number | string> = (
  value: string | number | null,
  onError?: OnFormatError
): string =>
  formatAs(value, onError, "percentage", (v: string | number | null, onE: _OnFormatError) => {
    if (v === null || String(v).trim() === "") {
      return "";
    }
    const numericValue = parseFloat(String(v));
    if (isNaN(numericValue)) {
      const errorV = onE(value);
      return errorV || "";
    }
    return Number(v).toLocaleString(undefined, { style: "percent", minimumFractionDigits: 2 });
  });

export const formatAsDate: Table.NativeFormatter<string> = (value: string | null, onError?: OnFormatError): string =>
  formatAs(value, onError, "date", (v: string | number | null, onE: _OnFormatError) => {
    if (v === null || String(v).trim() === "") {
      return "";
    }
    const formatted = toDisplayDate(value);
    if (formatted === undefined) {
      const errorV = onE(value);
      return errorV || "";
    }
    return formatted;
  });

export const formatAsPhoneNumber: Table.NativeFormatter<number | string> = (
  value: string | number | null,
  onError?: OnFormatError
): string =>
  formatAs(value, onError, "phoneNumber", (v: string | number | null) => {
    if (v === null || String(v).trim() === "") {
      return "";
    }
    const numeric = String(value).replace(/\D/g, "");
    if (numeric.length >= 12) {
      // Don't format string.
      return numeric;
    } else if (numeric.length === 11 || numeric.length === 10) {
      const match = numeric.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/);
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
  });
