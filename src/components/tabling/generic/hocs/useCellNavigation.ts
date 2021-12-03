import { isNil, includes, filter, map } from "lodash";

import { NavigateToNextCellParams, TabToNextCellParams } from "@ag-grid-community/core";

import { hooks, tabling, events } from "lib";

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

/* eslint-disable indent */
const useCellNavigation = <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(
  params: UseCellNavigationParams<R, M>
): UseCellNavigationReturnType => {
  const scrollToBottom = hooks.useDynamicCallback((numRows: number) => {
    params.apis?.grid.ensureIndexVisible(numRows - 1, "bottom");
  });

  events.useEvent<Events.RowsAddedParams>(
    "rowsAdded",
    (p: Events.RowsAddedParams) => {
      if (!isNil(params.tableId) && p.tableId === params.tableId) {
        setTimeout(() => {
          scrollToBottom(p.numRows);
        }, 100);
      }
    },
    []
  );

  const findNextNavigatableRow: (
    startingIndex: number,
    direction?: "asc" | "desc"
  ) => [Table.RowNode | null, number, number] = hooks.useDynamicCallback(
    (startingIndex: number, direction: "asc" | "desc" = "asc"): [Table.RowNode | null, number, number] => {
      if (!isNil(params.apis)) {
        let runningIndex = 0;
        let noMoreRows = false;
        let nextRowNode: Table.RowNode | undefined = undefined;

        while (noMoreRows === false) {
          if (direction === "desc" && startingIndex - runningIndex < 0) {
            noMoreRows = true;
            break;
          }
          nextRowNode = params.apis.grid.getDisplayedRowAtIndex(
            direction === "asc" ? startingIndex + runningIndex : startingIndex - runningIndex
          );
          if (isNil(nextRowNode)) {
            noMoreRows = true;
          } else {
            const row: Table.BodyRow<R> = nextRowNode.data;
            if (
              tabling.typeguards.isEditableRow(row) &&
              (isNil(params.includeRowInNavigation) || params.includeRowInNavigation(row) !== false)
            ) {
              return [nextRowNode, startingIndex + runningIndex, runningIndex];
            }
            runningIndex = runningIndex + 1;
          }
        }
        return [nextRowNode === undefined ? null : nextRowNode, startingIndex + runningIndex, runningIndex];
      } else {
        return [null, startingIndex, 0];
      }
    }
  );

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
            const [rowNode, _, additionalIndex] = findNextNavigatableRow(p.nextCellPosition.rowIndex, direction);
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
            const [rowNode, _, additionalIndex] = findNextNavigatableRow(p.nextCellPosition.rowIndex);
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
    /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
    const [node, rowIndex, _] = findNextNavigatableRow(loc.rowIndex + 1);
    if (node === null) {
      if (!isNil(params.onNewRowRequired)) {
        params.onNewRowRequired(loc.rowIndex + 1);
        moveToLocation({ rowIndex, column: loc.column });
      }
    } else {
      moveToLocation({ rowIndex, column: loc.column });
    }
  });

  return [navigateToNextCell, tabToNextCell, moveToNextColumn, moveToNextRow];
};

export default useCellNavigation;
