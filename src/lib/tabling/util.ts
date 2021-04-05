import { isNil, map, find } from "lodash";
import classNames from "classnames";
import {
  ValueSetterParams,
  ValueFormatterParams,
  CellClassParams,
  ProcessCellForExportParams
} from "ag-grid-community";
import { getKeyValue } from "lib/util";
import { formatCurrencyWithoutDollarSign, formatPercentage } from "lib/util/formatters";

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

export const processOptionModelCellForClipboard = <
  R extends Table.Row<any, any>,
  M extends OptionModel<number, string>
>(
  /* eslint-disable indent */
  field: keyof R,
  models: M[]
) => (params: ProcessCellForExportParams) => {
  /* eslint-disable indent */
  if (!isNil(params.node)) {
    const row: R = params.node.data;
    const colDef = params.column.getColDef();
    if (!isNil(colDef.field)) {
      if (colDef.field === field && !isNil(row[field])) {
        const choiceModel: M | undefined = find(models, {
          id: row[field]
        } as any);
        if (!isNil(choiceModel)) {
          return choiceModel.name;
        } else {
          /* eslint-disable no-console */
          console.error(
            `Corrupted Cell Found! Could not convert model value ${row[field]} for field ${field}
            to a name.`
          );
          return "";
        }
      } else {
        return getKeyValue<R, keyof R>(colDef.field as keyof R)(row);
      }
    }
  }
};
