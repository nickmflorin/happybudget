import { SyntheticEvent, useState, useEffect, useRef } from "react";
import classNames from "classnames";
import { map, isNil, includes, find, uniq, forEach, filter, flatten } from "lodash";
import { useLocation } from "react-router-dom";

import { CheckboxChangeEvent } from "antd/lib/checkbox";

import { AgGridReact } from "@ag-grid-community/react";
import { AllModules } from "@ag-grid-enterprise/all-modules";
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
  CellEditingStartedEvent
} from "@ag-grid-community/core";
import { FillOperationParams } from "@ag-grid-community/core/dist/cjs/entities/gridOptions";

import { TABLE_DEBUG } from "config";
import { useDynamicCallback, useDeepEqualMemo } from "lib/hooks";

import {
  ExpandCell,
  IndexCell,
  ValueCell,
  SubAccountUnitCell,
  IdentifierCell,
  CalculatedCell,
  PaymentMethodCell,
  BudgetItemCell,
  FringeUnitCell,
  BudgetFringesCell,
  TemplateFringesCell,
  HeaderCell,
  FringeColorCell
} from "../cells";
import {
  SubAccountUnitCellEditor,
  BudgetFringesCellEditor,
  FringeUnitCellEditor,
  TemplateFringesCellEditor,
  PaymentMethodCellEditor,
  BudgetItemsTreeEditor
} from "../editors";
import { PrimaryGridProps, CustomColDef, isKeyboardEvent } from "../model";
import { rangeSelectionIsSingleCell, originalColDef } from "../util";

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
  onRowUpdate,
  onRowBulkUpdate,
  onRowAdd,
  onRowDelete,
  onBack
}: PrimaryGridProps<R, G>): JSX.Element => {
  const [cellChangeEvents, setCellChangeEvents] = useState<CellValueChangedEvent[]>([]);
  const [focused, setFocused] = useState(false);
  // Stores the table change that will occur when clearing a value that has been "cut" when the
  // cell is pasted.
  const [cutCellChange, setCutCellChange] = useState<Table.RowChange<R> | null>(null);
  // TODO: Figure out a better way to do this.
  const oldRow = useRef<R | null>(null);
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
      return [nextRowNode, startingIndex + runningIndex, runningIndex];
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

  const moveToNextColumn = useDynamicCallback((rowIndex: number, column: Column) => {
    if (!isNil(api) && !isNil(columnApi)) {
      const columns = columnApi.getAllColumns();
      if (!isNil(columns)) {
        const index = columns.indexOf(column);
        if (index !== -1) {
          if (index === columns.length - 1) {
            // TODO: We need to move to the next row and if it is not present,
            // we need to add row.
            const nextColumn = columns[0];
            api.setFocusedCell(rowIndex, nextColumn);
            api.clearRangeSelection();
          } else {
            const nextColumn = columns[index + 1];
            api.setFocusedCell(rowIndex, nextColumn);
            api.clearRangeSelection();
          }
        }
      }
    }
  });

  const moveToNextRow = useDynamicCallback((rowIndex: number, column: Column, localApi?: GridApi) => {
    const local = !isNil(localApi) ? localApi : api;
    if (!isNil(local)) {
      let foundNonFooterRow = false;
      let nextRowNode: RowNode | null;
      let additionalIndex = 1;
      while (foundNonFooterRow === false) {
        nextRowNode = local.getDisplayedRowAtIndex(rowIndex + additionalIndex);
        if (isNil(nextRowNode)) {
          onRowAdd();
          local.setFocusedCell(rowIndex + additionalIndex, column);
          local.clearRangeSelection();
          foundNonFooterRow = true;
        } else {
          let row: R = nextRowNode.data;
          if (row.meta.isGroupFooter === false) {
            local.setFocusedCell(rowIndex + additionalIndex, column);
            local.clearRangeSelection();
            foundNonFooterRow = true;
          } else {
            additionalIndex = additionalIndex + 1;
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

  const onCellCut = useDynamicCallback((e: CellKeyDownEvent) => {
    // For whatever reason, in this specific case, AG Grid does not attach the GridApi to the
    // event.
    if (!isNil(api)) {
      const focusedCell = api.getFocusedCell();
      if (!isNil(focusedCell)) {
        const node = api.getDisplayedRowAtIndex(focusedCell.rowIndex);
        if (!isNil(node)) {
          const row: R = node.data;
          const customColDef = find(colDefs, (def: CustomColDef<R, G>) => def.field === focusedCell.column.getColId());
          if (!isNil(customColDef)) {
            const change = getTableChangesForCellClear(row, customColDef);
            if (!isNil(change)) {
              setCutCellChange(change);
            }
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
        // Need to get this working.
        // onCellCut(event.event);
      }
    }
  });

  const getTableChangesFromRangeClear = useDynamicCallback(
    (range: CellRange, gridApi?: GridApi): Table.RowChange<R>[] => {
      const rowChanges: Table.RowChange<R>[] = [];
      gridApi = isNil(gridApi) ? gridApi : api;
      if (!isNil(api) && !isNil(range.startRow) && !isNil(range.endRow)) {
        let colIds: (keyof R)[] = map(range.columns, (col: Column) => col.getColId() as keyof R);
        let startRowIndex = Math.min(range.startRow.rowIndex, range.endRow.rowIndex);
        let endRowIndex = Math.max(range.startRow.rowIndex, range.endRow.rowIndex);

        for (let i = startRowIndex; i <= endRowIndex; i++) {
          const node: RowNode | null = api.getDisplayedRowAtIndex(i);
          if (!isNil(node)) {
            const row: R = node.data;

            const rowChangeData: Table.RowChangeData<R> = {};
            /* eslint-disable no-loop-func */
            forEach(colIds, (colId: keyof R) => {
              const customColDef = find(colDefs, { field: colId } as any);
              // Only clear cells for which an onClear value is specified - otherwise it can cause bugs.
              if (!isNil(customColDef) && isCellEditable(row, customColDef)) {
                const clearValue = customColDef.nullValue !== undefined ? customColDef.nullValue : null;
                if (row[colId] === undefined || row[colId] !== clearValue) {
                  const change: Table.CellChange<any> = { oldValue: row[colId], newValue: clearValue };
                  rowChangeData[colId] = change;
                }
              }
            });
            if (Object.keys(rowChangeData).length !== 0) {
              const rowChange: Table.RowChange<R> = { id: row.id, data: rowChangeData };
              rowChanges.push(rowChange);
            }
          }
        }
      }
      return rowChanges;
    }
  );

  const getTableChangesForCellClear = useDynamicCallback(
    (row: R, def: CustomColDef<R, G>): Table.RowChange<R> | null => {
      const clearValue = def.nullValue !== undefined ? def.nullValue : null;
      const colId = def.field;
      if (row[colId] === undefined || row[colId] !== clearValue) {
        const change: Table.CellChange<any> = { oldValue: row[colId], newValue: clearValue };
        const rowChangeData: Table.RowChangeData<R> = {};
        rowChangeData[colId] = change;
        const rowChange: Table.RowChange<R> = { id: row.id, data: rowChangeData };
        return rowChange;
      } else {
        return null;
      }
    }
  );

  const getTableChangeFromEvent = (
    event: CellEditingStoppedEvent | CellValueChangedEvent
  ): Table.RowChange<R> | null => {
    const field = event.column.getColId() as keyof R;
    // AG Grid treats cell values as undefined when they are cleared via edit,
    // so we need to translate that back into a null representation.
    const customColDef: CustomColDef<R, G> | undefined = find(colDefs, { field } as any);
    if (!isNil(customColDef)) {
      const nullValue = customColDef.nullValue === undefined ? null : customColDef.nullValue;
      const oldValue = event.oldValue === undefined ? nullValue : event.oldValue;
      const newValue = event.newValue === undefined ? nullValue : event.newValue;
      if (oldValue !== newValue) {
        const change: Table.CellChange<R[keyof R]> = { oldValue, newValue };
        const d: { [key in keyof R]?: Table.CellChange<R[key]> } = {};
        d[field as keyof R] = change;
        return { id: event.data.id, data: d };
      }
    }
    return null;
  };

  const clearCellsOverRange = useDynamicCallback((range: CellRange | CellRange[], paramsApi?: GridApi) => {
    if (!isNil(onRowBulkUpdate)) {
      const rowChanges: Table.RowChange<R>[] = !Array.isArray(range)
        ? getTableChangesFromRangeClear(range, paramsApi)
        : flatten(map(range, (rng: CellRange) => getTableChangesFromRangeClear(rng, paramsApi)));
      if (rowChanges.length !== 0) {
        // NOTE: If there are changes corresponding to rows that span multiple ranges, the task
        // will consolidate/merge these changes to reduce the request payload.
        onRowBulkUpdate(rowChanges);
      }
    }
  });

  const clearCell = useDynamicCallback((row: R, def: CustomColDef<R, G>) => {
    const tableChange = getTableChangesForCellClear(row, def);
    if (!isNil(tableChange)) {
      onRowUpdate(tableChange);
    }
  });

  const onPasteStart = useDynamicCallback((event: PasteStartEvent) => {
    setCellChangeEvents([]);
  });

  const onPasteEnd = useDynamicCallback((event: PasteEndEvent) => {
    if (!isNil(onRowBulkUpdate)) {
      if (cellChangeEvents.length === 1) {
        const tableChange = getTableChangeFromEvent(cellChangeEvents[0]);
        if (!isNil(tableChange)) {
          if (!isNil(cutCellChange)) {
            onRowBulkUpdate([tableChange, cutCellChange]);
            setCutCellChange(null);
          } else {
            onRowUpdate(tableChange);
          }
        }
      } else if (cellChangeEvents.length !== 0) {
        const changes = filter(
          map(cellChangeEvents, (e: CellValueChangedEvent) => getTableChangeFromEvent(e)),
          (change: Table.RowChange<R> | null) => change !== null
        ) as Table.RowChange<R>[];
        if (changes.length !== 0) {
          if (!isNil(cutCellChange)) {
            onRowBulkUpdate([...changes, cutCellChange]);
            setCutCellChange(null);
          } else {
            onRowBulkUpdate(changes);
          }
        }
      }
    }
  });

  const _onCellValueChanged = useDynamicCallback((event: CellValueChangedEvent) => {
    if (event.source === "paste") {
      setCellChangeEvents([...cellChangeEvents, event]);
    } else {
      const tableChange = getTableChangeFromEvent(event);
      if (!isNil(tableChange)) {
        onRowUpdate(tableChange);
        onCellValueChanged({
          row: event.node.data as R,
          oldRow: oldRow.current,
          column: event.column,
          oldValue: event.oldValue,
          newValue: event.newValue,
          change: tableChange,
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
        const customColDef = find(colDefs, (def: CustomColDef<R, G>) => def.field === column.getColId());
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
    // Changes to the errors in the rows does not trigger a refresh of those cells via AG Grid
    // because AG Grid cannot detect changes in that type of data structure for the row.
    if (!isNil(api) && !isNil(columnApi)) {
      api.forEachNode((node: RowNode) => {
        const existing: R | undefined = find(table, { id: node.data.id });
        if (!isNil(existing)) {
          // TODO: We might want to do a deeper comparison in the future here.
          if (existing.meta.errors.length !== node.data.meta.errors.length) {
            const cols = columnApi.getAllColumns();
            forEach(cols, (col: Column) => {
              const colDef = col.getColDef();
              if (!isNil(colDef.field)) {
                const cellErrors = filter(existing.meta.errors, { id: node.data.id, field: colDef.field });
                if (cellErrors.length !== 0) {
                  col.setColDef({ ...colDef, cellClass: "cell--error" }, null);
                  api.refreshCells({ force: true, rowNodes: [node], columns: [col] });
                }
              }
            });
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

  const includeCellEditorParams = (def: CustomColDef<R, G>): CustomColDef<R, G> => {
    return { ...def, cellEditorParams: { ...def.cellEditorParams, onDoneEditing } };
  };

  return (
    <div className={"table-grid"}>
      <AgGridReact
        {...options}
        columnDefs={map(colDefs, (colDef: CustomColDef<R, G>) => originalColDef(includeCellEditorParams(colDef)))}
        getContextMenuItems={getContextMenuItems}
        allowContextMenuWithControlKey={true}
        // Required to get processCellFromClipboard to work with column spanning.
        suppressCopyRowsToClipboard={true}
        rowData={table}
        debug={process.env.NODE_ENV === "development" && TABLE_DEBUG}
        getRowNodeId={(r: any) => r.id}
        getRowClass={getRowClass}
        immutableData={true}
        suppressRowClickSelection={true}
        onGridReady={onGridReady}
        /* @ts-ignore */
        modules={AllModules}
        processCellForClipboard={(params: ProcessCellForExportParams) => {
          if (!isNil(params.node)) {
            setCutCellChange(null);
            return processCellForClipboard(params.column, params.node.data as R, params.value);
          }
        }}
        processCellFromClipboard={(params: ProcessCellForExportParams) => {
          if (!isNil(params.node)) {
            return processCellFromClipboard(params.column, params.node.data as R, params.value);
          }
        }}
        undoRedoCellEditing={true}
        undoRedoCellEditingLimit={5}
        stopEditingWhenGridLosesFocus={true}
        rowHeight={36}
        headerHeight={38}
        enableRangeSelection={true}
        animateRows={true}
        overlayNoRowsTemplate={"<span></span>"}
        overlayLoadingTemplate={"<span></span>"}
        navigateToNextCell={navigateToNextCell}
        // onCellEditingStopped={(e: CellEditingStoppedEvent) => {
        //   const focusedCell = e.api.getFocusedCell();
        //   if (!isNil(focusedCell) && !isNil(focusedCell.rowIndex)) {
        //     moveToNextRow(focusedCell.rowIndex, focusedCell.column);
        //   }
        // }}
        onCellKeyDown={onCellKeyDown}
        onFirstDataRendered={onFirstDataRendered}
        suppressKeyboardEvent={suppressKeyboardEvent}
        onCellEditingStarted={(event: CellEditingStartedEvent) => {
          oldRow.current = { ...event.node.data };
        }}
        // NOTE: This might not be 100% necessary, because of how efficiently
        // we are managing the state updates to the data that flows into the table.
        // However, for now we will leave.  It is important to note that this will
        // cause the table renders to be slower for large datasets.
        rowDataChangeDetectionStrategy={ChangeDetectionStrategyType.DeepValueCheck}
        enterMovesDown={false}
        frameworkComponents={{
          ExpandCell,
          IndexCell,
          ValueCell,
          SubAccountUnitCell,
          FringeUnitCell,
          IdentifierCell,
          CalculatedCell,
          PaymentMethodCell,
          BudgetItemCell,
          BudgetFringesCell,
          TemplateFringesCell,
          FringeColorCell,
          FringeUnitCellEditor,
          BudgetFringesCellEditor,
          TemplateFringesCellEditor,
          SubAccountUnitCellEditor,
          PaymentMethodCellEditor,
          BudgetItemsTreeEditor,
          agColumnHeader: HeaderCell,
          ...frameworkComponents
        }}
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
