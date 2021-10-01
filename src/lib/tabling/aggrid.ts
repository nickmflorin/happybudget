import classNames from "classnames";
import { reduce, map } from "lodash";
import { CellRange } from "@ag-grid-community/core";

export const getRows = <R extends Table.RowData, RW extends Table.Row<R> = Table.Row<R>>(api: Table.GridApi): RW[] => {
  let rows: RW[] = [];
  api.forEachNode((node: Table.RowNode) => rows.push(node.data));
  return rows;
};

export const rangeSelectionIsSingleCell = (range: CellRange) => {
  if (range.startRow?.rowIndex === range.endRow?.rowIndex && range.columns.length === 1) {
    return true;
  }
  return false;
};

export const mergeClassNames = <T>(params: T, ...args: Table.ClassName<T>[]): string => {
  const stringClassNames = map(args, (arg: Table.ClassName<T>) => {
    if (typeof arg === "function") {
      return arg(params);
    } else if (Array.isArray(arg)) {
      return mergeClassNames(params, ...arg);
    }
    return arg;
  });
  return classNames(stringClassNames);
};

/* eslint-disable indent */
export const mergeClassNamesFn =
  <T>(...args: Table.ClassName<T>[]): ((params: T) => string) =>
  (params: T) =>
    mergeClassNames(params, ...args);

export const combineFrameworks = (...args: (Table.Framework | undefined | null)[]): Table.Framework => {
  return reduce(
    args,
    (prev: Table.Framework, curr: Table.Framework | null | undefined) => {
      return {
        ...prev,
        editors: { ...prev.editors, ...curr?.editors },
        cells: {
          data: {
            ...prev.cells?.data,
            ...curr?.cells?.data
          },
          footer: {
            ...prev.cells?.footer,
            ...curr?.cells?.footer
          },
          page: {
            ...prev.cells?.page,
            ...curr?.cells?.page
          }
        }
      };
    },
    { cells: { data: {}, footer: {}, page: {} }, editors: {} }
  );
};
