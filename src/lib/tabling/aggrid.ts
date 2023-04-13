import { CellRange, IRowNode, RowNode } from "ag-grid-community";

import * as rows from "./rows";
import * as types from "./types";

const safeRowNodeInterfaceData = <R extends rows.Row>(node: IRowNode<R>): R => {
  if (node.data === undefined) {
    /* It is unclear as to why the IRowNode type treats the data as undefined in some cases, but
       we should throw an error if this is the case because the calling logic will depend on the
       rows being populated with data when this method is being used. */
    throw new Error("AG Grid unexpectedly returned undefined for node data.");
  }
  return node.data;
};

export const getRows = <R extends rows.Row>(api: types.GridApi<R>): R[] => {
  const rws: R[] = [];
  api.forEachNode((node: IRowNode<R>) => {
    rws.push(safeRowNodeInterfaceData(node));
  });
  return rws;
};

export const rangeSelectionIsSingleCell = (range: CellRange) => {
  if (range.startRow?.rowIndex === range.endRow?.rowIndex && range.columns.length === 1) {
    return true;
  }
  return false;
};

export const getFocusedNode = <R extends rows.Row>(api: types.GridApi<R>): IRowNode<R> | null => {
  const focusedCell = api.getFocusedCell();
  if (focusedCell !== null) {
    const node = api.getDisplayedRowAtIndex(focusedCell.rowIndex);
    return node || null;
  }
  return null;
};

export const getFocusedRow = <R extends rows.Row>(api: types.GridApi<R>): R | null => {
  const node = getFocusedNode<R>(api);
  if (node !== null) {
    return safeRowNodeInterfaceData<R>(node);
  }
  return null;
};

const _getNodesInDirection = <R extends rows.Row>(
  api: types.GridApi<R>,
  node: IRowNode<R> | RowNode<R>,
  direction: 1 | -1,
): IRowNode<R>[] => {
  const nodes: IRowNode<R>[] = [];
  if (node.rowIndex !== null) {
    let nextRowNode: IRowNode<R> | undefined = api.getDisplayedRowAtIndex(
      node.rowIndex + direction,
    );
    while (nextRowNode !== undefined && nextRowNode.rowIndex !== null) {
      nodes.push(nextRowNode);
      nextRowNode = api.getDisplayedRowAtIndex(nextRowNode.rowIndex + direction);
    }
  }
  return nodes;
};

export const getNodesBeforeNode = <R extends rows.Row>(
  api: types.GridApi<R>,
  node: IRowNode<R> | RowNode<R>,
): IRowNode<R>[] => _getNodesInDirection(api, node, -1);

export const getNodesAfterNode = <R extends rows.Row>(
  api: types.GridApi<R>,
  node: IRowNode<R> | RowNode<R>,
): IRowNode<R>[] => _getNodesInDirection(api, node, 1);

const _getRowsInDirection = <R extends rows.Row>(
  api: types.GridApi<R>,
  node: IRowNode<R> | RowNode<R>,
  direction: 1 | -1,
  flt?: (r: R) => boolean,
): R[] => {
  const nodes: IRowNode<R>[] = _getNodesInDirection(api, node, direction);
  return nodes
    .map((n: IRowNode<R>) => safeRowNodeInterfaceData(n))
    .filter((r: R) => flt === undefined || flt(r));
};

export const getRowsAfterNode = <R extends rows.Row>(
  api: types.GridApi<R>,
  node: IRowNode<R>,
  flt?: (r: R) => boolean,
): R[] => _getRowsInDirection<R>(api, node, 1, flt);

export const getRowsBeforeNode = <R extends rows.Row>(
  api: types.GridApi<R>,
  node: IRowNode<R>,
  flt?: (r: R) => boolean,
): R[] => _getRowsInDirection<R>(api, node, -1, flt);

export const getNodePreviousModelRow = <R extends rows.Row<D>, D extends rows.RowData>(
  api: types.GridApi<R>,
  node: IRowNode<R>,
): rows.ModelRow<D> | null => {
  const modelRowsBefore: rows.ModelRow<D>[] = getRowsBeforeNode<R>(api, node, (r: R) =>
    rows.isModelRow(r),
  ) as rows.ModelRow<D>[];
  return modelRowsBefore.length !== 0 ? modelRowsBefore[0] : null;
};

export const getNodeGroupRow = <R extends rows.Row<D>, D extends rows.RowData>(
  api: types.GridApi<R>,
  node: IRowNode<R>,
): rows.GroupRow<D> | null => {
  const groupRowsAfter: rows.GroupRow<D>[] = getRowsAfterNode<R>(api, node, (r: R) =>
    rows.isGroupRow(r),
  ) as rows.GroupRow<D>[];
  return groupRowsAfter.length !== 0 ? groupRowsAfter[0] : null;
};

export const collapseRangeSelectionVertically = (
  ranges: CellRange[],
): [number | null, number | null] => {
  let verticalRange: [number | null, number | null] = [null, null];
  ranges.map((range: CellRange) => {
    const endRowIndex = range.endRow?.rowIndex;
    const startRowIndex = range.startRow?.rowIndex;
    if (endRowIndex !== undefined && startRowIndex !== undefined) {
      if (endRowIndex > startRowIndex) {
        // In this case, the range was selected starting at the top of the table dragging downwards.
        if (verticalRange[0] === null || startRowIndex < verticalRange[0]) {
          verticalRange[0] = startRowIndex;
        }
        if (verticalRange[1] === null || endRowIndex > verticalRange[1]) {
          verticalRange[1] = endRowIndex;
        }
      } else if (startRowIndex > endRowIndex) {
        /* In this case, the range was selected starting at the bottom of the table dragging
           upwards. */
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

export const combineFrameworks = (
  ...args: (types.Framework | undefined | null)[]
): types.Framework =>
  args.reduce(
    (prev: types.Framework, curr: types.Framework | null | undefined) => ({
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
