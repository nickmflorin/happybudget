import { isNil, map, find } from "lodash";
import classNames from "classnames";
import { CellClassParams, ProcessCellForExportParams } from "ag-grid-community";
import { getKeyValue } from "lib/util";

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
