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
      let movedLocation = false;
      if (node === null) {
        if (!isNil(params.onNewRowRequired)) {
          params.onNewRowRequired(loc.rowIndex);
          /*
          This is slightly confusing - but when we are at the end of the table
          and double click Enter on the last *ModelRow*, a new ModelRow is inserted
          before the MarkupRow(s) at the end of the table.  This occurs when
          the `boundaryRows` are [ModelRow, MarkupRow].  In this case, we do
          not want the table to focus the MarkupRow (2nd element of `boundaryRows`)
          after the new row is added, but instead focus the new row, inserted
          between the two `boundaryRows`.

          In the case that the `boundaryRows` are [MarkupRow, MarkupRow], this
          means that the new row was triggered from double clicking Enter on
          the last row of the table, which happens to be a MarkupRow.  We still
          want to insert the ModelRow before the MarkupRow(s) in the table, but
          we do not want to focus the newly created row.
          */
          const boundaryNodes: [Table.RowNode | undefined, Table.RowNode | undefined] = [
            params.apis.grid.getDisplayedRowAtIndex(loc.rowIndex),
            params.apis.grid.getDisplayedRowAtIndex(loc.rowIndex + 1)
          ];
          if (!isNil(boundaryNodes[0]) && !isNil(boundaryNodes[1])) {
            const boundaryRows: [Table.BodyRow<R>, Table.BodyRow<R>] = [boundaryNodes[0].data, boundaryNodes[1].data];
            if (
              tabling.typeguards.isMarkupRow(boundaryRows[1]) &&
              tabling.typeguards.isModelRow(boundaryRows[0]) &&
              rowIndex > 0
            ) {
              moveToLocation({ rowIndex: rowIndex - 1, column: loc.column });
              movedLocation = true;
            }
          }
        }
      }
      if (!movedLocation) {
        moveToLocation({ rowIndex, column: loc.column });
      }
    }
  });

  return [navigateToNextCell, tabToNextCell, moveToNextColumn, moveToNextRow];
};

export default useCellNavigation;
