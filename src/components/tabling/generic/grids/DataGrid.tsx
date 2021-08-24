import { useState, useEffect, useRef, useImperativeHandle, useMemo } from "react";
import { useLocation } from "react-router-dom";
import classNames from "classnames";
import { map, isNil, includes, find, forEach, filter, flatten, reduce, uniq } from "lodash";

import {
  CellEditingStoppedEvent,
  GridApi,
  ColumnApi,
  RowNode,
  Column,
  CellKeyDownEvent,
  CellPosition,
  NavigateToNextCellParams,
  TabToNextCellParams,
  GetContextMenuItemsParams,
  MenuItemDef,
  CellValueChangedEvent,
  PasteEndEvent,
  PasteStartEvent,
  FirstDataRenderedEvent,
  SuppressKeyboardEventParams,
  ProcessCellForExportParams,
  ProcessDataFromClipboardParams,
  CellRange,
  CellEditingStartedEvent,
  CellMouseOverEvent,
  CellFocusedEvent,
  SelectionChangedEvent,
  GridReadyEvent,
  CellClassParams,
  ValueSetterParams,
  GridOptions,
  CheckboxSelectionCallbackParams,
  CellDoubleClickedEvent
} from "@ag-grid-community/core";
import { FillOperationParams } from "@ag-grid-community/core/dist/cjs/entities/gridOptions";

import { TABLE_DEBUG } from "config";
import { tabling, hooks, util } from "lib";
import * as framework from "../framework";
import Grid, { GridProps, CommonGridProps } from "./Grid";

export const DefaultDataGridOptions: GridOptions = {
  defaultColDef: {
    resizable: true,
    sortable: false,
    filter: false,
    suppressMovable: true
  },
  suppressHorizontalScroll: true,
  suppressContextMenu: process.env.NODE_ENV === "development" && TABLE_DEBUG,
  // If for whatever reason, we have a table that cannot support bulk-updating,
  // these two parameters need to be set to true.
  suppressCopyRowsToClipboard: false,
  suppressClipboardPaste: false,
  enableFillHandle: true,
  fillHandleDirection: "y"
};

type OmitGridProps = "id" | "rows" | "columns" | "getContextMenuItems" | "onSelectionChanged" | "onColumnsSet";

export interface DataGridProps<R extends Table.Row, M extends Model.Model>
  extends Omit<GridProps<R, M>, OmitGridProps>,
    CommonGridProps<R, M> {
  readonly apis: Table.GridApis | null;
  readonly grid?: Table.GridRef<R, M>;
  readonly data?: R[];
  readonly search?: string;
  readonly cookieNames?: Table.CookieNames;
  readonly expandCellTooltip?: string;
  readonly defaultRowLabel?: string;
  readonly defaultRowName?: string;
  readonly onFirstDataRendered: (e: FirstDataRenderedEvent) => void;
  readonly onGridReady: (event: GridReadyEvent) => void;
  readonly onCellFocusChanged?: (params: Table.CellFocusChangedParams<R, M>) => void;
  readonly onChangeEvent?: (event: Table.ChangeEvent<R, M>) => void;
  readonly isCellEditable?: (params: Table.EditableCallbackParams<R, M>) => boolean;
  readonly isCellSelectable?: (params: Table.SelectableCallbackParams<R, M>) => boolean;
  readonly cellClass?: (params: CellClassParams) => string | undefined;
  readonly onSelectionChanged?: (rows: R[]) => void;
  // Callback to conditionally set the ability of a row to expand or not.  Only applicable if
  // onRowExpand is provided to the BudgetTable.
  readonly rowCanExpand?: (row: R) => boolean;
  readonly rowCanDelete?: (row: R) => boolean;
  readonly refreshRowExpandColumnOnCellHover?: (row: R) => boolean;
  readonly includeRowInNavigation?: (row: R) => boolean;
  readonly getContextMenuItems?: (row: R, node: RowNode, onChangeEvent: Table.OnChangeEvent<R, M>) => MenuItemDef[];
  readonly onRowExpand?: null | ((id: number) => void);
  readonly rowHasCheckboxSelection?: (row: R) => boolean;
}

