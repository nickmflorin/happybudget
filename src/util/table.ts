import { isNil } from "lodash";
import { ValueSetterParams, ValueFormatterParams } from "ag-grid-community";
import { formatCurrencyWithoutDollarSign } from "./string";

export const floatValueSetter = (field: string) => (params: ValueSetterParams): boolean => {
  if (!isNaN(parseFloat(params.newValue))) {
    params.data[field] = parseFloat(params.newValue);
    return true;
  }
  return false;
};

export const integerValueSetter = (field: string) => (params: ValueSetterParams): boolean => {
  if (!isNaN(parseInt(params.newValue))) {
    params.data[field] = parseInt(params.newValue);
    return true;
  }
  return false;
};

export const currencyValueFormatter = (params: ValueFormatterParams): any => {
  if (!isNil(params.value)) {
    return formatCurrencyWithoutDollarSign(params.value);
  }
  return params.value;
};
