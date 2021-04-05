import { isNil } from "lodash";
import { ValueFormatterParams } from "ag-grid-community";
import { formatCurrencyWithoutDollarSign, formatPercentage } from "lib/util/formatters";

export const percentageValueFormatter = (params: ValueFormatterParams): any => {
  if (!isNil(params.value)) {
    const numeric = parseFloat(String(params.value));
    if (!isNaN(numeric)) {
      return formatPercentage(numeric);
    }
    return numeric;
  }
  return params.value;
};

export const currencyValueFormatter = (params: ValueFormatterParams): any => {
  if (!isNil(params.value)) {
    return formatCurrencyWithoutDollarSign(params.value);
  }
  return params.value;
};
