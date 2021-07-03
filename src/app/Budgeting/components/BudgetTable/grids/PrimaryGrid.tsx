import React from "react";
import { SyntheticEvent, useState, useEffect, useRef, useImperativeHandle } from "react";
import { map, isNil, includes, find, forEach, filter, flatten, reduce, groupBy } from "lodash";
import { useLocation } from "react-router-dom";

import { CheckboxChangeEvent } from "antd/lib/checkbox";

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
  CellMouseOverEvent
} from "@ag-grid-community/core";
import { FillOperationParams } from "@ag-grid-community/core/dist/cjs/entities/gridOptions";

import * as models from "lib/model";
import { orderByFieldOrdering, getKeyValue } from "lib/util";
import { useDynamicCallback, useDeepEqualMemo } from "lib/hooks";
import { getGroupColorDefinition } from "lib/model/util";
import { isKeyboardEvent } from "lib/model/typeguards";
import { rangeSelectionIsSingleCell } from "../util";
import BudgetTableMenu from "./Menu";
import Grid from "./Grid";

const PrimaryGrid = <R extends Table.Row, M extends Model.Model, G extends Model.Group = Model.Group>({
  /* eslint-disable indent */
  apis,
  gridRef,
  options,
  data,
  manager,
  ordering,
  groups = [],
  columns,
  groupParams,
  frameworkComponents,
  search,
  identifierField,
  actions,
  detached,
  onGridReady,
  onSearch,
  isCellEditable,
  rowCanExpand,
  onRowExpand,
  onTableChange,
  onRowAdd,
  onRowDelete,
  onBack,
  ...props
}: BudgetTable.PrimaryGridProps<R, M, G>): JSX.Element => {
  const [cellChangeEvents, setCellChangeEvents] = useState<CellValueChangedEvent[]>([]);
  const [focused, setFocused] = useState(false);
  // Right now, we can only support Cut/Paste for 1 cell at a time.  Multi-cell
  // cut/paste needs to be built in.
  const [cutCellChange, setCutCellChange] = useState<Table.CellChange<R> | null>(null);
  const oldRow = useRef<R | null>(null); // TODO: Figure out a better way to do this.
  const location = useLocation();
  const [table, setTable] = useState<R[]>([]);

  const onFirstDataRendered = useDynamicCallback((event: FirstDataRenderedEvent): void => {
    props.onFirstDataRendered(event);

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
            focusedOnQuery = true;
          }
        }
        if (focusedOnQuery === false) {
          event.api.setFocusedCell(0, identifierCol);
        }
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

  const tabToNextCell = useDynamicCallback((params: TabToNextCellParams) => {
    if (!params.editing && !isNil(apis)) {
      // If the nextCellPosition is null, it means we are at the bottom of the table
      // all the way in the Column furthest to the right.
      if (isNil(params.nextCellPosition)) {
        // TODO: We need to figure out how to move down to the next cell!  This
        // is tricky, because we have to wait for the row to be present in state.
        onRowAdd(1);
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
            const identifierCol = apis.column.getColumn(identifierField);
            if (!isNil(identifierCol)) {
              return { ...nextCellPosition, column: identifierCol };
            }
          } else {
            const agColumns = apis.column.getAllColumns();
            if (!isNil(agColumns)) {
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
        onRowAdd(1);
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
        const customCol = find(columns, (def: Table.Column<R>) => def.field === focusedCell.column.getColId());
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
  const onDoneEditing = useDynamicCallback((e: SyntheticEvent | KeyboardEvent | CheckboxChangeEvent) => {
    if (isKeyboardEvent(e) && !isNil(apis)) {
      const focusedCell = apis.grid.getFocusedCell();
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

  const getCellChangeForClear = useDynamicCallback((row: R, def: Table.Column<R>): Table.CellChange<R> | null => {
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
  });

  const getTableChangesFromRangeClear = useDynamicCallback(
    (range: CellRange, gridApi?: GridApi): Table.CellChange<R>[] => {
      const changes: Table.CellChange<R>[] = [];
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
  ): Table.CellChange<R> | null => {
    const field = event.column.getColId() as keyof R;
    // AG Grid treats cell values as undefined when they are cleared via edit,
    // so we need to translate that back into a null representation.
    const customCol: Table.Column<R> | undefined = find(columns, { field } as any);
    if (!isNil(customCol)) {
      const nullValue = customCol.nullValue === undefined ? null : customCol.nullValue;
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

  const clearCell = useDynamicCallback((row: R, def: Table.Column<R>) => {
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

  const getRowClass = useDynamicCallback((params: RowClassParams) => {
    const row: R = params.node.data;
    if (row.meta.isGroupFooter === true) {
      return "row--group-footer";
    }
  });

  const getRowStyle = useDynamicCallback((params: RowClassParams) => {
    const row: R = params.node.data;
    if (row.meta.isGroupFooter === true) {
      const group: G | undefined = find(groups, { id: row.group } as any);
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
        const group: G | undefined = find(groups, { id: row.group } as any);
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
        name: `Delete ${row.meta.label}`,
        action: () => onRowDelete(row.id)
      };
      if (isNil(groupParams)) {
        return [deleteRowContextMenuItem];
      } else if (!isNil(row.group)) {
        const group: G | undefined = find(groups, { id: row.group } as any);
        if (!isNil(group)) {
          return [
            deleteRowContextMenuItem,
            {
              name: `Remove ${row.meta.label} from Group ${group.name}`,
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
        const customCol = find(columns, (def: Table.Column<R>) => def.field === column.getColId());
        if (!isNil(customCol)) {
          const columnType: Table.ColumnType | undefined = find(models.ColumnTypes, { id: customCol.type });
          if (!isNil(columnType)) {
            if (columnType.editorIsPopup === true) {
              const row: R = params.node.data;
              clearCell(row, customCol);
              return true;
            } else {
              return false;
            }
          }
          return false;
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

  const recreateRowFromDataArray = (local: ColumnApi, array: any[], startingColumn: Column): R => {
    const row: any = {};
    let currentColumn: Column = startingColumn;
    map(array, (value: any) => {
      const field = currentColumn.getColDef().field;
      if (!isNil(field)) {
        row[field] = processCellFromClipboard(currentColumn, row, value);
      }
      const nextColumn = local.getDisplayedColAfter(currentColumn);
      if (isNil(nextColumn)) {
        return false;
      }
      currentColumn = nextColumn;
    });
    return row as R;
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
          const newRows: R[] = map(rowsToAdd, (r: any[]) =>
            recreateRowFromDataArray(apis.column, r, focusedCell.column)
          );
          onRowAdd(newRows);
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
    const createGroupFooter = (group: G): R => {
      return reduce(
        columns,
        (obj: { [key: string]: any }, col: Table.Column<R>) => {
          if (!isNil(col.field)) {
            if (col.isCalculated === true) {
              if (!isNil(group[col.field as keyof G])) {
                obj[col.field] = group[col.field as keyof G];
              } else {
                obj[col.field] = null;
              }
            } else {
              obj[col.field] = null;
            }
          }
          return obj;
        },
        {
          // The ID needs to designate that this row refers to a Group because the ID of a Group
          // might clash with the ID of a SubAccount/Account.
          id: `group-${group.id}`,
          [identifierField]: group.name,
          group,
          meta: {
            isGroupFooter: true,
            children: []
          }
        }
      ) as R;
    };
    const getGroupForModel = (model: M): number | null => {
      const group: G | undefined = find(groups, (g: G) =>
        includes(
          map(g.children, (child: number) => child),
          model.id
        )
      );
      return !isNil(group) ? group.id : null;
    };

    const modelsWithGroup = filter(data, (m: M) => !isNil(getGroupForModel(m)));
    let modelsWithoutGroup = filter(data, (m: M) => isNil(getGroupForModel(m)));
    const groupedModels: { [key: number]: M[] } = groupBy(modelsWithGroup, (model: M) => getGroupForModel(model));

    const newTable: R[] = [];
    forEach(groupedModels, (ms: M[], groupId: string) => {
      const group: G | undefined = find(groups, { id: parseInt(groupId) } as any);
      if (!isNil(group)) {
        const footer: R = createGroupFooter(group);
        newTable.push(
          ...orderByFieldOrdering(
            map(ms, (m: M) => manager.modelToRow(m)),
            ordering
          ),
          {
            ...footer,
            group: group.id,
            [identifierField]: group.name,
            meta: { ...footer.meta, isGroupFooter: true }
          }
        );
      } else {
        // In the case that the group no longer exists, that means the group was removed from the
        // state.  In this case, we want to disassociate the rows with the group.
        modelsWithoutGroup = [...modelsWithoutGroup, ...ms];
      }
    });
    setTable([
      ...newTable,
      ...orderByFieldOrdering(
        map(modelsWithoutGroup, (m: M) => manager.modelToRow(m)),
        ordering
      )
    ]);
  }, [data, groups, ordering]);

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

  useEffect(() => {
    // When first rendering, it is possible that the groups are not present from
    // the API response yet, in which case, the cellRenderer will think there are
    // no groups and not allow the group to be edited.  We need to force refresh
    // the identifier column when the groups change, so that those cell renderers
    // have access to the groups when they populate.
    if (!isNil(apis)) {
      const nodes: RowNode[] = [];
      apis.grid.forEachNode((node: RowNode) => {
        const row: R = node.data;
        if (row.meta.isGroupFooter === true) {
          nodes.push(node);
        }
      });
      const cols = apis.column.getAllColumns();
      const identifierCol = find(cols, (col: Column) => {
        const def = col.getColDef();
        if (def.field === identifierField) {
          return true;
        }
        return false;
      });
      if (nodes.length !== 0 && !isNil(identifierCol)) {
        apis.grid.refreshCells({ force: true, rowNodes: nodes, columns: [identifierCol] });
      }
    }
  }, [useDeepEqualMemo(groups), apis]);

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

  const _processCellFromClipboard = useDynamicCallback((params: ProcessCellForExportParams) => {
    if (!isNil(params.node)) {
      const node: RowNode = params.node;
      const customCol: Table.Column<R> | undefined = find(columns, { field: params.column.getColId() } as any);
      if (!isNil(customCol)) {
        if (!isNil(cutCellChange)) {
          params = { ...params, value: cutCellChange.oldValue };
          onTableChange(cutCellChange);
          setCutCellChange(null);
        }
        return processCellFromClipboard(customCol, node.data as R, params.value);
      }
    }
  });

  const processCellForClipboard = useDynamicCallback((column: Table.Column<R>, row: R, value?: any) => {
    const processor = column.processCellForClipboard;
    if (!isNil(processor)) {
      return processor(row);
    } else {
      value = value === undefined ? getKeyValue<R, keyof R>(column.field)(row) : value;
      // The value should never be undefined at this point.
      if (value === column.nullValue) {
        return "";
      }
      return value;
    }
  });

  const processCellFromClipboard = useDynamicCallback((column: Table.Column<R>, row: R, value?: any) => {
    const processor = column.processCellFromClipboard;
    if (!isNil(processor)) {
      return processor(value);
    } else {
      value = value === undefined ? getKeyValue<R, keyof R>(column.field)(row) : value;
      // The value should never be undefined at this point.
      if (typeof value === "string" && String(value).trim() === "") {
        return !isNil(column.nullValue) ? column.nullValue : null;
      }
      return value;
    }
  });

  useImperativeHandle(gridRef, () => ({
    getCSVData: (fields?: string[]) => {
      if (!isNil(apis)) {
        const cs: Table.Column<R>[] = filter(
          columns,
          (column: Table.Column<R>) =>
            column.excludeFromExport !== true && (isNil(fields) || includes(fields, column.field))
        );
        const csvData: CSVData = [map(cs, (col: Table.Column<R>) => col.headerName || "")];
        apis.grid.forEachNode((node: RowNode, index: number) => {
          const row: R = node.data;
          csvData.push(
            reduce(
              cs,
              (current: CSVRow, column: Table.Column<R>) => [...current, processCellForClipboard(column, row)],
              []
            )
          );
        });
        return csvData;
      }
      return [];
    }
  }));

  const onCellValueChanged = useDynamicCallback((params: Table.CellValueChangedParams<R>) => {
    if (!isNil(apis) && !isNil(onRowExpand) && !isNil(rowCanExpand)) {
      const col = apis.column.getColumn("expand");
      if (!isNil(col)) {
        if (isNil(params.oldRow) || rowCanExpand(params.oldRow) !== rowCanExpand(params.row)) {
          apis.grid.refreshCells({ force: true, rowNodes: [params.node], columns: [col] });
        }
      }
    }
  });

  const includeCellEditorParams = (def: Table.Column<R>): Table.Column<R> => {
    return { ...def, cellEditorParams: { ...def.cellEditorParams, onDoneEditing } };
  };

  return (
    <React.Fragment>
      {!isNil(apis) && (
        <BudgetTableMenu<R>
          apis={apis}
          actions={actions}
          search={search}
          onSearch={onSearch}
          columns={columns}
          detached={detached}
        />
      )}
      <div className={"table-grid"}>
        <Grid<R>
          {...options}
          columns={map(columns, (col: Table.Column<R>) => includeCellEditorParams(col))}
          getContextMenuItems={getContextMenuItems}
          // This is the same as checking if the onGridReady event has fired.
          rowData={!isNil(apis) ? table : []}
          getRowNodeId={(r: any) => r.id}
          getRowClass={getRowClass}
          getRowStyle={getRowStyle}
          rowSelection={"multiple"}
          immutableData={true}
          onGridReady={onGridReady}
          processDataFromClipboard={processDataFromClipboard}
          processCellForClipboard={(params: ProcessCellForExportParams) => {
            if (!isNil(params.node)) {
              const customCol: Table.Column<R> | undefined = find(columns, { field: params.column.getColId() } as any);
              if (!isNil(customCol)) {
                setCutCellChange(null);
                return processCellForClipboard(customCol, params.node.data as R, params.value);
              }
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
            if (includes(["index", "expand", identifierField], e.colDef.field)) {
              e.api.forEachNode((node: RowNode) => {
                const row: R = node.data;
                if (row.meta.isGroupFooter === false) {
                  nodes.push(node);
                }
              });
              e.api.refreshCells({ force: true, rowNodes: nodes, columns: ["expand"] });
            }
          }}
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
    </React.Fragment>
  );
};

export default PrimaryGrid;
