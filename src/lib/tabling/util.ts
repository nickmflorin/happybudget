import { map, uniq, forEach } from "lodash";
import classNames from "classnames";
import { CellClassParams } from "@ag-grid-community/core";

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

export const mergeRowChanges = (changes: Table.RowChange<any>[]): Table.RowChange<any> => {
  if (changes.length !== 0) {
    if (uniq(map(changes, (change: Table.RowChange<any>) => change.id)).length !== 1) {
      throw new Error("Cannot merge row changes for different rows!");
    }
    const merged: Table.RowChange<any> = { id: changes[0].id, data: {} };
    forEach(changes, (change: Table.RowChange<any>) => {
      merged.data = { ...merged.data, ...change.data };
    });
    return merged;
  } else {
    throw new Error("Must provide at least 1 row change.");
  }
};