const DataGrid = <R extends Table.Row, M extends Model.Model>({
  /* eslint-disable indent */
  apis,
  readOnly,
  grid,
  data,
  columns,
  search,
  cookieNames,
  hasExpandColumn,
  expandCellTooltip,
  defaultRowLabel,
  defaultRowName,
  includeRowInNavigation,
  refreshRowExpandColumnOnCellHover,
  cellClass,
  onCellFocusChanged,
  onGridReady,
  isCellEditable,
  isCellSelectable,
  rowCanDelete,
  rowCanExpand,
  onRowExpand,
  onChangeEvent,
  rowHasCheckboxSelection,
  ...props
}: DataGridProps<R, M>): JSX.Element => {
  const [cellChangeEvents, setCellChangeEvents] = useState<CellValueChangedEvent[]>([]);
  const [focused, setFocused] = useState(false);

  // Right now, we can only support Cut/Paste for 1 cell at a time.  Multi-cell
  // cut/paste needs to be built in.
  const [cutCellChange, setCutCellChange] = useState<Table.CellChange<R, M> | null>(null);
  const oldRow = useRef<R | null>(null); // TODO: Figure out a better way to do this.
  const oldFocusedEvent = useRef<CellFocusedEvent | null>(null);

  const location = useLocation();

  const [ordering, updateOrdering] = tabling.hooks.useOrdering({
    cookie: cookieNames?.ordering,
    columns
  });

  /*
  When the cell editor finishes editing, the AG Grid callback (onCellDoneEditing)
  does not have any context about what event triggered the completion.  This is
  problematic because we need to focus either the cell to the right (on Tab completion)
  or the cell below (on Enter completion).  To accomplish this, we use a custom hook
  to the Editor(s) that is manually called inside the Editor.
  */
  const onDoneEditing = hooks.useDynamicCallback((e: Table.CellDoneEditingEvent) => {
    if (tabling.typeguards.isKeyboardEvent(e) && !isNil(apis)) {
      const focusedCell = apis.grid.getFocusedCell();
      if (!isNil(focusedCell) && !isNil(focusedCell.rowIndex)) {
        if (e.code === "Enter") {
          moveToNextRow({ rowIndex: focusedCell.rowIndex, column: focusedCell.column });
        } else if (e.code === "Tab") {
          moveToNextColumn(focusedCell.rowIndex, focusedCell.column);
        }
      }
    }
  });

  const localColumns = useMemo<Table.Column<R, M>[]>((): Table.Column<R, M>[] => {
    const BodyColumn = (col: Table.Column<R, M>): Table.Column<R, M> => {
      return {
        cellRenderer: "BodyCell",
        ...col,
        suppressKeyboardEvent: (params: SuppressKeyboardEventParams) => {
          if (!isNil(col.suppressKeyboardEvent) && col.suppressKeyboardEvent(params) === true) {
            return true;
          } else if (
            !isNil(params.api) &&
            readOnly !== true &&
            !params.editing &&
            includes(["Backspace", "Delete"], params.event.code)
          ) {
            const clearCellsOverRange = (range: CellRange | CellRange[], api: GridApi) => {
              const changes: Table.CellChange<R, M>[] = !Array.isArray(range)
                ? getTableChangesFromRangeClear(range, api)
                : flatten(map(range, (rng: CellRange) => getTableChangesFromRangeClear(rng, api)));
              _onChangeEvent({
                type: "dataChange",
                payload: changes
              });
            };
            // Suppress Backspace/Delete events when multiple cells are selected in a range.
            const ranges = params.api.getCellRanges();
            if (!isNil(ranges) && (ranges.length !== 1 || !tabling.util.rangeSelectionIsSingleCell(ranges[0]))) {
              clearCellsOverRange(ranges, params.api);
              return true;
            } else {
              /*
              For custom Cell Editor(s) with a Pop-Up, we do not want Backspace/Delete to go into
              edit mode but instead want to clear the values of the cells - so we prevent those key
              presses from triggering edit mode in the Cell Editor and clear the value at this level.
              */
              const column = params.column;
              const customCol = find(localColumns, (def: Table.Column<R, M>) => def.field === column.getColId());
              if (!isNil(customCol)) {
                const columnType: Table.ColumnType | undefined = find(tabling.models.ColumnTypes, {
                  id: customCol.columnType
                });
                if (!isNil(columnType) && columnType.editorIsPopup === true) {
                  const row: R = params.node.data;
                  clearCell(row, customCol);
                  return true;
                }
              }
              return false;
            }
          } else if (
            !isNil(params.api) &&
            (params.event.key === "ArrowDown" || params.event.key === "ArrowUp") &&
            (params.event.ctrlKey || params.event.metaKey)
          ) {
            return true;
          }
          return false;
        },
        headerComponentParams: {
          ...col.headerComponentParams,
          onSort: (order: Order, field: keyof R) => updateOrdering(order, field),
          ordering
        },
        editable:
          readOnly === true
            ? false
            : !isNil(isCellEditable)
            ? isCellEditable
            : isNil(col.editable)
            ? true
            : col.editable,
        valueSetter: (params: ValueSetterParams) => {
          // By default, AG Grid treats Backspace clearing the cell as setting the
          // value to undefined - but we have to set it to the null value associated
          // with the column.
          if (params.newValue === undefined) {
            const column: Table.Column<R, M> | undefined = find(columns, { field: params.column.getColId() } as any);
            if (!isNil(column)) {
              params.newValue = column.nullValue === undefined ? null : column.nullValue;
            }
            params.newValue = null;
          }
          if (!isNil(col.valueSetter) && typeof col.valueSetter === "function") {
            return col.valueSetter(params);
          }
          params.data[params.column.getColId()] = params.newValue;
          return true;
        }
      };
    };
    const DataGridColumn = (col: Table.Column<R, M>): Table.Column<R, M> => ({
      ...col,
      cellEditorParams: { ...col.cellEditorParams, onDoneEditing },
      selectable: col.selectable || isCellSelectable
    });
    const cs: Table.Column<R, M>[] = map(columns, (col: Table.Column<R, M>) =>
      col.isCalculated !== true ? BodyColumn(DataGridColumn(col)) : DataGridColumn({ ...col, editable: false })
    );
    if (hasExpandColumn === true) {
      return [
        framework.columnObjs.IndexColumn(
          {
            checkboxSelection: (params: CheckboxSelectionCallbackParams) => {
              const row: R = params.data;
              if (readOnly === true) {
                return false;
              }
              return isNil(rowHasCheckboxSelection) || rowHasCheckboxSelection(row);
            }
          },
          hasExpandColumn,
          props.indexColumnWidth
        ),
        framework.columnObjs.ExpandColumn(
          {
            cellRendererParams: {
              onClick: onRowExpand,
              rowCanExpand: rowCanExpand,
              tooltip: expandCellTooltip
            }
          },
          props.expandColumnWidth
        ),
        ...cs
      ];
    } else {
      return [
        framework.columnObjs.IndexColumn(
          {
            checkboxSelection: (params: CheckboxSelectionCallbackParams) => {
              const row: R = params.data;
              if (readOnly === true) {
                return false;
              }
              return isNil(rowHasCheckboxSelection) || rowHasCheckboxSelection(row);
            }
          },
          hasExpandColumn,
          props.indexColumnWidth
        ),
        ...cs
      ];
    }
  }, [hooks.useDeepEqualMemo(columns), rowCanExpand, onRowExpand, hasExpandColumn, rowHasCheckboxSelection, readOnly]);

  useImperativeHandle(grid, () => ({
    applyTableChange: (event: Table.ChangeEvent<R, M>) => _onChangeEvent(event),
    getCSVData: (fields?: string[]) => {
      if (!isNil(apis)) {
        const cs: Table.Column<R, M>[] = filter(
          localColumns,
          (column: Table.Column<R, M>) =>
            column.canBeExported !== false && (isNil(fields) || includes(fields, column.field))
        );
        const csvData: CSVData = [map(cs, (col: Table.Column<R, M>) => col.headerName || "")];
        apis.grid.forEachNode((node: RowNode, index: number) => {
          const row: R = node.data;
          csvData.push(
            reduce(
              cs,
              (current: CSVRow, column: Table.Column<R, M>) => [...current, processCellForClipboard(column, row)],
              []
            )
          );
        });
        return csvData;
      }
      return [];
    }
  }));

  const onFirstDataRendered = hooks.useDynamicCallback((event: FirstDataRenderedEvent): void => {
    props.onFirstDataRendered(event);
    event.api.ensureIndexVisible(0);

    const query = new URLSearchParams(location.search);
    const rowId = query.get("row");
    const cols = event.columnApi.getAllColumns();

    if (!isNil(cols) && cols.length >= 3) {
      let identifierCol = cols[2];
      let focusedOnQuery = false;
      if (!isNil(rowId) && !isNaN(parseInt(rowId))) {
        const node = event.api.getRowNode(String(rowId));
        if (!isNil(node) && !isNil(node.rowIndex) && !isNil(identifierCol)) {
          event.api.setFocusedCell(node.rowIndex, identifierCol);
          focusedOnQuery = true;
        }
      }
      if (focusedOnQuery === false) {
        event.api.setFocusedCell(0, identifierCol);
      }
    }
  });

  const findNextNavigatableRow = hooks.useDynamicCallback(
    (startingIndex: number, direction: "asc" | "desc" = "asc"): [RowNode | null, number, number] => {
      if (!isNil(apis)) {
        let runningIndex = 0;
        let noMoreRows = false;
        let nextRowNode: RowNode | undefined = undefined;

        while (noMoreRows === false) {
          if (direction === "desc" && startingIndex - runningIndex < 0) {
            noMoreRows = true;
            break;
          }
          nextRowNode = apis.grid.getDisplayedRowAtIndex(
            direction === "asc" ? startingIndex + runningIndex : startingIndex - runningIndex
          );
          if (isNil(nextRowNode)) {
            noMoreRows = true;
          } else {
            const row: R = nextRowNode.data;
            if (isNil(includeRowInNavigation) || includeRowInNavigation(row) !== false) {
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

  const navigateToNextCell = hooks.useDynamicCallback((params: NavigateToNextCellParams): CellPosition => {
    if (!isNil(params.nextCellPosition)) {
      const verticalAscend = params.previousCellPosition.rowIndex < params.nextCellPosition.rowIndex;
      const verticalDescend = params.previousCellPosition.rowIndex > params.nextCellPosition.rowIndex;

      if (verticalAscend === true || verticalDescend === true) {
        const direction: "asc" | "desc" = verticalAscend === true ? "asc" : "desc";
        /* eslint-disable no-unused-vars */
        /* eslint-disable @typescript-eslint/no-unused-vars */
        const [rowNode, _, additionalIndex] = findNextNavigatableRow(params.nextCellPosition.rowIndex, direction);
        if (!isNil(rowNode)) {
          return {
            ...params.nextCellPosition,
            rowIndex:
              verticalAscend === true
                ? params.nextCellPosition.rowIndex + additionalIndex
                : params.nextCellPosition.rowIndex - additionalIndex
          };
        }
        return params.nextCellPosition;
      } else if (includes(["expand", "index"], params.nextCellPosition.column.getColId())) {
        return params.previousCellPosition;
      } else {
        return params.nextCellPosition;
      }
    }
    return params.previousCellPosition;
  });

  const tabToNextCell = hooks.useDynamicCallback((params: TabToNextCellParams): CellPosition => {
    if (!params.editing && !isNil(apis)) {
      // If the nextCellPosition is null, it means we are at the bottom of the table
      // all the way in the Column furthest to the right.
      if (isNil(params.nextCellPosition)) {
        // TODO: We need to figure out how to move down to the next cell!  This
        // is tricky, because we have to wait for the row to be present in state.
        _onChangeEvent({ type: "rowAdd", payload: 1 });
      } else {
        if (includes(["index", "expand"], params.nextCellPosition.column.getColId())) {
          let nextCellPosition = { ...params.nextCellPosition };
          const [rowNode, _, additionalIndex] = findNextNavigatableRow(params.nextCellPosition.rowIndex);
          if (!isNil(rowNode)) {
            nextCellPosition = {
              ...params.nextCellPosition,
              rowIndex: params.nextCellPosition.rowIndex + additionalIndex
            };
          }
          const agColumns = apis.column.getAllColumns();
          if (!isNil(agColumns)) {
            const baseColumns = filter(agColumns, (c: Column) => includes(["index", "expand"], c.getColId()));
            if (params.backwards === false && localColumns.length > baseColumns.length) {
              return { ...nextCellPosition, column: agColumns[baseColumns.length] };
            } else {
              return { ...nextCellPosition, column: agColumns[agColumns.length - 1] };
            }
          }
        }
      }
    }
    return params.nextCellPosition;
  });

  const moveToLocation = hooks.useDynamicCallback((loc: CellPosition, opts: Table.CellPositionMoveOptions = {}) => {
    if (!isNil(apis)) {
      apis.grid.setFocusedCell(loc.rowIndex, loc.column);
      apis.grid.clearRangeSelection();
      if (opts.startEdit === true && readOnly !== true) {
        apis.grid.startEditingCell({ rowIndex: loc.rowIndex, colKey: loc.column });
      }
    }
  });

  const moveToNextRow = hooks.useDynamicCallback((loc: CellPosition, opts: Table.CellPositionMoveOptions = {}) => {
    if (!isNil(apis)) {
      const [node, rowIndex, _] = findNextNavigatableRow(loc.rowIndex + 1);
      if (node === null) {
        _onChangeEvent({ type: "rowAdd", payload: 1 });
      }
      moveToLocation({ rowIndex, column: loc.column }, opts);
    }
  });

  const moveToNextColumn = hooks.useDynamicCallback((loc: CellPosition, opts: Table.CellPositionMoveOptions = {}) => {
    if (!isNil(apis)) {
      const agColumns = apis.column.getAllColumns();
      if (!isNil(agColumns)) {
        const index = agColumns.indexOf(loc.column);
        if (index !== -1) {
          if (index === agColumns.length - 1) {
            moveToNextRow({ rowIndex: loc.rowIndex, column: agColumns[0] }, opts);
          } else {
            moveToLocation({ rowIndex: loc.rowIndex, column: agColumns[index + 1] }, opts);
          }
        }
      }
    }
  });

  const onCellSpaceKey = hooks.useDynamicCallback((event: CellKeyDownEvent) => {
    if (!isNil(event.rowIndex)) {
      event.api.startEditingCell({
        rowIndex: event.rowIndex,
        colKey: event.column.getColId(),
        charPress: " "
      });
    }
  });

  const onCellCut = hooks.useDynamicCallback((e: CellKeyDownEvent, local: GridApi) => {
    const focusedCell = local.getFocusedCell();
    if (!isNil(focusedCell)) {
      const node = local.getDisplayedRowAtIndex(focusedCell.rowIndex);
      if (!isNil(node)) {
        const row: R = node.data;
        const customCol = find(localColumns, (def: Table.Column<R, M>) => def.field === focusedCell.column.getColId());
        if (!isNil(customCol)) {
          const change = getCellChangeForClear(row, customCol);
          local.flashCells({ columns: [focusedCell.column], rowNodes: [node] });
          if (!isNil(change)) {
            setCutCellChange(change);
          }
        }
      }
    }
  });

  const onCellKeyDown = hooks.useDynamicCallback((event: CellKeyDownEvent) => {
    if (!isNil(event.event)) {
      /* @ts-ignore  AG Grid's Event Object is Wrong */
      // AG Grid only enters Edit mode in a cell when a character is pressed, not the Space
      // key - so we have to do that manually here.
      if (event.event.code === "Space" && readOnly !== true) {
        onCellSpaceKey(event);
        /* @ts-ignore  AG Grid's Event Object is Wrong */
      } else if (event.event.key === "x" && (event.event.ctrlKey || event.event.metaKey) && readOnly !== true) {
        onCellCut(event.event, event.api);
        /* @ts-ignore  AG Grid's Event Object is Wrong */
      } else if (event.event.code === "Enter") {
        // If Enter is clicked inside the cell popout, this doesn't get triggered.
        const editing = event.api.getEditingCells();
        if (editing.length === 0) {
          moveToNextRow({ rowIndex: event.rowIndex, column: event.column });
        }
      }
    }
  });

  const getCellChangeForClear = hooks.useDynamicCallback(
    (row: R, col: Table.Column<R, M>): Table.CellChange<R, M> | null => {
      const clearValue = col.nullValue !== undefined ? col.nullValue : null;
      const colId = col.field;
      if (row[col.field as string] === undefined || row[col.field as string] !== clearValue) {
        const change: Table.CellChange<R, M> = {
          oldValue: row[col.field as string],
          newValue: clearValue as R[keyof R],
          id: row.id,
          field: colId,
          column: col,
          row: row
        };
        return change;
      } else {
        return null;
      }
    }
  );

  const getTableChangesFromRangeClear = hooks.useDynamicCallback(
    (range: CellRange, gridApi?: GridApi): Table.CellChange<R, M>[] => {
      const changes: Table.CellChange<R, M>[] = [];
      if (!isNil(apis) && !isNil(range.startRow) && !isNil(range.endRow)) {
        gridApi = isNil(gridApi) ? gridApi : apis.grid;
        let colIds: (keyof R)[] = map(range.columns, (col: Column) => col.getColId() as keyof R);
        let startRowIndex = Math.min(range.startRow.rowIndex, range.endRow.rowIndex);
        let endRowIndex = Math.max(range.startRow.rowIndex, range.endRow.rowIndex);
        for (let i = startRowIndex; i <= endRowIndex; i++) {
          const node: RowNode | undefined = apis.grid.getDisplayedRowAtIndex(i);
          if (!isNil(node)) {
            const row: R = node.data;
            /* eslint-disable no-loop-func */
            forEach(colIds, (colId: keyof R) => {
              const customCol = find(localColumns, { field: colId } as any);
              if (!isNil(customCol) && customCol.editable === true) {
                const change = getCellChangeForClear(row, customCol);
                if (!isNil(change)) {
                  changes.push(change);
                }
              }
            });
          }
        }
      }
      return changes;
    }
  );

  const getCellChangeFromEvent = (
    event: CellEditingStoppedEvent | CellValueChangedEvent
  ): Table.CellChange<R, M> | null => {
    const field = event.column.getColId() as Table.Field<R, M>;
    // AG Grid treats cell values as undefined when they are cleared via edit,
    // so we need to translate that back into a null representation.
    const customCol: Table.Column<R, M> | undefined = find(localColumns, { field } as any);
    if (!isNil(customCol)) {
      /*
      Note: Converting undefined values back to the column's corresponding null
      values may now be handled by the valueSetter on the Table.Column object.
      We may be able to remove - but leave now for safety.
      */
      const nullValue = customCol.nullValue === undefined ? null : customCol.nullValue;
      const oldValue = event.oldValue === undefined ? nullValue : event.oldValue;
      let newValue = event.newValue === undefined ? nullValue : event.newValue;
      if (oldValue !== newValue) {
        /*
        The logic inside this conditional is 100% a HACK - and this type of
        programming should not be encouraged.  However, in this case, it is
        a HACK to get around AG Grid nonsense.  It appears to be a bug with
        AG Grid, but if you have data stored for a cell that is an Array of
        length 1, when you drag the cell contents to fill other cells, AG Grid
        will pass the data to the onCellValueChanged handler as only the
        first element (i.e. [4] becomes 4).  This is problematic for Fringes,
        since the cell value corresponds to a list of Fringe IDs, so we need
        to make that adjustment here.
        */
        if (field === "fringes" && !Array.isArray(newValue)) {
          newValue = [newValue];
        }
        const row: R = event.node.data;
        const change: Table.CellChange<R, M> = { oldValue, newValue, field, id: event.data.id, column: customCol, row };
        return change;
      }
    }
    return null;
  };

  /**
   * Modified version of the onChangeEvent callback passed into the Grid.  The
   * modified version of the callback will first fire the original callback,
   * but then inspect whether or not the column associated with any of the fields
   * that were changed warrant refreshing another column.
   */
  const _onChangeEvent = (event: Table.ChangeEvent<R, M>) => {
    if (readOnly !== true && !isNil(onChangeEvent)) {
      onChangeEvent(event);
      // TODO: We might have to also apply similiar logic for when a row is added?
      if (tabling.typeguards.isDataChangeEvent(event) && !isNil(apis)) {
        let nodesToRefresh: RowNode[] = [];
        let columnsToRefresh: Table.Field<R, M>[] = [];

        const changes: Table.RowChange<R, M>[] = tabling.util.consolidateTableChange(event.payload);

        // Look at the changes for each row and determine if the field changed is
        // associated with a column that refreshes other columns.
        forEach(changes, (rowChange: Table.RowChange<R, M>) => {
          const node = apis.grid.getRowNode(String(rowChange.id));
          if (!isNil(node)) {
            let hasColumnsToRefresh = false;
            for (let i = 0; i < Object.keys(rowChange.data).length; i++) {
              const field: Table.Field<R, M> = Object.keys(rowChange.data)[i];
              const change = util.getKeyValue<Table.RowChangeData<R, M>, Table.Field<R, M>>(field)(
                rowChange.data
              ) as Table.NestedCellChange<R, M>;
              // Check if the cellChange is associated with a Column that when changed,
              // should refresh other columns.
              const col: Table.Column<R, M> | undefined = find(localColumns, { field } as any);
              if (!isNil(col) && !isNil(col.refreshColumns)) {
                const fieldsToRefresh = col.refreshColumns({
                  ...change,
                  id: rowChange.id,
                  field
                });
                if (!isNil(fieldsToRefresh) && fieldsToRefresh.length !== 0) {
                  hasColumnsToRefresh = true;
                  columnsToRefresh = uniq([
                    ...columnsToRefresh,
                    ...(Array.isArray(fieldsToRefresh) ? fieldsToRefresh : [fieldsToRefresh])
                  ]);
                }
              }
            }
            if (hasColumnsToRefresh === true) {
              nodesToRefresh.push(node);
            }
          }
        });
        if (columnsToRefresh.length !== 0) {
          apis.grid.refreshCells({ force: true, rowNodes: nodesToRefresh, columns: columnsToRefresh as string[] });
        }
      }
    }
  };

  const clearCell = hooks.useDynamicCallback((row: R, def: Table.Column<R, M>) => {
    const change = getCellChangeForClear(row, def);
    if (!isNil(change)) {
      _onChangeEvent({
        type: "dataChange",
        payload: change
      });
    }
  });

  const onPasteStart = hooks.useDynamicCallback((event: PasteStartEvent) => {
    setCellChangeEvents([]);
  });

  const onPasteEnd = hooks.useDynamicCallback((event: PasteEndEvent) => {
    const changes = filter(
      map(cellChangeEvents, (e: CellValueChangedEvent) => getCellChangeFromEvent(e)),
      (change: Table.CellChange<R, M> | null) => change !== null
    ) as Table.CellChange<R, M>[];
    if (changes.length !== 0) {
      _onChangeEvent({
        type: "dataChange",
        payload: changes
      });
    }
  });

  const getContextMenuItems = hooks.useDynamicCallback((params: GetContextMenuItemsParams): MenuItemDef[] => {
    let contextMenuItems: MenuItemDef[] = [];
    // This can happen in rare cases where you right click outside of a cell.
    if (isNil(params.node)) {
      return contextMenuItems; // This can happen in rare cases where you right click outside of a cell.
    }
    const row: R = params.node.data;
    if (!isNil(props.getContextMenuItems)) {
      contextMenuItems = [...contextMenuItems, ...props.getContextMenuItems(row, params.node, _onChangeEvent)];
    }
    if (isNil(rowCanDelete) || rowCanDelete(row) === true) {
      contextMenuItems = [
        ...contextMenuItems,
        {
          name: `Delete ${
            tabling.util.getFullRowLabel(row, { name: defaultRowName, label: defaultRowLabel }) || "Row"
          }`,
          action: () => _onChangeEvent({ payload: { rows: row, columns: localColumns }, type: "rowDelete" })
        }
      ];
    }
    return contextMenuItems;
  });

  const processDataFromClipboard = hooks.useDynamicCallback((params: ProcessDataFromClipboardParams) => {
    const createRowAddFromDataArray = (local: ColumnApi, array: any[], startingColumn: Column): Table.RowAdd<R, M> => {
      let rowAdd: Table.RowAdd<R, M> = { data: {} };
      let currentColumn: Column = startingColumn;
      map(array, (value: any) => {
        const field = currentColumn.getColDef().field;
        if (!isNil(field)) {
          const column: Table.Column<R, M> | undefined = find(localColumns, { field } as any);
          if (!isNil(column)) {
            const fieldBehavior = column.fieldBehavior || ["read", "write"];
            if (includes(fieldBehavior, "write")) {
              rowAdd = {
                ...rowAdd,
                data: {
                  ...rowAdd.data,
                  [column.field as string]: {
                    value: processCellValueFromClipboard(currentColumn, value),
                    column
                  }
                }
              };
            }
          }
        }
        const nextColumn = local.getDisplayedColAfter(currentColumn);
        if (isNil(nextColumn)) {
          return false;
        }
        currentColumn = nextColumn;
      });
      return rowAdd;
    };
    // Note: We could allow this to go through for readOnly cases since the changeEvent will be
    // blocked in _onChangeEvent for readOnly cases, but this will be faster.
    if (!isNil(apis) && readOnly !== true) {
      const lastIndex = apis.grid.getDisplayedRowCount();
      const focusedCell = apis.grid.getFocusedCell();
      if (!isNil(focusedCell)) {
        if (focusedCell.rowIndex + params.data.length - 1 > lastIndex) {
          const resultLastIndex = focusedCell.rowIndex + params.data.length;
          const addRowCount = resultLastIndex - lastIndex;

          let rowsToAdd = [];
          let addedRows = 0;
          let currIndex = params.data.length - 1;
          while (addedRows < addRowCount) {
            rowsToAdd.push(params.data.splice(currIndex, 1)[0]);
            addedRows++;
            currIndex--;
          }
          rowsToAdd = rowsToAdd.reverse();
          const newRows: Table.RowAdd<R, M>[] = map(rowsToAdd, (r: any[]) =>
            createRowAddFromDataArray(apis.column, r, focusedCell.column)
          );
          _onChangeEvent({
            type: "rowAdd",
            payload: newRows
          });
        }
      }
    }
    return params.data;
  });

  useEffect(() => {
    const getFirstEditableDisplayedColumn = (): Column | null => {
      if (!isNil(apis)) {
        const displayedColumns = apis.column.getAllDisplayedColumns();
        if (!isNil(displayedColumns)) {
          for (let i = 0; i < displayedColumns.length; i++) {
            const displayedColumn = displayedColumns[i];
            const field = displayedColumn.getColDef().field;
            if (!isNil(field)) {
              const customCol = find(localColumns, { field } as any);
              if (!isNil(customCol) && customCol.editable !== false) {
                return displayedColumn;
              }
            }
          }
        }
      }
      return null;
    };
    if (focused === false && !isNil(apis)) {
      const firstEditableCol = getFirstEditableDisplayedColumn();
      if (!isNil(firstEditableCol)) {
        apis.grid.ensureIndexVisible(0);
        apis.grid.ensureColumnVisible(firstEditableCol);
        setTimeout(() => apis.grid.setFocusedCell(0, firstEditableCol), 0);
        // TODO: Investigate if there is a better way to do this - currently,
        // this hook is getting triggered numerous times when it shouldn't be.
        // It is because the of the `columns` in the dependency array, which
        // are necessary to get a situation when `firstEditCol` is not null,
        // but also shouldn't be triggering this hook so many times.
        setFocused(true);
      }
    }
  }, [focused]);

  useEffect(() => {
    if (!isNil(apis)) {
      apis.grid.setQuickFilter(search);
    }
  }, [search]);

  const processCellForClipboard = hooks.useDynamicCallback((column: Table.Column<R, M>, row: R, value?: any) => {
    const processor = column.processCellForClipboard;
    if (!isNil(processor)) {
      return processor(row);
    } else {
      value = value === undefined ? util.getKeyValue<R, keyof R>(column.field as keyof R)(row) : value;
      // The value should never be undefined at this point.
      if (value === column.nullValue) {
        return "";
      }
      return value;
    }
  });

  const processCellValueFromClipboard = hooks.useDynamicCallback((column: Table.Column<R, M>, value: any) => {
    const processor = column.processCellFromClipboard;
    if (!isNil(processor)) {
      return processor(value);
    } else {
      // The value should never be undefined at this point.
      if (typeof value === "string" && String(value).trim() === "") {
        return !isNil(column.nullValue) ? column.nullValue : null;
      }
      return value;
    }
  });

  const processCellFromClipboard = hooks.useDynamicCallback((column: Table.Column<R, M>, row: R, value?: any) => {
    value = value === undefined ? util.getKeyValue<R, keyof R>(column.field as keyof R)(row) : value;
    return processCellValueFromClipboard(column, value);
  });

  const _processCellForClipboard = hooks.useDynamicCallback((params: ProcessCellForExportParams) => {
    if (!isNil(params.node)) {
      const customCol: Table.Column<R, M> | undefined = find(localColumns, {
        field: params.column.getColId()
      } as any);
      if (!isNil(customCol)) {
        setCutCellChange(null);
        return processCellForClipboard(customCol, params.node.data as R, params.value);
      }
    }
  });

  const _processCellFromClipboard = hooks.useDynamicCallback((params: ProcessCellForExportParams) => {
    if (!isNil(params.node)) {
      const node: RowNode = params.node;
      const customCol: Table.Column<R, M> | undefined = find(localColumns, {
        field: params.column.getColId()
      } as any);
      if (!isNil(customCol)) {
        if (!isNil(cutCellChange)) {
          params = { ...params, value: cutCellChange.oldValue };
          _onChangeEvent({
            type: "dataChange",
            payload: cutCellChange
          });
          setCutCellChange(null);
        }
        return processCellFromClipboard(customCol, node.data as R, params.value);
      }
    }
  });

  const onCellValueChanged = hooks.useDynamicCallback((e: CellValueChangedEvent) => {
    if (e.source === "paste") {
      setCellChangeEvents([...cellChangeEvents, e]);
    } else {
      const change = getCellChangeFromEvent(e);
      if (!isNil(change)) {
        _onChangeEvent({ type: "dataChange", payload: change });
        if (!isNil(apis) && !isNil(onRowExpand) && !isNil(rowCanExpand)) {
          const col = apis.column.getColumn("expand");
          const row: R = e.node.data;
          if (!isNil(col) && (isNil(oldRow.current) || rowCanExpand(oldRow.current) !== rowCanExpand(row))) {
            apis.grid.refreshCells({ force: true, rowNodes: [e.node], columns: [col] });
          }
        }
      }
    }
  });

  const onCellFocused = hooks.useDynamicCallback((e: CellFocusedEvent) => {
    const getCellFromFocusedEvent = (event: CellFocusedEvent, col?: Table.Column<R, M>): Table.Cell<R, M> | null => {
      if (!isNil(apis) && !isNil(event.rowIndex) && !isNil(event.column)) {
        const rowNode: RowNode | undefined = apis.grid.getDisplayedRowAtIndex(event.rowIndex);
        const column: Table.Column<R, M> | undefined = !isNil(col)
          ? col
          : find(localColumns, { field: event.column.getColId() } as any);
        if (!isNil(rowNode) && !isNil(column)) {
          const row: R = rowNode.data;
          return { rowNode, column, row };
        }
      }
      return null;
    };

    const cellsTheSame = (cell1: Table.Cell<R, M>, cell2: Table.Cell<R, M>): boolean => {
      return cell1.column.field === cell2.column.field && cell1.row.id === cell2.row.id;
    };

    if (!isNil(e.column) && !isNil(apis)) {
      const previousFocusEvent = !isNil(oldFocusedEvent.current) ? { ...oldFocusedEvent.current } : null;
      oldFocusedEvent.current = e;

      const col: Table.Column<R, M> | undefined = find(localColumns, { field: e.column.getColId() } as any);
      if (!isNil(col)) {
        const cell: Table.Cell<R, M> | null = getCellFromFocusedEvent(e);
        const previousCell = !isNil(previousFocusEvent) ? getCellFromFocusedEvent(previousFocusEvent) : null;
        if (!isNil(cell)) {
          if (previousCell === null || !cellsTheSame(cell, previousCell)) {
            if (!isNil(col.onCellFocus)) {
              col.onCellFocus({ apis, cell });
            }
            if (!isNil(onCellFocusChanged)) {
              onCellFocusChanged({ apis, previousCell, cell });
            }
            if (!isNil(previousCell) && !isNil(col.onCellUnfocus)) {
              col.onCellUnfocus({ apis, cell: previousCell });
            }
          }
        }
      }
    }
  });

  const onSelectionChanged = hooks.useDynamicCallback((e: SelectionChangedEvent) => {
    if (!isNil(apis)) {
      const selected: R[] = apis.grid.getSelectedRows();
      props.onSelectionChanged?.(selected);
    }
  });

  const onCellMouseOver = useMemo(
    () => (e: CellMouseOverEvent) => {
      /*
      In order to hide/show the expand button under certain conditions,
      we always need to refresh the expand column whenever another cell
      is hovered.  We should figure out if there is a way to optimize
      this to only refresh under certain circumstances.
      */
      if (hasExpandColumn) {
        if (
          includes(
            map(localColumns, (col: Table.Column<R, M>) => col.field),
            e.colDef.field
          )
        ) {
          const nodes: RowNode[] = [];
          const firstRow = e.api.getFirstDisplayedRow();
          const lastRow = e.api.getLastDisplayedRow();
          e.api.forEachNodeAfterFilter((node: RowNode, index: number) => {
            if (index >= firstRow && index <= lastRow) {
              const row: R = node.data;
              if (isNil(refreshRowExpandColumnOnCellHover) || refreshRowExpandColumnOnCellHover(row) === true) {
                nodes.push(node);
              }
            }
          });
          e.api.refreshCells({ force: true, rowNodes: nodes, columns: ["expand"] });
        }
      }
    },
    []
  );

  const onCellEditingStarted = useMemo(
    () => (event: CellEditingStartedEvent) => {
      oldRow.current = { ...event.node.data };
    },
    []
  );

  const onCellDoubleClicked = hooks.useDynamicCallback((e: CellDoubleClickedEvent) => {
    const row: R = e.data;
    const column: Table.Column<R, M> | undefined = find(localColumns, { field: e.column.getColId() } as any);
    if (!isNil(column) && !isNil(column.onCellDoubleClicked)) {
      column.onCellDoubleClicked(row);
    }
  });

  return (
    <Grid<R, M>
      {...props}
      id={"data"}
      data={data}
      className={classNames("grid--data", props.className)}
      rowClass={["row--data", props.rowClass]}
      columns={localColumns}
      rowSelection={"multiple"}
      domLayout={"autoHeight"}
      getContextMenuItems={getContextMenuItems}
      onGridReady={onGridReady}
      onFirstDataRendered={onFirstDataRendered}
      processDataFromClipboard={readOnly !== true ? processDataFromClipboard : undefined}
      processCellForClipboard={_processCellForClipboard}
      processCellFromClipboard={readOnly !== true ? _processCellFromClipboard : undefined}
      navigateToNextCell={navigateToNextCell}
      tabToNextCell={tabToNextCell}
      onCellKeyDown={onCellKeyDown}
      onCellFocused={onCellFocused}
      onCellDoubleClicked={onCellDoubleClicked}
      onSelectionChanged={onSelectionChanged}
      // rowDataChangeDetectionStrategy={ChangeDetectionStrategyType.DeepValueCheck}
      onCellEditingStarted={readOnly !== true ? onCellEditingStarted : undefined}
      onCellMouseOver={onCellMouseOver}
      onPasteStart={readOnly !== true ? onPasteStart : undefined}
      onPasteEnd={readOnly !== true ? onPasteEnd : undefined}
      onCellValueChanged={readOnly !== true ? onCellValueChanged : undefined}
      fillOperation={
        readOnly !== true
          ? (params: FillOperationParams) => {
              if (params.initialValues.length === 1) {
                return false;
              }
              return params.initialValues[
                (params.values.length - params.initialValues.length) % params.initialValues.length
              ];
            }
          : undefined
      }
    />
  );
};

export default DataGrid;
