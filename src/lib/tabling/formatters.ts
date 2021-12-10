import { util } from "lib";

export const isAgFormatterParams = <P extends string | number>(
  params: Table.NativeFormatterParams<P> | Table.AGFormatterParams
): params is Table.AGFormatterParams => typeof params === "object";

export const percentageValueFormatter = (
  params: Table.AGFormatterParams | Table.NativeFormatterParams<string | number>
): string =>
  isAgFormatterParams<string | number>(params)
    ? util.formatters.formatPercentage(params.value)
    : util.formatters.formatPercentage(params);

export const currencyValueFormatter = (
  params: Table.AGFormatterParams | Table.NativeFormatterParams<string | number>
): string =>
  isAgFormatterParams<string | number>(params)
    ? util.formatters.formatAsCurrency(params.value)
    : util.formatters.formatAsCurrency(params);

export const dateValueFormatter = (params: Table.AGFormatterParams | Table.NativeFormatterParams<string>): string =>
  isAgFormatterParams<string>(params)
    ? util.dates.toDisplayDate(params.value) || ""
    : util.dates.toDisplayDate(params) || "";

export const phoneNumberValueFormatter = (
  params: Table.AGFormatterParams | Table.NativeFormatterParams<string | number>
): string =>
  isAgFormatterParams<string | number>(params)
    ? util.formatters.formatAsPhoneNumber(params.value) || ""
    : util.formatters.formatAsPhoneNumber(params) || "";
