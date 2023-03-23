import { Moment } from "moment";

import * as tabling from "../../tabling";
import { EnumeratedLiteralType } from "../types";
import { enumeratedLiterals } from "../util";

/**
 * @deprecated
 */
export const FormatTypes = enumeratedLiterals(["currency", "date", "phoneNumber", "percentage"]);
export type FormatType = EnumeratedLiteralType<typeof FormatTypes>;

/**
 * @deprecated
 */
export type FormatValue = string | number | Moment;

/**
 * @deprecated
 */
export type NaiveOnFormatError<P extends FormatValue = string | number> = (v: P) => string | void;

/**
 * @deprecated
 */
export type OnFormatError<P extends FormatValue = string | number> = (v: P) => void;

/**
 * @deprecated
 */
export type NativeFormatterParams<P extends FormatValue = string | number> = P | null;

/**
 * @deprecated
 */
export type NativeFormatter<P extends FormatValue = string | number> = (
  params: NativeFormatterParams<P>,
  onError?: OnFormatError,
) => string;

/**
 * @deprecated
 */
export type FormatterCallbackOpts<T extends FormatValue = string | number> = {
  readonly onError: OnFormatError<T>;
};

/**
 * @deprecated
 */
export type FormatterErrorValueOpts = {
  readonly errorValue: string;
};

/**
 * @deprecated
 */
export type FormatterOpts<T extends FormatValue = string | number> =
  | FormatterCallbackOpts<T>
  | FormatterErrorValueOpts;

/**
 * @deprecated
 */
export type FormatterParams<T extends FormatValue = string | number> =
  | tabling.TableValueFormatterParams<tabling.Row, string, T>
  | NativeFormatterParams<T>;

/**
 * @deprecated
 */
export type Formatter<T extends FormatValue = string | number> = (
  params: FormatterParams<T>,
) => string;

/**
 * @deprecated
 */
export type FormatterArgChoices<T extends FormatValue = string | number> =
  | FormatterParams<T>
  | FormatterOpts<T>
  | OnFormatError<T>;

/**
 * @deprecated
 */
export const isFormatterCallbackOpts = <T extends FormatValue = string | number>(
  p: FormatterArgChoices<T>,
): p is FormatterCallbackOpts<T> =>
  p !== null && (p as FormatterCallbackOpts<T>).onError !== undefined;

/**
 * @deprecated
 */
export const isFormatterErrorValueOpts = <T extends FormatValue = string | number>(
  p: FormatterArgChoices<T>,
): p is FormatterErrorValueOpts =>
  p !== null && (p as FormatterErrorValueOpts).errorValue !== undefined;

/**
 * @deprecated
 */
export const isFormatterOpts = <T extends FormatValue = string | number>(
  p: FormatterArgChoices<T>,
): p is FormatterOpts<T> => isFormatterCallbackOpts(p) || isFormatterErrorValueOpts(p);

/**
 * @deprecated
 */
export const isFormatterParams = <T extends FormatValue = string | number>(
  p: FormatterArgChoices<T>,
): p is FormatterParams<T> => typeof p !== "function" && !isFormatterOpts(p);

/**
 * @deprecated
 */
export const isErrorHandler = <T extends string | number | Moment = string | number>(
  p: FormatterArgChoices<T>,
): p is OnFormatError<T> => typeof p === "function";

/**
 * @deprecated
 */
export const isTableFormatterParams = <T extends FormatValue = string | number>(
  params: NativeFormatterParams<T> | tabling.TableValueFormatterParams<tabling.Row, string, T>,
): params is tabling.TableValueFormatterParams<tabling.Row, string, T> =>
  params !== null &&
  typeof params === "object" &&
  (params as tabling.TableValueFormatterParams<tabling.Row, string, T>).data !== undefined;
