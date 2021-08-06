import { isNil } from "lodash";
import { ValueFormatterParams } from "@ag-grid-community/core";
import { formatCurrencyWithoutDollarSign, formatPercentage } from "lib/util/formatters";
import { toDisplayDate } from "lib/util/dates";

export const agPercentageValueFormatter = (params: ValueFormatterParams): any => {
  if (!isNil(params.value)) {
    const numeric = parseFloat(String(params.value));
    if (!isNaN(numeric)) {
      return formatPercentage(numeric);
    }
    return numeric;
  }
  return params.value;
};

export const currencyValueFormatter = (value: string | number) => formatCurrencyWithoutDollarSign(value);

export const agCurrencyValueFormatter = (params: ValueFormatterParams): any => {
  if (!isNil(params.value)) {
    return currencyValueFormatter(params.value);
  }
  return params.value;
};

export const agDateValueFormatter = (params: ValueFormatterParams): any => {
  if (!isNil(params.value)) {
    return toDisplayDate(params.value);
  }
  return params.value;
};
