import { useState, useEffect } from "react";
import classNames from "classnames";
import { map, isNil, includes, find, uniq, forEach, filter, flatten } from "lodash";

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
  CellRange
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
  PaymentMethodCellEditor
} from "../editors";
import { PrimaryGridProps, CustomColDef } from "../model";
import { rangeSelectionIsSingleCell } from "../util";

const PrimaryGrid = <
  R extends Table.Row<G>,
  M extends Model.Model,
  G extends Model.Group = Model.Group,
  P extends Http.ModelPayload<M> = Http.ModelPayload<M>
>({
  /* eslint-disable indent */
  api,
  columnApi,
  table,
  manager,
  groups = [],
  options,
  colDefs,
  groupParams,
  frameworkComponents,
  search,
  sizeColumnsToFit,
  processCellForClipboard = {},
  rowRefreshRequired,
  setAllSelected,
  isCellEditable,
  setApi,
  setColumnApi,
  onRowUpdate,
  onRowBulkUpdate,
  onRowAdd,
  onRowDelete
}: PrimaryGridProps<R, M, G, P>): JSX.Element => {
  const [cellChangeEvents, setCellChangeEvents] = useState<CellValueChangedEvent[]>([]);
  const [focused, setFocused] = useState(false);

  const onFirstDataRendered = useDynamicCallback((event: FirstDataRenderedEvent): void => {
    if (sizeColumnsToFit === true) {
      event.api.sizeColumnsToFit();
    }
    event.api.ensureIndexVisible(0);

    const cols = event.columnApi.getAllColumns();
    if (!isNil(cols)) {
      const identifierCol: Column | undefined = find(cols, obj => obj.getColId() === "identifier");
      if (!isNil(identifierCol)) {
        event.api.setFocusedCell(0, identifierCol);
        const selectedRow = event.api.getDisplayedRowAtIndex(0);
        selectedRow?.setSelected(true);
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

  const onCellKeyDown = useDynamicCallback((event: CellKeyDownEvent) => {
    if (!isNil(event.rowIndex) && !isNil(event.event)) {
      // I do not understand why AGGrid's Event has an underlying Event that is in
      // reality a KeyboardEvent but does not have any of the properties that a KeyboardEvent
      // should have - meaning we have to tell TS to ignore this line.
      /* @ts-ignore */
      if (event.event.keyCode === 13) {
        const editing = event.api.getEditingCells();
        if (editing.length === 0) {
          const firstEditCol = event.columnApi.getColumn(event.column.getColId());
          if (!isNil(firstEditCol)) {
            event.api.ensureColumnVisible(firstEditCol);

            let foundNonFooterRow = false;
            let nextRowNode: RowNode | null;
            let additionalIndex = 1;
            while (foundNonFooterRow === false) {
              nextRowNode = event.api.getDisplayedRowAtIndex(event.rowIndex + additionalIndex);
              if (isNil(nextRowNode)) {
                onRowAdd();
                event.api.setFocusedCell(event.rowIndex + additionalIndex, firstEditCol);
                event.api.clearRangeSelection();
                foundNonFooterRow = true;
              } else {
                let row: R = nextRowNode.data;
                if (row.meta.isGroupFooter === false) {
                  event.api.setFocusedCell(event.rowIndex + additionalIndex, firstEditCol);
                  event.api.clearRangeSelection();
                  foundNonFooterRow = true;
                } else {
                  additionalIndex = additionalIndex + 1;
                }
              }
            }
          }
        }
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
                const clearValue = customColDef.onClearValue !== undefined ? customColDef.onClearValue : null;
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

  const getTableChangesFromCellClear = useDynamicCallback(
    (row: R, def: CustomColDef<R, G>): Table.RowChange<R> | null => {
      const clearValue = def.onClearValue !== undefined ? def.onClearValue : null;
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
    // NOTE: We want to allow the setting of fields to `null` - so we just have to make sure it is
    // not `undefined`.
    if (event.newValue !== undefined) {
      if (event.oldValue === undefined || event.oldValue !== event.newValue) {
        const change: Table.CellChange<R[keyof R]> = { oldValue: event.oldValue, newValue: event.newValue };
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
    const tableChange = getTableChangesFromCellClear(row, def);
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
          onRowUpdate(tableChange);
        }
      } else if (cellChangeEvents.length !== 0) {
        const changes = filter(
          map(cellChangeEvents, (e: CellValueChangedEvent) => getTableChangeFromEvent(e)),
          (change: Table.RowChange<R> | null) => change !== null
        ) as Table.RowChange<R>[];
        if (changes.length !== 0) {
          onRowBulkUpdate(changes);
        }
      }
    }
  });

  const onCellValueChanged = useDynamicCallback((event: CellValueChangedEvent) => {
    if (event.source === "paste") {
      setCellChangeEvents([...cellChangeEvents, event]);
    } else {
      const tableChange = getTableChangeFromEvent(event);
      if (!isNil(tableChange)) {
        onRowUpdate(tableChange);
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
    if (!isNil(api) && !isNil(rowRefreshRequired)) {
      api.forEachNode((node: RowNode) => {
        const existing: R | undefined = find(table, { id: node.data.id });
        if (!isNil(existing)) {
          // TODO: We should figure out how to configure the API to just refresh the row at the
          // relevant column.
          if (rowRefreshRequired(existing, node.data)) {
            api.refreshCells({ force: true, rowNodes: [node] });
          }
        }
      });
    }
  }, [useDeepEqualMemo(table), api, rowRefreshRequired]);

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
  return (
    <div className={"table-grid"}>
      <AgGridReact
        {...options}
        columnDefs={colDefs}
        getContextMenuItems={getContextMenuItems}
        allowContextMenuWithControlKey={true}
        rowData={table}
        debug={process.env.NODE_ENV === "development" && TABLE_DEBUG}
        getRowNodeId={(r: any) => r.id}
        getRowClass={getRowClass}
        immutableData={true}
        suppressRowClickSelection={true}
        onGridReady={onGridReady}
        /* @ts-ignore */
        modules={AllModules}
        onCellKeyPress={(event: any) => {
          if (!isNil(event.event) && event.event.code === "Enter") {
            event.event.stopImmediatePropagation();
          }
        }}
        processCellForClipboard={(params: ProcessCellForExportParams) => {
          if (!isNil(params.node)) {
            const row: R = params.node.data;
            const colDef = params.column.getColDef();
            if (!isNil(colDef.field)) {
              const processor = processCellForClipboard[colDef.field as keyof R];
              if (!isNil(processor)) {
                return processor(row);
              } else {
                const field = manager.getField(colDef.field as keyof R);
                if (field !== null) {
                  return field.getClipboardValue(row);
                }
              }
            }
          }
          return "";
        }}
        rowHeight={36}
        headerHeight={38}
        enableRangeSelection={true}
        animateRows={true}
        overlayNoRowsTemplate={"<span></span>"}
        overlayLoadingTemplate={"<span></span>"}
        navigateToNextCell={navigateToNextCell}
        onCellKeyDown={onCellKeyDown}
        onFirstDataRendered={onFirstDataRendered}
        suppressKeyboardEvent={suppressKeyboardEvent}
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
          agColumnHeader: HeaderCell,
          ...frameworkComponents
        }}
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
  );
};

export default PrimaryGrid;
