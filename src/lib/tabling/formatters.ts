import { isNil } from "lodash";
import { ValueFormatterParams } from "@ag-grid-community/core";
import * as util from "../util";

export const agPercentageValueFormatter = (params: ValueFormatterParams): any => {
  if (!isNil(params.value)) {
    const numeric = parseFloat(String(params.value));
    if (!isNaN(numeric)) {
      return util.formatters.formatPercentage(numeric);
    }
    return numeric;
  }
  return params.value;
};

export const currencyValueFormatter = (value: string | number) =>
  util.formatters.formatCurrencyWithoutDollarSign(value);

export const agCurrencyValueFormatter = (params: ValueFormatterParams): any => {
  if (!isNil(params.value)) {
    return currencyValueFormatter(params.value);
  }
  return params.value;
};

export const agDateValueFormatter = (params: ValueFormatterParams): any => {
  if (!isNil(params.value)) {
    return util.dates.toDisplayDate(params.value);
  }
  return params.value;
};

export const phoneNumberFormatter = (value: string | number) => util.formatters.formatAsPhoneNumber(value);

export const agPhoneNumberValueFormatter = (params: ValueFormatterParams): any => {
  if (!isNil(params.value)) {
    return phoneNumberFormatter(params.value);
  }
  return params.value;
};
