import { util } from "lib";

export const isAgFormatterParams = <P extends string | number>(
  params: Table.NativeFormatterParams<P> | Table.AGFormatterParams
): params is Table.AGFormatterParams => typeof params === "object";

type Params<T = string | number> = Table.FormatterParams<T> | OnFormatError;

const pIsErrorHandler = <T = string | number>(params: Params<T>): params is OnFormatError =>
  typeof params === "function";

export function percentageValueFormatter(p: Table.FormatterParams<string | number>): string;
export function percentageValueFormatter(p: OnFormatError): Table.Formatter<string | number>;

export function percentageValueFormatter<P extends Table.FormatterParams<string | number> | OnFormatError>(
  p: P
): Table.Formatter<string | number> | string {
  const internal = (params: Table.FormatterParams<string | number>, onE?: OnFormatError): string =>
    isAgFormatterParams<string | number>(params)
      ? util.formatters.formatPercentage(params.value, onE)
      : util.formatters.formatPercentage(params, onE);

  return pIsErrorHandler(p) ? (params: Table.FormatterParams<string | number>) => internal(params, p) : internal(p);
}

export function currencyValueFormatter(p: OnFormatError): Table.Formatter<string | number>;
export function currencyValueFormatter(p: Table.FormatterParams<string | number>): string;

export function currencyValueFormatter<P extends Table.FormatterParams<string | number> | OnFormatError>(
  p: P
): Table.Formatter<string | number> | string {
  const internal = (params: Table.FormatterParams<string | number>, onE?: OnFormatError): string =>
    isAgFormatterParams<string | number>(params)
      ? util.formatters.formatAsCurrency(params.value, onE)
      : util.formatters.formatAsCurrency(params, onE);

  return pIsErrorHandler(p) ? (params: Table.FormatterParams<string | number>) => internal(params, p) : internal(p);
}

export function dateValueFormatter(p: Table.FormatterParams<string>): string;
export function dateValueFormatter(p: OnFormatError): Table.Formatter<string>;

export function dateValueFormatter<P extends Table.FormatterParams<string> | OnFormatError>(
  p: P
): Table.Formatter<string> | string {
  const internal = (params: Table.FormatterParams<string>, onE?: OnFormatError): string =>
    isAgFormatterParams<string | number>(params)
      ? util.formatters.formatAsDate(params.value, onE)
      : util.formatters.formatAsDate(params, onE);

  return pIsErrorHandler(p) ? (params: Table.FormatterParams<string>) => internal(params, p) : internal(p);
}

export function phoneNumberValueFormatter(p: Table.FormatterParams<string | number>): string;
export function phoneNumberValueFormatter(p: OnFormatError): Table.Formatter<string | number>;

export function phoneNumberValueFormatter<P extends Table.FormatterParams<string | number> | OnFormatError>(
  p: P
): Table.Formatter<string> | string {
  const internal = (params: Table.FormatterParams<string | number>, onE?: OnFormatError): string =>
    isAgFormatterParams<string | number>(params)
      ? util.formatters.formatAsPhoneNumber(params.value, onE)
      : util.formatters.formatAsPhoneNumber(params, onE);

  return pIsErrorHandler(p) ? (params: Table.FormatterParams<string | number>) => internal(params, p) : internal(p);
}
