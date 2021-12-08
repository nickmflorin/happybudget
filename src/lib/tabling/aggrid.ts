import classNames from "classnames";
import { reduce, map, isNil } from "lodash";
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

export const getFocusedNode = (api: Table.GridApi): Table.RowNode | null => {
  const focusedCell = api.getFocusedCell();
  if (!isNil(focusedCell)) {
    const node = api.getDisplayedRowAtIndex(focusedCell.rowIndex);
    return node || null;
  }
  return null;
};

export const getFocusedRow = <R extends Table.RowData, RW extends Table.BodyRow<R> = Table.BodyRow<R>>(
  api: Table.GridApi
): RW | null => {
  const node = getFocusedNode(api);
  if (!isNil(node)) {
    const row: RW = node.data;
    return row;
  }
  return null;
};

export const collapseRangeSelectionVertically = (ranges: CellRange[]): [number | null, number | null] => {
  let verticalRange: [number | null, number | null] = [null, null];
  map(ranges, (range: CellRange) => {
    const endRowIndex = range.endRow?.rowIndex;
    const startRowIndex = range.startRow?.rowIndex;
    if (!isNil(endRowIndex) && !isNil(startRowIndex)) {
      if (endRowIndex > startRowIndex) {
        // In this case, the range was selected starting at the top of the table dragging downwards.
        if (verticalRange[0] === null || startRowIndex < verticalRange[0]) {
          verticalRange[0] = startRowIndex;
        }
        if (verticalRange[1] === null || endRowIndex > verticalRange[1]) {
          verticalRange[1] = endRowIndex;
        }
      } else if (startRowIndex > endRowIndex) {
        // In this case, the range was selected starting at the bottom of the table dragging upwards.
        if (verticalRange[0] === null || endRowIndex < verticalRange[0]) {
          verticalRange[0] = endRowIndex;
        }
        if (verticalRange[1] === null || startRowIndex > verticalRange[1]) {
          verticalRange[1] = startRowIndex;
        }
      } else {
        verticalRange = [
          verticalRange[0] === null ? startRowIndex : Math.min(verticalRange[0], startRowIndex),
          verticalRange[1] === null ? startRowIndex : Math.max(verticalRange[1], startRowIndex)
        ];
      }
    }
  });
  return verticalRange;
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
