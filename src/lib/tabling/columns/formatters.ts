import { util } from "lib";

export const isAgFormatterParams = <P extends string | number>(
  params: Table.NativeFormatterParams<P> | Table.AGFormatterParams
): params is Table.AGFormatterParams => typeof params === "object";

type TableFormatterParams<T = string | number> = Table.AGFormatterParams | Table.NativeFormatterParams<T>;
type TableFormatter<T = string | number> = (params: TableFormatterParams<T>) => string;

type Params<T = string | number> = TableFormatterParams<T> | OnFormatError;

const pIsErrorHandler = <T = string | number>(params: Params<T>): params is OnFormatError =>
  typeof params === "function";

export function percentageValueFormatter(p: TableFormatterParams<string | number>): string;
export function percentageValueFormatter(p: OnFormatError): TableFormatter<string | number>;

export function percentageValueFormatter<P extends TableFormatterParams<string | number> | OnFormatError>(
  p: P
): TableFormatter<string | number> | string {
  const internal = (params: TableFormatterParams<string | number>, onE?: OnFormatError): string =>
    isAgFormatterParams<string | number>(params)
      ? util.formatters.formatPercentage(params.value, onE)
      : util.formatters.formatPercentage(params, onE);

  return pIsErrorHandler(p) ? (params: TableFormatterParams<string | number>) => internal(params, p) : internal(p);
}

export function currencyValueFormatter(p: OnFormatError): TableFormatter<string | number>;
export function currencyValueFormatter(p: TableFormatterParams<string | number>): string;

export function currencyValueFormatter<P extends TableFormatterParams<string | number> | OnFormatError>(
  p: P
): TableFormatter<string | number> | string {
  const internal = (params: TableFormatterParams<string | number>, onE?: OnFormatError): string =>
    isAgFormatterParams<string | number>(params)
      ? util.formatters.formatAsCurrency(params.value, onE)
      : util.formatters.formatAsCurrency(params, onE);

  return pIsErrorHandler(p) ? (params: TableFormatterParams<string | number>) => internal(params, p) : internal(p);
}

export function dateValueFormatter(p: TableFormatterParams<string>): string;
export function dateValueFormatter(p: OnFormatError): TableFormatter<string>;

export function dateValueFormatter<P extends TableFormatterParams<string> | OnFormatError>(
  p: P
): TableFormatter<string> | string {
  const internal = (params: TableFormatterParams<string>, onE?: OnFormatError): string =>
    isAgFormatterParams<string | number>(params)
      ? util.formatters.formatAsDate(params.value, onE)
      : util.formatters.formatAsDate(params, onE);

  return pIsErrorHandler(p) ? (params: TableFormatterParams<string>) => internal(params, p) : internal(p);
}

export function phoneNumberValueFormatter(p: TableFormatterParams<string | number>): string;
export function phoneNumberValueFormatter(p: OnFormatError): TableFormatter<string | number>;

export function phoneNumberValueFormatter<P extends TableFormatterParams<string | number> | OnFormatError>(
  p: P
): TableFormatter<string> | string {
  const internal = (params: TableFormatterParams<string | number>, onE?: OnFormatError): string =>
    isAgFormatterParams<string | number>(params)
      ? util.formatters.formatAsPhoneNumber(params.value, onE)
      : util.formatters.formatAsPhoneNumber(params, onE);

  return pIsErrorHandler(p) ? (params: TableFormatterParams<string | number>) => internal(params, p) : internal(p);
}
