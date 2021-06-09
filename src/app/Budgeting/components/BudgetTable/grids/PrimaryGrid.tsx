import { SyntheticEvent, useState, useEffect, useRef } from "react";
import classNames from "classnames";
import { map, isNil, includes, find, uniq, forEach, filter, flatten } from "lodash";
import { useLocation } from "react-router-dom";

import { CheckboxChangeEvent } from "antd/lib/checkbox";

import { ChangeDetectionStrategyType } from "@ag-grid-community/react/lib/changeDetectionService";
import {
  CellEditingStoppedEvent,
  GridApi,
  GridReadyEvent,
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
  CellRange,
  CellEditingStartedEvent,
  CellMouseOverEvent
} from "@ag-grid-community/core";
import { FillOperationParams } from "@ag-grid-community/core/dist/cjs/entities/gridOptions";

import { useDynamicCallback, useDeepEqualMemo } from "lib/hooks";
import { isKeyboardEvent } from "lib/model/typeguards";
import { rangeSelectionIsSingleCell } from "../util";
import Grid from "./Grid";

const PrimaryGrid = <R extends Table.Row<G>, G extends Model.Group = Model.Group>({
  /* eslint-disable indent */
  api,
  columnApi,
  table,
  groups = [],
  options,
  colDefs,
  groupParams,
  frameworkComponents,
  search,
  sizeColumnsToFit,
  identifierField,
  processCellForClipboard,
  processCellFromClipboard,
  onCellValueChanged,
  setAllSelected,
  isCellEditable,
  setApi,
  setColumnApi,
  rowCanExpand,
  onRowExpand,
  onTableChange,
  onRowAdd,
  onRowDelete,
  onBack
}: BudgetTable.PrimaryGridProps<R, G>): JSX.Element => {
  const [cellChangeEvents, setCellChangeEvents] = useState<CellValueChangedEvent[]>([]);
  const [focused, setFocused] = useState(false);
  // Right now, we can only support Cut/Paste for 1 cell at a time.  Multi-cell
  // cut/paste needs to be built in.
  const [cutCellChange, setCutCellChange] = useState<Table.CellChange<R> | null>(null);
  const oldRow = useRef<R | null>(null); // TODO: Figure out a better way to do this.
  const location = useLocation();

  const onFirstDataRendered = useDynamicCallback((event: FirstDataRenderedEvent): void => {
    if (sizeColumnsToFit === true) {
      event.api.sizeColumnsToFit();
    }
    event.api.ensureIndexVisible(0);

    const query = new URLSearchParams(location.search);
    const rowId = query.get("row");
    const cols = event.columnApi.getAllColumns();

    if (!isNil(cols)) {
      let identifierCol = event.columnApi.getColumn(identifierField);
      if (isNil(identifierCol)) {
        identifierCol = cols[0];
      }
      if (!isNil(identifierCol)) {
        let focusedOnQuery = false;
        if (!isNil(rowId) && !isNaN(parseInt(rowId))) {
          const node = event.api.getRowNode(String(rowId));
          if (!isNil(node) && !isNil(node.rowIndex) && !isNil(identifierCol)) {
            event.api.setFocusedCell(node.rowIndex, identifierCol);
            node.setSelected(true);
            focusedOnQuery = true;
          }
        }
        if (focusedOnQuery === false) {
          event.api.setFocusedCell(0, identifierCol);
          const selectedRow = event.api.getDisplayedRowAtIndex(0);
          selectedRow?.setSelected(true);
        }
      }
    }
  });

  const onGridReady = useDynamicCallback((event: GridReadyEvent): void => {
    setApi(event.api);
    setColumnApi(event.columnApi);
  });

  /**
   * Starting at the provided index, either traverses the table upwards or downwards
   * until a RowNode that is not used as a group footer is found.
   */
  const findFirstNonGroupFooterRow = useDynamicCallback((startingIndex: number, direction: "asc" | "desc" = "asc"): [
    RowNode | null,
    number,
    number
  ] => {
    if (!isNil(api)) {
      let runningIndex = 0;
      let noMoreRows = false;
      let nextRowNode: RowNode | null = null;

      while (noMoreRows === false) {
        if (direction === "desc" && startingIndex - runningIndex < 0) {
          noMoreRows = true;
          break;
        }
        nextRowNode = api.getDisplayedRowAtIndex(
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
  });

  /**
   * Starting at the provided node, traverses the table upwards and collects
   * all of the RowNode(s) until a RowNode that is the footer for a group above
   * the provided node is reached.
   */
  const findRowsUpUntilFirstGroupFooterRow = useDynamicCallback((node: RowNode): RowNode[] => {
    const nodes: RowNode[] = [node];
    if (!isNil(api)) {
      let currentNode: RowNode | null = node;
      while (!isNil(currentNode) && !isNil(currentNode.rowIndex) && currentNode.rowIndex >= 1) {
        currentNode = api.getDisplayedRowAtIndex(currentNode.rowIndex - 1);
        if (!isNil(currentNode)) {
          const row: R = currentNode.data;
          if (row.meta.isGroupFooter === true) {
            break;
          } else {
            // NOTE: In practice, we will never reach a non-group footer node that belongs to a group
            // before we reach the group footer node, so as long as the ordering/grouping of rows
            // is consistent.  However, we will also make sure that the row does not belong to a group
            // for safety.
            if (isNil(row.group) && !(row.meta.isPlaceholder === true)) {
              nodes.push(currentNode);
            }
          }
        }
      }
    }
    return nodes;
  });

  const navigateToNextCell = useDynamicCallback(
    (params: NavigateToNextCellParams): CellPosition => {
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
    }
  );

  const tabToNextCell = useDynamicCallback((params: TabToNextCellParams) => {
    if (!params.editing && !isNil(columnApi) && !isNil(api)) {
      // If the nextCellPosition is null, it means we are at the bottom of the table
      // all the way in the Column furthest to the right.
      if (isNil(params.nextCellPosition)) {
        // TODO: We need to figure out how to move down to the next cell!  This
        // is tricky, because we have to wait for the row to be present in state.
        onRowAdd();
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

          if (params.backwards === false) {
            const identifierCol = columnApi.getColumn(identifierField);
            if (!isNil(identifierCol)) {
              return { ...nextCellPosition, column: identifierCol };
            }
          } else {
            const columns = columnApi.getAllColumns();
            if (!isNil(columns)) {
              return { ...nextCellPosition, column: columns[columns.length - 1] };
            }
          }
        }
      }
    }
    return params.nextCellPosition;
  });

  const moveToLocation = useDynamicCallback((loc: CellPosition, opts: BudgetTable.CellPositionMoveOptions = {}) => {
    if (!isNil(api)) {
      api.setFocusedCell(loc.rowIndex, loc.column);
      api.clearRangeSelection();
      if (opts.startEdit === true) {
        api.startEditingCell({ rowIndex: loc.rowIndex, colKey: loc.column });
      }
    }
  });

  const moveToNextRow = useDynamicCallback((loc: CellPosition, opts: BudgetTable.CellPositionMoveOptions = {}) => {
    if (!isNil(api)) {
      const [node, rowIndex, _] = findFirstNonGroupFooterRow(loc.rowIndex + 1);
      if (node === null) {
        onRowAdd();
      }
      moveToLocation({ rowIndex, column: loc.column }, opts);
    }
  });

  const moveToNextColumn = useDynamicCallback((loc: CellPosition, opts: BudgetTable.CellPositionMoveOptions = {}) => {
    if (!isNil(api) && !isNil(columnApi)) {
      const columns = columnApi.getAllColumns();
      if (!isNil(columns)) {
        const index = columns.indexOf(loc.column);
        if (index !== -1) {
          if (index === columns.length - 1) {
            moveToNextRow({ rowIndex: loc.rowIndex, column: columns[0] }, opts);
          } else {
            moveToLocation({ rowIndex: loc.rowIndex, column: columns[index + 1] }, opts);
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
        const customColDef = find(
          colDefs,
          (def: BudgetTable.ColDef<R, G>) => def.field === focusedCell.column.getColId()
        );
        if (!isNil(customColDef)) {
          const change = getCellChangeForClear(row, customColDef);
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
  const onDoneEditing = useDynamicCallback((e: SyntheticEvent | KeyboardEvent | CheckboxChangeEvent) => {
    if (isKeyboardEvent(e) && !isNil(api)) {
      const focusedCell = api.getFocusedCell();
      if (!isNil(focusedCell) && !isNil(focusedCell.rowIndex)) {
        if (e.code === "Enter") {
          moveToNextRow(focusedCell.rowIndex, focusedCell.column);
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

  const getCellChangeForClear = useDynamicCallback(
    (row: R, def: BudgetTable.ColDef<R, G>): Table.CellChange<R> | null => {
      const clearValue = def.nullValue !== undefined ? def.nullValue : null;
      const colId = def.field;
      if (row[colId] === undefined || row[colId] !== clearValue) {
        const change: Table.CellChange<R> = {
          oldValue: row[colId],
          newValue: clearValue as R[keyof R],
          id: row.id,
          field: colId
        };
        return change;
      } else {
        return null;
      }
    }
  );

  const getTableChangesFromRangeClear = useDynamicCallback(
    (range: CellRange, gridApi?: GridApi): Table.CellChange<R>[] => {
      const changes: Table.CellChange<R>[] = [];
      gridApi = isNil(gridApi) ? gridApi : api;
      if (!isNil(api) && !isNil(range.startRow) && !isNil(range.endRow)) {
        let colIds: (keyof R)[] = map(range.columns, (col: Column) => col.getColId() as keyof R);
        let startRowIndex = Math.min(range.startRow.rowIndex, range.endRow.rowIndex);
        let endRowIndex = Math.max(range.startRow.rowIndex, range.endRow.rowIndex);
        for (let i = startRowIndex; i <= endRowIndex; i++) {
          const node: RowNode | null = api.getDisplayedRowAtIndex(i);
          if (!isNil(node)) {
            const row: R = node.data;
            /* eslint-disable no-loop-func */
            forEach(colIds, (colId: keyof R) => {
              const customColDef = find(colDefs, { field: colId } as any);
              if (!isNil(customColDef) && isCellEditable(row, customColDef)) {
                const change = getCellChangeForClear(row, customColDef);
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
  ): Table.CellChange<R> | null => {
    const field = event.column.getColId() as keyof R;
    // AG Grid treats cell values as undefined when they are cleared via edit,
    // so we need to translate that back into a null representation.
    const customColDef: BudgetTable.ColDef<R, G> | undefined = find(colDefs, { field } as any);
    if (!isNil(customColDef)) {
      const nullValue = customColDef.nullValue === undefined ? null : customColDef.nullValue;
      const oldValue = event.oldValue === undefined ? nullValue : event.oldValue;
      const newValue = event.newValue === undefined ? nullValue : event.newValue;
      if (oldValue !== newValue) {
        const change: Table.CellChange<R> = { oldValue, newValue, field, id: event.data.id };
        return change;
      }
    }
    return null;
  };

  const clearCellsOverRange = useDynamicCallback((range: CellRange | CellRange[], paramsApi?: GridApi) => {
    const changes: Table.CellChange<R>[] = !Array.isArray(range)
      ? getTableChangesFromRangeClear(range, paramsApi)
      : flatten(map(range, (rng: CellRange) => getTableChangesFromRangeClear(rng, paramsApi)));
    onTableChange(changes);
  });

  const clearCell = useDynamicCallback((row: R, def: BudgetTable.ColDef<R, G>) => {
    const change = getCellChangeForClear(row, def);
    if (!isNil(change)) {
      onTableChange(change);
    }
  });

  const onPasteStart = useDynamicCallback((event: PasteStartEvent) => {
    setCellChangeEvents([]);
  });

  const onPasteEnd = useDynamicCallback((event: PasteEndEvent) => {
    const changes = filter(
      map(cellChangeEvents, (e: CellValueChangedEvent) => getCellChangeFromEvent(e)),
      (change: Table.CellChange<R> | null) => change !== null
    ) as Table.CellChange<R>[];
    onTableChange(changes);
  });

  const _onCellValueChanged = useDynamicCallback((event: CellValueChangedEvent) => {
    if (event.source === "paste") {
      setCellChangeEvents([...cellChangeEvents, event]);
    } else {
      const change = getCellChangeFromEvent(event);
      if (!isNil(change)) {
        onTableChange(change);
        onCellValueChanged({
          row: event.node.data as R,
          oldRow: oldRow.current,
          column: event.column,
          oldValue: event.oldValue,
          newValue: event.newValue,
          change: change,
          node: event.node
        });
      }
    }
  });

  const getRowClass = (params: RowClassParams) => {
    if (params.node.data.meta.isGroupFooter === true) {
      let colorClass = params.node.data.group.color;
      if (!isNil(colorClass)) {
        if (colorClass.startsWith("#")) {
          colorClass = params.node.data.group.color.slice(1);
        }
        return classNames("row--group-footer", `bg-${colorClass}`);
      }
    }
  };

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
        const group = row.group;
        return [
          {
            name: `Ungroup ${group.name}`,
            action: () => groupParams.onDeleteGroup(group)
          }
        ];
      }
      return [];
    } else {
      const deleteRowContextMenuItem: MenuItemDef = {
        name: `Delete ${row.meta.label}`,
        action: () => onRowDelete(row)
      };
      if (isNil(groupParams) || row.meta.isPlaceholder) {
        return [deleteRowContextMenuItem];
      } else if (!isNil(row.group)) {
        return [
          deleteRowContextMenuItem,
          {
            name: `Remove ${row.meta.label} from Group ${row.group.name}`,
            action: () => groupParams.onRowRemoveFromGroup(row)
          }
        ];
      } else {
        const menuItems: MenuItemDef[] = [deleteRowContextMenuItem];

        const groupableNodesAbove = findRowsUpUntilFirstGroupFooterRow(params.node);
        if (groupableNodesAbove.length !== 0) {
          let label: string;
          if (groupableNodesAbove.length === 1) {
            label = `Group ${groupableNodesAbove[0].data.meta.typeLabel} ${groupableNodesAbove[0].data.meta.label}`;
          } else {
            label = `Group ${groupableNodesAbove[0].data.meta.typeLabel}s ${
              groupableNodesAbove[groupableNodesAbove.length - 1].data.meta.label
            } - ${groupableNodesAbove[0].data.meta.label}`;
          }
          menuItems.push({
            name: label,
            action: () => groupParams.onGroupRows(map(groupableNodesAbove, (n: RowNode) => n.data as R))
          });
        }
        if (groups.length !== 0) {
          menuItems.push({
            name: "Add to Group",
            subMenu: map(groups, (group: G) => ({
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
    // Suppress Backspace/Delete events when multiple cells are selected in a range.
    if (!isNil(params.api) && !params.editing && includes(["Backspace", "Delete"], params.event.code)) {
      const ranges = params.api.getCellRanges();
      if (!isNil(ranges) && (ranges.length !== 1 || !rangeSelectionIsSingleCell(ranges[0]))) {
        clearCellsOverRange(ranges, params.api);
        return true;
      } else {
        const column = params.column;
        const customColDef = find(colDefs, (def: BudgetTable.ColDef<R, G>) => def.field === column.getColId());
        if (!isNil(customColDef)) {
          // Note:  This is a work around for not being able to clear the values of cells without going
          // into edit mode.  For custom Cell Editor(s) with a Pop-Up, we don't want to open the Pop-Up
          // everytime we click Backspace/Delete - so we prevent those key presses from triggering
          // edit mode in the Cell Editor and clear the value at this level.
          if (customColDef.clearBeforeEdit === true) {
            const row: R = params.node.data;
            clearCell(row, customColDef);
            return true;
          } else {
            return false;
          }
        } else {
          return false;
        }
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

  useEffect(() => {
    if (!isNil(columnApi) && !isNil(api)) {
      const firstEditCol = columnApi.getAllDisplayedColumns()[2];
      if (!isNil(firstEditCol) && focused === false) {
        api.ensureIndexVisible(0);
        api.ensureColumnVisible(firstEditCol);
        setTimeout(() => api.setFocusedCell(0, firstEditCol), 500);
        // TODO: Investigate if there is a better way to do this - currently,
        // this hook is getting triggered numerous times when it shouldn't be.
        // It is because the of the `columns` in the dependency array, which
        // are necessary to get a situation when `firstEditCol` is not null,
        // but also shouldn't be triggering this hook so many times.
        setFocused(true);
      }
    }
  }, [columnApi, api, focused]);

  useEffect(() => {
    if (!isNil(api)) {
      api.setQuickFilter(search);
    }
  }, [search, api]);

  useEffect(() => {
    // Changes to the state of the selected rows does not trigger a refresh of those cells via AG
    // Grid because AG Grid cannot detect changes to the values of cells when the cell is HTML based.
    if (!isNil(api) && !isNil(columnApi)) {
      api.forEachNode((node: RowNode) => {
        const existing: R | undefined = find(table, { id: node.data.id });
        if (!isNil(existing)) {
          if (existing.meta.selected !== node.data.meta.selected) {
            const cols = columnApi.getAllColumns();
            const selectCol = find(cols, (col: Column) => {
              const def = col.getColDef();
              if (def.field === "index") {
                return true;
              }
              return false;
            });
            if (!isNil(selectCol)) {
              api.refreshCells({ force: true, rowNodes: [node], columns: [selectCol] });
            }
          }
        }
      });
    }
  }, [useDeepEqualMemo(table), api, columnApi]);

  useEffect(() => {
    const mapped = map(table, (row: R) => row.meta.selected);
    const uniques = uniq(mapped);
    if (uniques.length === 1 && uniques[0] === true) {
      setAllSelected(true);
    } else {
      setAllSelected(false);
    }
  }, [useDeepEqualMemo(table)]);

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
    if (!isNil(api)) {
      const instantiatedListeners: ((e: KeyboardEvent) => void)[] = [];
      for (let i = 0; i < keyListeners.length; i++) {
        const listener = (e: KeyboardEvent) => keyListeners[i](api, e);
        window.addEventListener("keydown", listener);
        instantiatedListeners.push(listener);
      }
      return () => {
        for (let i = 0; i < instantiatedListeners.length; i++) {
          window.removeEventListener("keydown", instantiatedListeners[i]);
        }
      };
    }
  }, [api]);

  const includeCellEditorParams = (def: BudgetTable.ColDef<R, G>): BudgetTable.ColDef<R, G> => {
    return { ...def, cellEditorParams: { ...def.cellEditorParams, onDoneEditing } };
  };

  const _processCellFromClipboard = useDynamicCallback((params: ProcessCellForExportParams) => {
    if (!isNil(params.node)) {
      const node: RowNode = params.node;
      if (!isNil(cutCellChange)) {
        params = { ...params, value: cutCellChange.oldValue };
        onTableChange(cutCellChange);
        setCutCellChange(null);
      }
      return processCellFromClipboard(params.column, node.data as R, params.value);
    }
  });

  return (
    <div className={"table-grid"}>
      <Grid
        {...options}
        columnDefs={map(colDefs, (colDef: BudgetTable.ColDef<R, G>) => includeCellEditorParams(colDef))}
        getContextMenuItems={getContextMenuItems}
        rowData={table}
        getRowNodeId={(r: any) => r.id}
        getRowClass={getRowClass}
        immutableData={true}
        onGridReady={onGridReady}
        processCellForClipboard={(params: ProcessCellForExportParams) => {
          if (!isNil(params.node)) {
            setCutCellChange(null);
            return processCellForClipboard(params.column, params.node.data as R, params.value);
          }
        }}
        processCellFromClipboard={_processCellFromClipboard}
        navigateToNextCell={navigateToNextCell}
        tabToNextCell={tabToNextCell}
        onCellKeyDown={onCellKeyDown}
        onFirstDataRendered={onFirstDataRendered}
        suppressKeyboardEvent={suppressKeyboardEvent}
        onCellEditingStarted={(event: CellEditingStartedEvent) => {
          oldRow.current = { ...event.node.data };
        }}
        onCellMouseOver={(e: CellMouseOverEvent) => {
          // In order to hide/show the expand button under certain conditions,
          // we always need to refresh the expand column whenever another cell
          // is hovered.  We should figure out if there is a way to optimize
          // this to only refresh under certain circumstances.
          const nodes: RowNode[] = [];
          e.api.forEachNode((node: RowNode) => {
            const row: R = node.data;
            if (row.meta.isPlaceholder === false && row.meta.isGroupFooter === false) {
              nodes.push(node);
            }
          });
          e.api.refreshCells({ force: true, rowNodes: nodes, columns: ["expand"] });
        }}
        // NOTE: This might not be 100% necessary, because of how efficiently
        // we are managing the state updates to the data that flows into the table.
        // However, for now we will leave.  It is important to note that this will
        // cause the table renders to be slower for large datasets.
        rowDataChangeDetectionStrategy={ChangeDetectionStrategyType.DeepValueCheck}
        frameworkComponents={frameworkComponents}
        onPasteStart={onPasteStart}
        onPasteEnd={onPasteEnd}
        onCellValueChanged={_onCellValueChanged}
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
  );
};

export default PrimaryGrid;
