import React from "react";
import { useState, useEffect, useRef, useImperativeHandle } from "react";
import { map, isNil, includes, find, forEach, filter, flatten, reduce, uniq } from "lodash";
import { useLocation } from "react-router-dom";

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
  RowClassParams,
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
  CellFocusedEvent
} from "@ag-grid-community/core";
import { FillOperationParams } from "@ag-grid-community/core/dist/cjs/entities/gridOptions";

import * as models from "lib/model";
import * as typeguards from "lib/model/typeguards";

import { getKeyValue } from "lib/util";
import { useDynamicCallback, useDeepEqualMemo } from "lib/hooks";
import { getGroupColorDefinition, consolidateTableChange, createTableData } from "lib/model/util";
import { rangeSelectionIsSingleCell } from "../util";
import BudgetTableMenu from "./Menu";
import Grid from "./Grid";

const PrimaryGrid = <R extends Table.Row, M extends Model.Model>({
  /* eslint-disable indent */
  apis,
  gridRef,
  options,
  data,
  ordering,
  groups = [],
  columns,
  groupParams,
  frameworkComponents,
  search,
  actions,
  detached,
  rowLabel = "Row",
  onCellFocusChanged,
  modelToRow,
  getModelLabel,
  getModelChildren,
  onGridReady,
  onSearch,
  isCellEditable,
  rowCanExpand,
  onRowExpand,
  onChangeEvent,
  onBack,
  ...props
}: BudgetTable.PrimaryGridProps<R, M>): JSX.Element => {
  const [cellChangeEvents, setCellChangeEvents] = useState<CellValueChangedEvent[]>([]);
  const [focused, setFocused] = useState(false);
  // Right now, we can only support Cut/Paste for 1 cell at a time.  Multi-cell
  // cut/paste needs to be built in.
  const [cutCellChange, setCutCellChange] = useState<Table.CellChange<R, M> | null>(null);
  const oldRow = useRef<R | null>(null); // TODO: Figure out a better way to do this.
  const oldFocusedEvent = useRef<CellFocusedEvent | null>(null);

  const location = useLocation();
  const [table, setTable] = useState<R[]>([]);

  const onFirstDataRendered = useDynamicCallback((event: FirstDataRenderedEvent): void => {
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

  /**
   * Starting at the provided index, either traverses the table upwards or downwards
   * until a RowNode that is not used as a group footer is found.
   */
  const findFirstNonGroupFooterRow = useDynamicCallback(
    (startingIndex: number, direction: "asc" | "desc" = "asc"): [RowNode | null, number, number] => {
      if (!isNil(apis)) {
        let runningIndex = 0;
        let noMoreRows = false;
        let nextRowNode: RowNode | null = null;

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
            if (row.meta.isGroupFooter === false) {
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

  /**
   * Starting at the provided node, traverses the table upwards and collects
   * all of the RowNode(s) until a RowNode that is the footer for a group above
   * the provided node is reached.
   */
  const findRowsUpUntilFirstGroupFooterRow = useDynamicCallback((node: RowNode): RowNode[] => {
    const nodes: RowNode[] = [node];
    if (!isNil(apis)) {
      let currentNode: RowNode | null = node;
      while (!isNil(currentNode) && !isNil(currentNode.rowIndex) && currentNode.rowIndex >= 1) {
        currentNode = apis.grid.getDisplayedRowAtIndex(currentNode.rowIndex - 1);
        if (!isNil(currentNode)) {
          const row: R = currentNode.data;
          if (row.meta.isGroupFooter === true) {
            break;
          } else {
            // NOTE: In practice, we will never reach a non-group footer node that belongs to a group
            // before we reach the group footer node, so as long as the ordering/grouping of rows
            // is consistent.  However, we will also make sure that the row does not belong to a group
            // for safety.
            if (isNil(row.group)) {
              nodes.push(currentNode);
            }
          }
        }
      }
    }
    return nodes;
  });

  const navigateToNextCell = useDynamicCallback((params: NavigateToNextCellParams): CellPosition => {
    if (!isNil(params.nextCellPosition)) {
      const verticalAscend = params.previousCellPosition.rowIndex < params.nextCellPosition.rowIndex;
      const verticalDescend = params.previousCellPosition.rowIndex > params.nextCellPosition.rowIndex;

      if (verticalAscend === true) {
        /* eslint-disable no-unused-vars */
        /* eslint-disable @typescript-eslint/no-unused-vars */
        const [rowNode, _, additionalIndex] = findFirstNonGroupFooterRow(params.nextCellPosition.rowIndex);
        if (!isNil(rowNode)) {
          return {
            ...params.nextCellPosition,
            rowIndex: params.nextCellPosition.rowIndex + additionalIndex
          };
        }
        return params.nextCellPosition;
      } else if (verticalDescend === true) {
        const [rowNode, _, additionalIndex] = findFirstNonGroupFooterRow(params.nextCellPosition.rowIndex, "desc");
        if (!isNil(rowNode)) {
          return {
            ...params.nextCellPosition,
            rowIndex: params.nextCellPosition.rowIndex - additionalIndex
          };
        }
        return params.nextCellPosition;
      } else if (includes(["expand", "select"], params.nextCellPosition.column.getColId())) {
        return params.previousCellPosition;
      } else {
        return params.nextCellPosition;
      }
    }
    return params.previousCellPosition;
  });

  const tabToNextCell = useDynamicCallback((params: TabToNextCellParams): CellPosition => {
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
          // Skip the Group Footer rows.
          const [rowNode, _, additionalIndex] = findFirstNonGroupFooterRow(params.nextCellPosition.rowIndex);
          if (!isNil(rowNode)) {
            nextCellPosition = {
              ...params.nextCellPosition,
              rowIndex: params.nextCellPosition.rowIndex + additionalIndex
            };
          }

          const agColumns = apis.column.getAllColumns();
          if (!isNil(agColumns)) {
            const baseColumns = filter(agColumns, (c: Column) => includes(["index", "expand"], c.getColId()));
            if (params.backwards === false && columns.length > baseColumns.length) {
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

  const moveToLocation = useDynamicCallback((loc: CellPosition, opts: Table.CellPositionMoveOptions = {}) => {
    if (!isNil(apis)) {
      apis.grid.setFocusedCell(loc.rowIndex, loc.column);
      apis.grid.clearRangeSelection();
      if (opts.startEdit === true) {
        apis.grid.startEditingCell({ rowIndex: loc.rowIndex, colKey: loc.column });
      }
    }
  });

  const moveToNextRow = useDynamicCallback((loc: CellPosition, opts: Table.CellPositionMoveOptions = {}) => {
    if (!isNil(apis)) {
      const [node, rowIndex, _] = findFirstNonGroupFooterRow(loc.rowIndex + 1);
      if (node === null) {
        _onChangeEvent({ type: "rowAdd", payload: 1 });
      }
      moveToLocation({ rowIndex, column: loc.column }, opts);
    }
  });

  const moveToNextColumn = useDynamicCallback((loc: CellPosition, opts: Table.CellPositionMoveOptions = {}) => {
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

  // AG Grid only enters Edit mode in a cell when a character is pressed, not the Space
  // key - so we have to do that manually here.
  const onCellSpaceKey = useDynamicCallback((event: CellKeyDownEvent) => {
    if (!isNil(event.rowIndex)) {
      event.api.startEditingCell({
        rowIndex: event.rowIndex,
        colKey: event.column.getColId(),
        charPress: " "
      });
    }
  });

  const onCellCut = useDynamicCallback((e: CellKeyDownEvent, local: GridApi) => {
    const focusedCell = local.getFocusedCell();
    if (!isNil(focusedCell)) {
      const node = local.getDisplayedRowAtIndex(focusedCell.rowIndex);
      if (!isNil(node)) {
        const row: R = node.data;
        const customCol = find(columns, (def: Table.Column<R, M>) => def.field === focusedCell.column.getColId());
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

  // When the cell editor finishes editing, the AG Grid callback (onCellDoneEditing)
  // does not have any context about what event triggered the completion.  This is
  // problematic because we need to focus either the cell to the right (on Tab completion)
  // or the cell below (on Enter completion).  To accomplish this, we use a custom hook
  // to the CellEditor(s) that is manually called inside the CellEditor.
  const onDoneEditing = useDynamicCallback((e: Table.CellDoneEditingEvent) => {
    if (typeguards.isKeyboardEvent(e) && !isNil(apis)) {
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

  const onCellKeyDown = useDynamicCallback((event: CellKeyDownEvent) => {
    if (!isNil(event.event)) {
      /* @ts-ignore  AG Grid's Event Object is Wrong */
      if (event.event.code === "Space") {
        onCellSpaceKey(event);
        /* @ts-ignore  AG Grid's Event Object is Wrong */
      } else if (event.event.key === "x" && (event.event.ctrlKey || event.event.metaKey)) {
        onCellCut(event.event, event.api);
        /* @ts-ignore  AG Grid's Event Object is Wrong */
      } else if (event.event.code === "Enter") {
        // NOTE: If Enter is clicked inside the cell popout, this doesn't get triggered.
        const editing = event.api.getEditingCells();
        if (editing.length === 0) {
          moveToNextRow({ rowIndex: event.rowIndex, column: event.column });
        }
      }
    }
  });

  const getCellChangeForClear = useDynamicCallback((row: R, col: Table.Column<R, M>): Table.CellChange<R, M> | null => {
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
  });

  const getTableChangesFromRangeClear = useDynamicCallback(
    (range: CellRange, gridApi?: GridApi): Table.CellChange<R, M>[] => {
      const changes: Table.CellChange<R, M>[] = [];
      if (!isNil(apis) && !isNil(range.startRow) && !isNil(range.endRow)) {
        gridApi = isNil(gridApi) ? gridApi : apis.grid;
        let colIds: (keyof R)[] = map(range.columns, (col: Column) => col.getColId() as keyof R);
        let startRowIndex = Math.min(range.startRow.rowIndex, range.endRow.rowIndex);
        let endRowIndex = Math.max(range.startRow.rowIndex, range.endRow.rowIndex);
        for (let i = startRowIndex; i <= endRowIndex; i++) {
          const node: RowNode | null = apis.grid.getDisplayedRowAtIndex(i);
          if (!isNil(node)) {
            const row: R = node.data;
            /* eslint-disable no-loop-func */
            forEach(colIds, (colId: keyof R) => {
              const customCol = find(columns, { field: colId } as any);
              if (!isNil(customCol) && isCellEditable(row, customCol)) {
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
    const field = event.column.getColId() as GenericTable.Field<R, M>;
    // AG Grid treats cell values as undefined when they are cleared via edit,
    // so we need to translate that back into a null representation.
    const customCol: Table.Column<R, M> | undefined = find(columns, { field } as any);
    if (!isNil(customCol)) {
      // Note: Converting undefined values back to the column's corresponding null
      // values may now be handled by the valueSetter on the Table.Column object.
      // We may be able to remove - but leave now for safety.
      const nullValue = customCol.nullValue === undefined ? null : customCol.nullValue;
      const oldValue = event.oldValue === undefined ? nullValue : event.oldValue;
      let newValue = event.newValue === undefined ? nullValue : event.newValue;
      if (oldValue !== newValue) {
        // The logic inside this conditional is 100% a HACK - and this type of
        // programming should not be encouraged.  However, in this case, it is
        // a HACK to get around AG Grid nonsense.  It appears to be a bug with
        // AG Grid, but if you have data stored for a cell that is an Array of
        // length 1, when you drag the cell contents to fill other cells, AG Grid
        // will pass the data to the onCellValueChanged handler as only the
        // first element (i.e. [4] becomes 4).  This is problematic for Fringes,
        // since the cell value corresponds to a list of Fringe IDs, so we need
        // to make that adjustment here.
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
    onChangeEvent(event);
    // TODO: We might have to also apply similiar logic for when a row is added?
    if (typeguards.isDataChangeEvent(event) && !isNil(apis)) {
      let nodesToRefresh: RowNode[] = [];
      let columnsToRefresh: GenericTable.Field<R, M>[] = [];

      const changes: Table.RowChange<R, M>[] = consolidateTableChange(event.payload);

      // Look at the changes for each row and determine if the field changed is
      // associated with a column that refreshes other columns.
      forEach(changes, (rowChange: Table.RowChange<R, M>) => {
        const node = apis.grid.getRowNode(String(rowChange.id));
        if (!isNil(node)) {
          let hasColumnsToRefresh = false;
          for (let i = 0; i < Object.keys(rowChange.data).length; i++) {
            const field: GenericTable.Field<R, M> = Object.keys(rowChange.data)[i];
            const change = getKeyValue<Table.RowChangeData<R, M>, GenericTable.Field<R, M>>(field)(
              rowChange.data
            ) as Table.NestedCellChange<R, M>;
            // Check if the cellChange is associated with a Column that when changed,
            // should refresh other columns.
            const col: Table.Column<R, M> | undefined = find(columns, { field } as any);
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
  };

  const clearCellsOverRange = useDynamicCallback((range: CellRange | CellRange[], paramsApi?: GridApi) => {
    const changes: Table.CellChange<R, M>[] = !Array.isArray(range)
      ? getTableChangesFromRangeClear(range, paramsApi)
      : flatten(map(range, (rng: CellRange) => getTableChangesFromRangeClear(rng, paramsApi)));
    _onChangeEvent({
      type: "dataChange",
      payload: changes
    });
  });

  const clearCell = useDynamicCallback((row: R, def: Table.Column<R, M>) => {
    const change = getCellChangeForClear(row, def);
    if (!isNil(change)) {
      _onChangeEvent({
        type: "dataChange",
        payload: change
      });
    }
  });

  const onPasteStart = useDynamicCallback((event: PasteStartEvent) => {
    setCellChangeEvents([]);
  });

  const onPasteEnd = useDynamicCallback((event: PasteEndEvent) => {
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

  const getRowClass = useDynamicCallback((params: RowClassParams) => {
    const row: R = params.node.data;
    if (row.meta.isGroupFooter === true) {
      return "row--group-footer";
    }
    return "";
  });

  const getRowStyle = useDynamicCallback((params: RowClassParams) => {
    const row: R = params.node.data;
    if (row.meta.isGroupFooter === true) {
      const group: Model.Group | undefined = find(groups, { id: row.group } as any);
      if (isNil(group)) {
        return {};
      }
      const colorDef = getGroupColorDefinition(group);
      return {
        color: !isNil(colorDef.color) ? `${colorDef.color} !important` : undefined,
        backgroundColor: !isNil(colorDef.backgroundColor) ? `${colorDef.backgroundColor} !important` : undefined
      };
    }
  });

  const getContextMenuItems = useDynamicCallback((params: GetContextMenuItemsParams): MenuItemDef[] => {
    // This can happen in rare cases where you right click outside of a cell.
    if (isNil(params.node)) {
      return [];
    }
    const row: R = params.node.data;
    if (row.meta.isTableFooter) {
      return [];
    } else if (row.meta.isGroupFooter) {
      if (!isNil(row.group) && !isNil(groupParams)) {
        const group: Model.Group | undefined = find(groups, { id: row.group } as any);
        if (!isNil(group)) {
          return [
            {
              name: `Ungroup ${group.name}`,
              action: () => groupParams.onDeleteGroup(group)
            }
          ];
        }
      }
      return [];
    } else {
      const deleteRowContextMenuItem: MenuItemDef = {
        name: `Delete ${row.meta.label || "Row"}`,
        action: () => _onChangeEvent({ payload: row.id, type: "rowDelete" })
      };
      if (isNil(groupParams)) {
        return [deleteRowContextMenuItem];
      } else if (!isNil(row.meta.group)) {
        const group: Model.Group | undefined = find(groups, { id: row.meta.group } as any);
        if (!isNil(group)) {
          return [
            deleteRowContextMenuItem,
            {
              name: `Remove ${row.meta.label || "Row"} from Group ${group.name}`,
              action: () => groupParams.onRowRemoveFromGroup(row)
            }
          ];
        }
        return [deleteRowContextMenuItem];
      } else {
        const menuItems: MenuItemDef[] = [deleteRowContextMenuItem];

        const groupableNodesAbove = findRowsUpUntilFirstGroupFooterRow(params.node);
        if (groupableNodesAbove.length !== 0) {
          let label: string;
          if (groupableNodesAbove.length === 1) {
            label = `Group ${rowLabel}`;
            if (!isNil(groupableNodesAbove[0].data.meta.label)) {
              label = `Group ${rowLabel} ${groupableNodesAbove[0].data.meta.label}`;
            }
          } else {
            label = `Group ${rowLabel}s`;
            if (
              !isNil(groupableNodesAbove[groupableNodesAbove.length - 1].data.meta.label) &&
              !isNil(groupableNodesAbove[0].data.meta.label)
            ) {
              label = `Group ${rowLabel}s ${groupableNodesAbove[groupableNodesAbove.length - 1].data.meta.label} - ${
                groupableNodesAbove[0].data.meta.label
              }`;
            }
          }
          menuItems.push({
            name: label,
            action: () => groupParams.onGroupRows(map(groupableNodesAbove, (n: RowNode) => n.data as R))
          });
        }
        if (groups.length !== 0) {
          menuItems.push({
            name: "Add to Group",
            subMenu: map(groups, (group: Model.Group) => ({
              name: group.name,
              action: () => groupParams.onRowAddToGroup(group.id, row)
            }))
          });
        }
        return menuItems;
      }
    }
  });

  const suppressKeyboardEvent = useDynamicCallback((params: SuppressKeyboardEventParams) => {
    if (!isNil(params.api) && !params.editing && includes(["Backspace", "Delete"], params.event.code)) {
      // Suppress Backspace/Delete events when multiple cells are selected in a range.
      const ranges = params.api.getCellRanges();
      if (!isNil(ranges) && (ranges.length !== 1 || !rangeSelectionIsSingleCell(ranges[0]))) {
        clearCellsOverRange(ranges, params.api);
        return true;
      } else {
        // For custom Cell Editor(s) with a Pop-Up, we do not want Backspace/Delete to go into
        // edit mode but instead want to clear the values of the cells - so we prevent those key
        // presses from triggering edit mode in the Cell Editor and clear the value at this level.
        const column = params.column;
        const customCol = find(columns, (def: Table.Column<R, M>) => def.field === column.getColId());
        if (!isNil(customCol)) {
          const columnType: GenericTable.ColumnType | undefined = find(models.ColumnTypes, {
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
  });

  const createRowAddFromDataArray = (local: ColumnApi, array: any[], startingColumn: Column): Table.RowAdd<R, M> => {
    let rowAdd: Table.RowAdd<R, M> = { data: {} };
    let currentColumn: Column = startingColumn;
    map(array, (value: any) => {
      const field = currentColumn.getColDef().field;
      if (!isNil(field)) {
        const column: Table.Column<R, M> | undefined = find(columns, { field } as any);
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

  const processDataFromClipboard = useDynamicCallback((params: ProcessDataFromClipboardParams) => {
    if (!isNil(apis)) {
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

  const getFirstEditableDisplayedColumn = useDynamicCallback((): Column | null => {
    if (!isNil(apis)) {
      const displayedColumns = apis.column.getAllDisplayedColumns();
      if (!isNil(displayedColumns)) {
        for (let i = 0; i < displayedColumns.length; i++) {
          const displayedColumn = displayedColumns[i];
          const field = displayedColumn.getColDef().field;
          if (!isNil(field)) {
            const customCol = find(columns, { field } as any);
            if (!isNil(customCol) && customCol.editable !== false) {
              return displayedColumn;
            }
          }
        }
      }
    }
    return null;
  });

  useEffect(() => {
    const readColumns = filter(columns, (c: Table.Column<R, M>) => {
      const fieldBehavior: Table.FieldBehavior[] = c.fieldBehavior || ["read", "write"];
      return includes(fieldBehavior, "read");
    });

    const createGroupFooter = (group: Model.Group): R | null => {
      if (readColumns.length !== 0) {
        return reduce(
          columns,
          (obj: { [key: string]: any }, col: Table.Column<R, M>) => {
            const fieldBehavior: Table.FieldBehavior[] = col.fieldBehavior || ["read", "write"];
            if (includes(fieldBehavior, "read")) {
              if (!isNil(col.field)) {
                if (col.isCalculated === true) {
                  if (!isNil(group[col.field as keyof Model.Group])) {
                    obj[col.field as string] = group[col.field as keyof Model.Group];
                  } else {
                    obj[col.field as string] = null;
                  }
                } else {
                  obj[col.field as string] = null;
                }
              }
            }
            return obj;
          },
          {
            // The ID needs to designate that this row refers to a Group because the ID of a Group
            // might clash with the ID of a SubAccount/Account.
            id: `group-${group.id}`,
            [readColumns[0].field as string]: group.name,
            group: group.id,
            meta: { ...models.DefaultRowMeta, isGroupFooter: true }
          }
        ) as R;
      }
      return null;
    };

    const tableData = createTableData<Table.Column<R, M>, R, M, Table.RowMeta>(readColumns, data, groups, {
      defaultNullValue: null,
      ordering,
      getRowMeta: (m: M) => ({
        ...models.DefaultRowMeta,
        children: !isNil(getModelChildren) ? getModelChildren(m) : [],
        label: !isNil(getModelLabel) ? getModelLabel(m) : m.id
      })
    });

    setTable(
      reduce(
        tableData,
        (rows: R[], rowGroup: GenericTable.RowGroup<R, M, Table.RowMeta>) => {
          let newRows: R[] = [
            ...rows,
            ...map(rowGroup.rows, (row: GenericTable.ModelWithRow<R, M, Table.RowMeta>) => row.row)
          ];
          if (!isNil(rowGroup.group)) {
            const footer: R | null = createGroupFooter(rowGroup.group);
            if (!isNil(footer)) {
              newRows = [...newRows, footer];
            }
          }
          return newRows;
        },
        []
      )
    );
  }, [useDeepEqualMemo(data), useDeepEqualMemo(columns), useDeepEqualMemo(groups), ordering]);

  useEffect(() => {
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
  }, [apis, focused]);

  useEffect(() => {
    if (!isNil(apis)) {
      apis.grid.setQuickFilter(search);
    }
  }, [search, apis]);

  const moveDownKeyListener = useDynamicCallback((localApi: GridApi, e: KeyboardEvent) => {
    const ctrlCmdPressed = e.ctrlKey || e.metaKey;
    if (e.key === "ArrowDown" && ctrlCmdPressed) {
      const focusedCell = localApi.getFocusedCell();
      if (!isNil(focusedCell)) {
        const node = localApi.getDisplayedRowAtIndex(focusedCell.rowIndex);
        if (!isNil(node)) {
          const row: R = node.data;
          if (!isNil(onRowExpand) && (isNil(rowCanExpand) || rowCanExpand(row))) {
            onRowExpand(row.id);
          }
        }
      }
    }
  });

  const moveUpKeyListener = useDynamicCallback((localApi: GridApi, e: KeyboardEvent) => {
    const ctrlCmdPressed = e.ctrlKey || e.metaKey;
    if (e.key === "ArrowUp" && ctrlCmdPressed) {
      !isNil(onBack) && onBack();
    }
  });

  useEffect(() => {
    const keyListeners = [moveDownKeyListener, moveUpKeyListener];
    if (!isNil(apis)) {
      const instantiatedListeners: ((e: KeyboardEvent) => void)[] = [];
      for (let i = 0; i < keyListeners.length; i++) {
        const listener = (e: KeyboardEvent) => keyListeners[i](apis.grid, e);
        window.addEventListener("keydown", listener);
        instantiatedListeners.push(listener);
      }
      return () => {
        for (let i = 0; i < instantiatedListeners.length; i++) {
          window.removeEventListener("keydown", instantiatedListeners[i]);
        }
      };
    }
  }, [apis]);

  const processCellForClipboard = useDynamicCallback((column: Table.Column<R, M>, row: R, value?: any) => {
    const processor = column.processCellForClipboard;
    if (!isNil(processor)) {
      return processor(row);
    } else {
      value = value === undefined ? getKeyValue<R, keyof R>(column.field as keyof R)(row) : value;
      // The value should never be undefined at this point.
      if (value === column.nullValue) {
        return "";
      }
      return value;
    }
  });

  const processCellValueFromClipboard = useDynamicCallback((column: Table.Column<R, M>, value: any) => {
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

  const processCellFromClipboard = useDynamicCallback((column: Table.Column<R, M>, row: R, value?: any) => {
    value = value === undefined ? getKeyValue<R, keyof R>(column.field as keyof R)(row) : value;
    return processCellValueFromClipboard(column, value);
  });

  const _processCellForClipboard = useDynamicCallback((params: ProcessCellForExportParams) => {
    if (!isNil(params.node)) {
      const customCol: Table.Column<R, M> | undefined = find(columns, { field: params.column.getColId() } as any);
      if (!isNil(customCol)) {
        setCutCellChange(null);
        return processCellForClipboard(customCol, params.node.data as R, params.value);
      }
    }
  });

  const _processCellFromClipboard = useDynamicCallback((params: ProcessCellForExportParams) => {
    if (!isNil(params.node)) {
      const node: RowNode = params.node;
      const customCol: Table.Column<R, M> | undefined = find(columns, { field: params.column.getColId() } as any);
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

  useImperativeHandle(gridRef, () => ({
    getCSVData: (fields?: string[]) => {
      if (!isNil(apis)) {
        const cs: Table.Column<R, M>[] = filter(
          columns,
          (column: Table.Column<R, M>) =>
            column.excludeFromExport !== true && (isNil(fields) || includes(fields, column.field))
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

  const onCellValueChanged = useDynamicCallback((e: CellValueChangedEvent) => {
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

  const onCellFocused = useDynamicCallback((e: CellFocusedEvent) => {
    const getCellFromFocusedEvent = (event: CellFocusedEvent, col?: Table.Column<R, M>): Table.Cell<R, M> | null => {
      if (!isNil(apis) && !isNil(event.rowIndex) && !isNil(event.column)) {
        const rowNode: RowNode | null = apis.grid.getDisplayedRowAtIndex(event.rowIndex);
        const column: Table.Column<R, M> | undefined = !isNil(col)
          ? col
          : find(columns, { field: event.column.getColId() } as any);
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

      const col: Table.Column<R, M> | undefined = find(columns, { field: e.column.getColId() } as any);
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

  const includeCellEditorParams = (def: Table.Column<R, M>): Table.Column<R, M> => {
    return { ...def, cellEditorParams: { ...def.cellEditorParams, onDoneEditing } };
  };

  return (
    <React.Fragment>
      {!isNil(apis) && (
        <BudgetTableMenu<R, M>
          apis={apis}
          actions={actions}
          search={search}
          onSearch={onSearch}
          columns={columns}
          detached={detached}
        />
      )}
      <div className={"table-grid"}>
        <Grid<R, M>
          {...options}
          columns={map(columns, (col: Table.Column<R, M>) => includeCellEditorParams(col))}
          getContextMenuItems={getContextMenuItems}
          // This is the same as checking if the onGridReady event has fired.
          rowData={!isNil(apis) ? table : []}
          getRowClass={getRowClass}
          getRowStyle={getRowStyle}
          rowSelection={"multiple"}
          immutableData={true}
          getRowNodeId={(r: any) => r.id}
          onGridReady={onGridReady}
          processDataFromClipboard={processDataFromClipboard}
          processCellForClipboard={_processCellForClipboard}
          processCellFromClipboard={_processCellFromClipboard}
          navigateToNextCell={navigateToNextCell}
          tabToNextCell={tabToNextCell}
          onCellKeyDown={onCellKeyDown}
          onFirstDataRendered={onFirstDataRendered}
          suppressKeyboardEvent={suppressKeyboardEvent}
          onCellFocused={onCellFocused}
          // rowDataChangeDetectionStrategy={ChangeDetectionStrategyType.DeepValueCheck}
          onCellEditingStarted={(event: CellEditingStartedEvent) => {
            oldRow.current = { ...event.node.data };
          }}
          onCellMouseOver={(e: CellMouseOverEvent) => {
            // In order to hide/show the expand button under certain conditions,
            // we always need to refresh the expand column whenever another cell
            // is hovered.  We should figure out if there is a way to optimize
            // this to only refresh under certain circumstances.
            if (
              includes(
                map(columns, (col: Table.Column<R, M>) => col.field),
                e.colDef.field
              )
            ) {
              const nodes: RowNode[] = [];

              const firstRow = e.api.getFirstDisplayedRow();
              const lastRow = e.api.getLastDisplayedRow();

              e.api.forEachNodeAfterFilter((node: RowNode, index: number) => {
                if (index >= firstRow && index <= lastRow) {
                  const row: R = node.data;
                  if (row.meta.isGroupFooter === false) {
                    nodes.push(node);
                  }
                }
              });
              e.api.refreshCells({ force: true, rowNodes: nodes, columns: ["expand"] });
            }
          }}
          frameworkComponents={frameworkComponents}
          onPasteStart={onPasteStart}
          onPasteEnd={onPasteEnd}
          onCellValueChanged={onCellValueChanged}
          fillOperation={(params: FillOperationParams) => {
            if (params.initialValues.length === 1) {
              return false;
            }
            return params.initialValues[
              (params.values.length - params.initialValues.length) % params.initialValues.length
            ];
          }}
        />
      </div>
    </React.Fragment>
  );
};

export default PrimaryGrid;
