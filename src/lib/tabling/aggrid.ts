import classNames from "classnames";
import { reduce, map, isNil, filter } from "lodash";
import { CellRange } from "@ag-grid-community/core";

import * as rows from "./rows";

export const getRows = <R extends Table.RowData, RW extends Table.Row<R> = Table.Row<R>>(
  api: Table.GridApi,
): RW[] => {
  const rws: RW[] = [];
  api.forEachNode((node: Table.RowNode) => rws.push(node.data));
  return rws;
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

export const getFocusedRow = <
  R extends Table.RowData,
  RW extends Table.BodyRow<R> = Table.BodyRow<R>,
>(
  api: Table.GridApi,
): RW | null => {
  const node = getFocusedNode(api);
  if (!isNil(node)) {
    const row: RW = node.data;
    return row;
  }
  return null;
};

const _getNodesInDirection = (
  api: Table.GridApi,
  node: Table.RowNode,
  direction: 1 | -1,
): Table.RowNode[] => {
  const nodes: Table.RowNode[] = [];
  if (!isNil(node.rowIndex)) {
    let nextRowNode: Table.RowNode | undefined = api.getDisplayedRowAtIndex(
      node.rowIndex + direction,
    );
    while (!isNil(nextRowNode) && !isNil(nextRowNode.rowIndex)) {
      nodes.push(nextRowNode);
      nextRowNode = api.getDisplayedRowAtIndex(nextRowNode.rowIndex + direction);
    }
  }
  return nodes;
};

export const getNodesBeforeNode = (api: Table.GridApi, node: Table.RowNode): Table.RowNode[] =>
  _getNodesInDirection(api, node, -1);

export const getNodesAfterNode = (api: Table.GridApi, node: Table.RowNode): Table.RowNode[] =>
  _getNodesInDirection(api, node, 1);

const _getRowsInDirection = <
  R extends Table.RowData,
  RW extends Table.BodyRow<R> = Table.BodyRow<R>,
>(
  api: Table.GridApi,
  node: Table.RowNode,
  direction: 1 | -1,
  flt?: (r: RW) => boolean,
): RW[] => {
  const nodes: Table.RowNode[] = _getNodesInDirection(api, node, direction);
  return filter(
    map(nodes, (n: Table.RowNode) => n.data as RW),
    (r: RW) => isNil(flt) || flt(r),
  );
};

export const getRowsAfterNode = <
  R extends Table.RowData,
  RW extends Table.BodyRow<R> = Table.BodyRow<R>,
>(
  api: Table.GridApi,
  node: Table.RowNode,
  flt?: (r: RW) => boolean,
): RW[] => _getRowsInDirection<R, RW>(api, node, 1, flt);

export const getRowsBeforeNode = <
  R extends Table.RowData,
  RW extends Table.BodyRow<R> = Table.BodyRow<R>,
>(
  api: Table.GridApi,
  node: Table.RowNode,
  flt?: (r: RW) => boolean,
): RW[] => _getRowsInDirection<R, RW>(api, node, -1, flt);

export const getNodePreviousModelRow = <R extends Table.RowData>(
  api: Table.GridApi,
  node: Table.RowNode,
): Table.ModelRow<R> | null => {
  const modelRowsBefore: Table.ModelRow<R>[] = getRowsBeforeNode<R>(
    api,
    node,
    (r: Table.BodyRow<R>) => rows.isModelRow(r),
  ) as Table.ModelRow<R>[];
  return modelRowsBefore.length !== 0 ? modelRowsBefore[0] : null;
};

export const getNodeGroupRow = <R extends Table.RowData>(
  api: Table.GridApi,
  node: Table.RowNode,
): Table.GroupRow<R> | null => {
  const groupRowsAfter: Table.GroupRow<R>[] = getRowsAfterNode<R>(
    api,
    node,
    (r: Table.BodyRow<R>) => rows.isGroupRow(r),
  ) as Table.GroupRow<R>[];
  return groupRowsAfter.length !== 0 ? groupRowsAfter[0] : null;
};

export const collapseRangeSelectionVertically = (
  ranges: CellRange[],
): [number | null, number | null] => {
  let verticalRange: [number | null, number | null] = [null, null];
  map(ranges, (range: CellRange) => {
    const endRowIndex = range.endRow?.rowIndex;
    const startRowIndex = range.startRow?.rowIndex;
    if (!isNil(endRowIndex) && !isNil(startRowIndex)) {
      if (endRowIndex > startRowIndex) {
        /* In this case, the range was selected starting at the top of the table
           dragging downwards. */
        if (verticalRange[0] === null || startRowIndex < verticalRange[0]) {
          verticalRange[0] = startRowIndex;
        }
        if (verticalRange[1] === null || endRowIndex > verticalRange[1]) {
          verticalRange[1] = endRowIndex;
        }
      } else if (startRowIndex > endRowIndex) {
        /* In this case, the range was selected starting at the bottom of the
           table dragging upwards. */
        if (verticalRange[0] === null || endRowIndex < verticalRange[0]) {
          verticalRange[0] = endRowIndex;
        }
        if (verticalRange[1] === null || startRowIndex > verticalRange[1]) {
          verticalRange[1] = startRowIndex;
        }
      } else {
        verticalRange = [
          verticalRange[0] === null ? startRowIndex : Math.min(verticalRange[0], startRowIndex),
          verticalRange[1] === null ? startRowIndex : Math.max(verticalRange[1], startRowIndex),
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

export const mergeClassNamesFn =
  <T>(...args: Table.ClassName<T>[]): ((params: T) => string) =>
  (params: T) =>
    mergeClassNames(params, ...args);

export const combineFrameworks = (
  ...args: (Table.Framework | undefined | null)[]
): Table.Framework =>
  reduce(
    args,
    (prev: Table.Framework, curr: Table.Framework | null | undefined) => ({
      ...prev,
      editors: { ...prev.editors, ...curr?.editors },
      cells: {
        data: {
          ...prev.cells?.data,
          ...curr?.cells?.data,
        },
        footer: {
          ...prev.cells?.footer,
          ...curr?.cells?.footer,
        },
        page: {
          ...prev.cells?.page,
          ...curr?.cells?.page,
        },
      },
    }),
    { cells: { data: {}, footer: {}, page: {} }, editors: {} },
  );
