import { isNil, includes, filter, map } from "lodash";

import { NavigateToNextCellParams, TabToNextCellParams } from "@ag-grid-community/core";

import { hooks, tabling } from "lib";

export interface UseCellNavigationParams<R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel> {
  readonly tableId?: Table.Id;
  readonly apis: Table.GridApis | null;
  readonly columns: Table.Column<R, M>[];
  readonly includeRowInNavigation?: (row: Table.EditableRow<R>) => boolean;
  readonly onNewRowRequired?: (newRowIndex: number) => void;
}

type UseCellNavigationReturnType = [
  (p: NavigateToNextCellParams) => Table.CellPosition,
  (p: TabToNextCellParams) => Table.CellPosition,
  (loc: Table.CellPosition) => void,
  (loc: Table.CellPosition) => void
];

type FindNavigatableRowOptions<R extends Table.RowData> = {
  readonly direction?: "asc" | "desc";
  readonly flt?: (r: Table.EditableRow<R>) => boolean;
  readonly includeRowInNavigation?: (row: Table.EditableRow<R>) => boolean;
};

const findNextNavigatableRow = <R extends Table.RowData>(
  api: Table.GridApi,
  startingIndex: number,
  opts?: FindNavigatableRowOptions<R>
): [Table.RowNode | null, number, number] => {
  const d = opts?.direction !== undefined ? opts.direction : "asc";
  const indexIsValid = (index: number) => {
    if (d === "desc" && index < 0) {
      return false;
    }
    return true;
  };

  const nextIndex = (runningIndex: number) =>
    d === "asc" ? startingIndex + runningIndex : startingIndex - runningIndex;

  const isNavigatableNode = (node: Table.RowNode) => {
    const row: Table.BodyRow<R> = node.data;
    const flt = opts?.flt;
    const includeRowInNavigation = opts?.includeRowInNavigation;
    if (!isNil(flt)) {
      if (tabling.typeguards.isEditableRow(row)) {
        return (isNil(includeRowInNavigation) || includeRowInNavigation(row) !== false) && flt(row);
      }
      return false;
    }
    return (
      tabling.typeguards.isEditableRow(row) && (isNil(includeRowInNavigation) || includeRowInNavigation(row) !== false)
    );
  };

  if (indexIsValid(startingIndex)) {
    let runningIndex = 0;
    let nextRowNode: Table.RowNode | undefined = api.getDisplayedRowAtIndex(startingIndex);

    while (!isNil(nextRowNode) && !isNavigatableNode(nextRowNode)) {
      runningIndex = runningIndex + 1;
      if (!indexIsValid(nextIndex(runningIndex))) {
        break;
      }
      nextRowNode = api.getDisplayedRowAtIndex(nextIndex(runningIndex));
      if (!isNil(nextRowNode) && isNavigatableNode(nextRowNode)) {
        break;
      }
    }
    return [nextRowNode === undefined ? null : nextRowNode, startingIndex + runningIndex, runningIndex];
  } else {
    return [null, startingIndex, 0];
  }
};

