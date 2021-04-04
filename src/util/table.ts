import { isNil, map } from "lodash";
import classNames from "classnames";
import { ValueSetterParams, ValueFormatterParams, CellClassParams } from "ag-grid-community";
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

type AGGridCellClassFn = (params: CellClassParams) => string | string[] | undefined;
type ClassNameConstruct = string | string[] | AGGridCellClassFn | undefined | { [key: string]: boolean };

export const mergeClassNames = (params: CellClassParams, ...args: ClassNameConstruct[]): string => {
  const stringClassNames = map(args, (arg: ClassNameConstruct) => {
    if (typeof arg === "function") {
      return arg(params);
    }
    return arg;
  });
  return classNames(stringClassNames);
};

export const mergeClassNamesFn = (...args: ClassNameConstruct[]) => (params: CellClassParams) => {
  return mergeClassNames(params, ...args);
};