/* eslint-disable indent */
const useCellNavigation = <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(
  params: UseCellNavigationParams<R, M>
): UseCellNavigationReturnType => {
  const navigateToNextCell: (p: NavigateToNextCellParams) => Table.CellPosition = hooks.useDynamicCallback(
    (p: NavigateToNextCellParams): Table.CellPosition => {
      if (!isNil(p.nextCellPosition)) {
        const field = p.nextCellPosition.column.getColId();
        const column = tabling.columns.getColumn(params.columns, field);
        if (!isNil(column)) {
          const verticalAscend = p.previousCellPosition.rowIndex < p.nextCellPosition.rowIndex;
          const verticalDescend = p.previousCellPosition.rowIndex > p.nextCellPosition.rowIndex;

          if (verticalAscend === true || verticalDescend === true) {
            const direction: "asc" | "desc" = verticalAscend === true ? "asc" : "desc";
            /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
            const [rowNode, _, additionalIndex] = findNextNavigatableRow(p.api, p.nextCellPosition.rowIndex, {
              direction,
              includeRowInNavigation: params.includeRowInNavigation
            });
            if (!isNil(rowNode)) {
              return {
                ...p.nextCellPosition,
                rowIndex:
                  verticalAscend === true
                    ? p.nextCellPosition.rowIndex + additionalIndex
                    : p.nextCellPosition.rowIndex - additionalIndex
              };
            }
            return p.nextCellPosition;
          } else if (column.tableColumnType === "action") {
            return p.previousCellPosition;
          } else {
            return p.nextCellPosition;
          }
        }
      }
      return p.previousCellPosition;
    }
  );

  const tabToNextCell: (p: TabToNextCellParams) => Table.CellPosition = hooks.useDynamicCallback(
    (p: TabToNextCellParams): Table.CellPosition => {
      // TODO: We need to figure out how to add additional rows in the write case when we are
      // at the bottom right of the table.
      if (!p.editing && p.nextCellPosition !== null) {
        const field = p.nextCellPosition.column.getColId();
        const column = tabling.columns.getColumn(params.columns, field);
        if (!isNil(column)) {
          if (column.tableColumnType === "action") {
            let nextCellPosition = { ...p.nextCellPosition };
            /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
            const [rowNode, _, additionalIndex] = findNextNavigatableRow(p.api, p.nextCellPosition.rowIndex, {
              includeRowInNavigation: params.includeRowInNavigation
            });
            if (!isNil(rowNode)) {
              nextCellPosition = {
                ...p.nextCellPosition,
                rowIndex: p.nextCellPosition.rowIndex + additionalIndex
              };
            }
            const agColumns = params.apis?.column.getAllColumns();
            if (!isNil(agColumns)) {
              const baseColumns = filter(agColumns, (c: Table.AgColumn) =>
                includes(
                  map(
                    filter(params.columns, (ci: Table.Column<R, M>) => ci.tableColumnType === "action"),
                    (ci: Table.Column<R, M>) => tabling.columns.normalizedField<R, M>(ci)
                  ),
                  c.getColId()
                )
              );
              if (p.backwards === false && params.columns.length > baseColumns.length) {
                return { ...nextCellPosition, column: agColumns[baseColumns.length] };
              } else {
                return { ...nextCellPosition, column: agColumns[agColumns.length - 1] };
              }
            }
          }
        }
      }
      return p.nextCellPosition === null ? p.previousCellPosition : p.nextCellPosition;
    }
  );

  const moveToLocation: (loc: Table.CellPosition) => void = hooks.useDynamicCallback((loc: Table.CellPosition) => {
    params.apis?.grid.setFocusedCell(loc.rowIndex, loc.column);
    params.apis?.grid.clearRangeSelection();
  });

  const moveToNextColumn: (loc: Table.CellPosition) => void = hooks.useDynamicCallback((loc: Table.CellPosition) => {
    const agColumns = params.apis?.column.getAllColumns();
    if (!isNil(agColumns)) {
      const index = agColumns.indexOf(loc.column);
      if (index !== -1) {
        if (index === agColumns.length - 1) {
          moveToNextRow({ rowIndex: loc.rowIndex, column: agColumns[0] });
        } else {
          moveToLocation({ rowIndex: loc.rowIndex, column: agColumns[index + 1] });
        }
      }
    }
  });

  const moveToNextRow: (loc: Table.CellPosition) => void = hooks.useDynamicCallback((loc: Table.CellPosition) => {
    if (!isNil(params.apis)) {
      /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
      const [node, rowIndex, _] = findNextNavigatableRow(params.apis.grid, loc.rowIndex + 1, {
        // We want to add a new row when we are at the end of the ModelRow(s),
        // because the MarkupRow(s) will be at the end of the table but new rows
        // get inserted before them.
        flt: (r: Table.EditableRow<R>) => tabling.typeguards.isModelRow(r),
        includeRowInNavigation: params.includeRowInNavigation,
        direction: "asc"
      });
      let doNotMoveLocation = false;
      if (node === null) {
        if (!isNil(params.onNewRowRequired)) {
          // In the case that we are adding a new row to the bottom of the table,
          // the row state callbacks of the authenticated grid HOC handle the
          // refocusing of the cell.
          params.onNewRowRequired(loc.rowIndex);
          // We do not want to refocus the cell if a new row is being added, as
          // that is handled in the HOC.
          doNotMoveLocation = true;
        }
      }
      if (!doNotMoveLocation) {
        moveToLocation({ rowIndex, column: loc.column });
      }
    }
  });

  return [navigateToNextCell, tabToNextCell, moveToNextColumn, moveToNextRow];
};

export default useCellNavigation;
