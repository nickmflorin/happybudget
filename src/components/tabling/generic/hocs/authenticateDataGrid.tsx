import { useMemo, useRef, useState } from "react";
import hoistNonReactStatics from "hoist-non-react-statics";
import { map, isNil, includes, find, filter, flatten, forEach, reduce } from "lodash";

import {
  GridApi,
  CellKeyDownEvent,
  ProcessCellForExportParams,
  ValueSetterParams,
  SuppressKeyboardEventParams,
  CellRange,
  CellEditingStoppedEvent,
  CellValueChangedEvent,
  CellEditingStartedEvent,
  PasteEndEvent,
  PasteStartEvent,
  ProcessDataFromClipboardParams,
  CellDoubleClickedEvent,
  ColumnApi,
  NavigateToNextCellParams,
  TabToNextCellParams,
  CheckboxSelectionCallbackParams
} from "@ag-grid-community/core";
import { FillOperationParams } from "@ag-grid-community/core/dist/cjs/entities/gridOptions";

import { tabling, hooks, util } from "lib";
import { useCellNavigation } from "./hooks";

interface InjectedAuthenticatedDataGridProps {
  readonly onCellDoubleClicked?: (e: CellDoubleClickedEvent) => void;
  readonly processDataFromClipboard?: (params: ProcessDataFromClipboardParams) => any;
  readonly processCellFromClipboard?: (params: ProcessCellForExportParams) => string;
  readonly onCellEditingStarted?: (event: CellEditingStartedEvent) => void;
  readonly onPasteStart?: (event: PasteStartEvent) => void;
  readonly onPasteEnd?: (event: PasteEndEvent) => void;
  readonly onCellValueChanged?: (e: CellValueChangedEvent) => void;
  readonly fillOperation?: (params: FillOperationParams) => boolean;
  readonly onCellKeyDown?: (event: CellKeyDownEvent) => void;
  readonly processCellForClipboard?: (params: ProcessCellForExportParams) => string;
  readonly navigateToNextCell?: (params: NavigateToNextCellParams) => Table.CellPosition;
  readonly tabToNextCell?: (params: TabToNextCellParams) => Table.CellPosition;
}

export interface AuthenticateDataGridProps<
  R extends Table.RowData,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group
> {
  readonly apis: Table.GridApis | null;
  readonly columns: Table.Column<R, M>[];
  readonly groups?: G[];
  readonly defaultRowLabel?: string;
  readonly defaultRowName?: string;
  readonly rowHasCheckboxSelection: ((row: Table.DataRow<R, M>) => boolean) | undefined;
  readonly onRowSelectionChanged: (rows: Table.DataRow<R, M>[]) => void;
  readonly rowCanExpand?: (row: Table.ModelRow<R, M>) => boolean;
  readonly onRowExpand?: null | ((row: Table.ModelRow<R, M>) => void);
  readonly isCellEditable?: (params: Table.CellCallbackParams<R, M>) => boolean;
  readonly onChangeEvent: (event: Table.ChangeEvent<R, M>) => void;
  readonly getGroupRowContextMenuItems?: (row: Table.GroupRow<R>, node: Table.RowNode) => Table.MenuItemDef[];
  readonly getDataRowContextMenuItems?: (row: Table.DataRow<R, M>, node: Table.RowNode) => Table.MenuItemDef[];
  readonly onEditGroup?: (g: G) => void; // Need to add to column cell renderer params!
  readonly onGroupRows?: (rows: Table.DataRow<R, M>[]) => void;
}

export type WithAuthenticatedDataGridProps<T> = T & InjectedAuthenticatedDataGridProps;

/* eslint-disable indent */
const authenticateDataGrid =
  <
    R extends Table.RowData,
    M extends Model.Model = Model.Model,
    G extends Model.Group = Model.Group,
    T extends AuthenticateDataGridProps<R, M, G> = AuthenticateDataGridProps<R, M, G>
  >(
    config?: TableUi.AuthenticatedDataGridConfig<R, M>
  ) =>
  (
    Component:
      | React.ComponentClass<WithAuthenticatedDataGridProps<T>, {}>
      | React.FunctionComponent<WithAuthenticatedDataGridProps<T>>
  ): React.FunctionComponent<T> => {
    function WithAuthenticatedDataGrid(props: T) {
      const [cutCellChange, setCellCutChange] = useState<Table.SoloCellChange<R, M> | null>(null);
      const [cellChangeEvents, setCellChangeEvents] = useState<CellValueChangedEvent[]>([]);
      const oldRow = useRef<Table.ModelRow<R, M> | null>(null); // TODO: Figure out a better way to do this.

      const columns = useMemo<Table.Column<R, M>[]>((): Table.Column<R, M>[] => {
        /*
        When the cell editor finishes editing, the AG Grid callback (onCellDoneEditing)
        does not have any context about what e triggered the completion.  This is
        problematic because we need to focus either the cell to the right (on Tab completion)
        or the cell below (on Enter completion).  To accomplish this, we use a custom hook
        to the Editor(s) that is manually called inside the Editor.
        */
        const onDoneEditing = (e: Table.CellDoneEditingEvent) => {
          if (tabling.typeguards.isKeyboardEvent(e)) {
            const focusedCell = props.apis?.grid.getFocusedCell();
            if (!isNil(focusedCell) && !isNil(focusedCell.rowIndex)) {
              if (e.code === "Enter") {
                moveToNextRow({ rowIndex: focusedCell.rowIndex, column: focusedCell.column });
              } else if (e.code === "Tab") {
                moveToNextColumn({ rowIndex: focusedCell.rowIndex, column: focusedCell.column });
              }
            }
          }
        };
        const cs = tabling.columns.updateColumnsOfField<Table.Column<R, M>, R, M>(
          tabling.columns.updateColumnsOfTableType<Table.Column<R, M>, R, M>(
            props.columns,
            "body",
            (col: Table.Column<R, M>) => ({
              cellRendererParams: { ...col.cellRendererParams },
              cellEditorParams: { ...col.cellEditorParams, onDoneEditing },
              editable: !isNil(props.isCellEditable) ? props.isCellEditable : isNil(col.editable) ? true : col.editable,
              valueSetter: (params: ValueSetterParams) => {
                // By default, AG Grid treats Backspace clearing the cell as setting the
                // value to undefined - but we have to set it to the null value associated
                // with the column.
                if (params.newValue === undefined) {
                  const column: Table.Column<R, M> | undefined = find(props.columns, {
                    field: params.column.getColId()
                  } as any);
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
              },
              suppressKeyboardEvent: (params: SuppressKeyboardEventParams) => {
                if (!isNil(col.suppressKeyboardEvent) && col.suppressKeyboardEvent(params) === true) {
                  return true;
                } else if (params.editing && includes(["Tab"], params.event.code)) {
                  /*
                Our custom cell editors have built in functionality that when editing is terminated via
                a TAB key, we move one cell to the right without continuing in edit mode.  This however
                does not work for the bland text cells, where we do not have cell editors controlling the
                edit behavior.  So we need to suppress the TAB behavior when editing, and manually move
                the cell over.
                */
                  return true;
                } else if (!params.editing && includes(["Backspace", "Delete"], params.event.code)) {
                  const clearCellsOverRange = (range: CellRange | CellRange[], api: GridApi) => {
                    const changes: Table.SoloCellChange<R, M>[] = !Array.isArray(range)
                      ? getTableChangesFromRangeClear(range, api)
                      : flatten(map(range, (rng: CellRange) => getTableChangesFromRangeClear(rng, api)));
                    props.onChangeEvent({
                      type: "dataChange",
                      payload: tabling.events.cellChangesToRowChanges(changes)
                    });
                  };
                  // Suppress Backspace/Delete events when multiple cells are selected in a range.
                  const ranges = params.api.getCellRanges();
                  if (
                    !isNil(ranges) &&
                    (ranges.length !== 1 || !tabling.aggrid.rangeSelectionIsSingleCell(ranges[0]))
                  ) {
                    clearCellsOverRange(ranges, params.api);
                    return true;
                  } else {
                    /*
                    For custom Cell Editor(s) with a Pop-Up, we do not want Backspace/Delete to go into
                    edit mode but instead want to clear the values of the cells - so we prevent those key
                    presses from triggering edit mode in the Cell Editor and clear the value at this level.
                    */
                    const column = params.column;
                    const row: Table.Row<R, M> = params.node.data;
                    const customCol = find(props.columns, (def: Table.Column<R, M>) => def.field === column.getColId());
                    if (!isNil(customCol) && tabling.typeguards.isDataRow(row)) {
                      const columnType: Table.ColumnType | undefined = find(tabling.models.ColumnTypes, {
                        id: customCol.columnType
                      });
                      if (!isNil(columnType) && columnType.editorIsPopup === true) {
                        clearCell(row, customCol);
                        return true;
                      }
                    }
                    return false;
                  }
                } else if (
                  (params.event.key === "ArrowDown" || params.event.key === "ArrowUp") &&
                  (params.event.ctrlKey || params.event.metaKey)
                ) {
                  return true;
                }
                return false;
              }
            })
          ),
          "index" as keyof R,
          {
            checkboxSelection: (params: CheckboxSelectionCallbackParams) => {
              const row: Table.Row<R, M> = params.data;
              return (
                tabling.typeguards.isDataRow(row) &&
                (isNil(props.rowHasCheckboxSelection) || props.rowHasCheckboxSelection(row))
              );
            }
          }
        );
        return cs;
      }, [hooks.useDeepEqualMemo(props.columns)]);

      const [navigateToNextCell, tabToNextCell, moveToNextColumn, moveToNextRow, findRowsUpUntilFirstGroupFooterRow] =
        useCellNavigation({
          apis: props.apis,
          columns,
          includeRowInNavigation: config?.includeRowInNavigation,
          onNewRowRequired: () =>
            props.onChangeEvent({
              type: "rowAdd",
              payload: { id: `placeholder-${util.generateRandomNumericId()}`, data: {} }
            })
        });

      const getColumn = useMemo(
        () =>
          (field: keyof R | string): Table.Column<R, M> | null => {
            const foundColumn = find(columns, { field } as any);
            if (!isNil(foundColumn)) {
              return foundColumn;
            } else {
              /* eslint-disable no-console */
              console.error(`Could not find column for field ${field}!`);
              return null;
            }
          },
        []
      );

      const callWithColumn = <RT extends any = any>(
        field: keyof R | string,
        callback: (col: Table.Column<R, M>) => RT | null
      ) => {
        const foundColumn = getColumn(field);
        return !isNil(foundColumn) ? callback(foundColumn) : null;
      };

      const onCellSpaceKey = (event: CellKeyDownEvent) => {
        if (!isNil(event.rowIndex)) {
          event.api.startEditingCell({
            rowIndex: event.rowIndex,
            colKey: event.column.getColId(),
            charPress: " "
          });
        }
      };

      const onCellCut: (e: CellKeyDownEvent, local: GridApi) => void = hooks.useDynamicCallback(
        (e: CellKeyDownEvent, local: GridApi) => {
          const focusedCell = local.getFocusedCell();
          if (!isNil(focusedCell)) {
            const node = local.getDisplayedRowAtIndex(focusedCell.rowIndex);
            if (!isNil(node)) {
              const row: Table.Row<R, M> = node.data;
              if (tabling.typeguards.isDataRow(row)) {
                callWithColumn(focusedCell.column.getColId(), (c: Table.Column<R, M>) => {
                  const change = getCellChangeForClear(row, c);
                  local.flashCells({ columns: [focusedCell.column], rowNodes: [node] });
                  if (!isNil(change)) {
                    setCellCutChange(change);
                  }
                });
              }
            }
          }
        }
      );

      const onCellKeyDown: (event: CellKeyDownEvent) => void = hooks.useDynamicCallback((event: CellKeyDownEvent) => {
        if (!isNil(event.event)) {
          /* @ts-ignore  AG Grid's Event Object is Wrong */
          // AG Grid only enters Edit mode in a cell when a character is pressed, not the Space
          // key - so we have to do that manually here.
          if (event.event.code === "Space") {
            onCellSpaceKey(event);
            /* @ts-ignore  AG Grid's Event Object is Wrong */
          } else if (event.event.key === "x" && (event.event.ctrlKey || event.event.metaKey)) {
            onCellCut(event, event.api);
            /* @ts-ignore  AG Grid's Event Object is Wrong */
          } else if (event.event.code === "Enter" && !isNil(event.rowIndex)) {
            // If Enter is clicked inside the cell popout, this doesn't get triggered.
            const editing = event.api.getEditingCells();
            if (editing.length === 0) {
              moveToNextRow({ rowIndex: event.rowIndex, column: event.column });
            }
            /* @ts-ignore  AG Grid's Event Object is Wrong */
          } else if (event.event.code === "Tab" && !isNil(event.rowIndex)) {
            moveToNextColumn({ rowIndex: event.rowIndex, column: event.column });
          }
        }
      });

      const getCellChangeForClear: (
        row: Table.DataRow<R, M>,
        col: Table.Column<R, M>
      ) => Table.SoloCellChange<R, M> | null = hooks.useDynamicCallback(
        (row: Table.DataRow<R, M>, col: Table.Column<R, M>): Table.SoloCellChange<R, M> | null => {
          const clearValue = col.nullValue !== undefined ? col.nullValue : null;
          const colId = col.field;
          if (
            tabling.typeguards.isModelRow(row) &&
            (row[col.field] === undefined || row[col.field] !== (clearValue as unknown as R[keyof R]))
          ) {
            const change: Table.SoloCellChange<R, M> = {
              oldValue: row[col.field] as Table.RowValue<R>,
              newValue: clearValue as unknown as Table.RowValue<R>,
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

      const getTableChangesFromRangeClear: (range: CellRange, gridApi?: GridApi) => Table.SoloCellChange<R, M>[] =
        hooks.useDynamicCallback((range: CellRange, gridApi?: GridApi): Table.SoloCellChange<R, M>[] => {
          const changes: Table.SoloCellChange<R, M>[] = [];
          if (!isNil(props.apis) && !isNil(range.startRow) && !isNil(range.endRow)) {
            gridApi = isNil(gridApi) ? gridApi : props.apis.grid;
            let colIds: (keyof R)[] = map(range.columns, (col: Table.AgColumn) => col.getColId() as keyof R);
            let startRowIndex = Math.min(range.startRow.rowIndex, range.endRow.rowIndex);
            let endRowIndex = Math.max(range.startRow.rowIndex, range.endRow.rowIndex);
            for (let i = startRowIndex; i <= endRowIndex; i++) {
              const node: Table.RowNode | undefined = props.apis.grid.getDisplayedRowAtIndex(i);
              if (!isNil(node)) {
                const row: Table.Row<R, M> = node.data;
                if (tabling.typeguards.isDataRow(row)) {
                  /* eslint-disable no-loop-func */
                  forEach(colIds, (colId: keyof R) => {
                    callWithColumn(colId, (c: Table.Column<R, M>) => {
                      if (c.editable === true) {
                        const change = getCellChangeForClear(row, c);
                        if (!isNil(change)) {
                          changes.push(change);
                        }
                      }
                    });
                  });
                }
              }
            }
          }
          return changes;
        });

      const getCellChangeFromEvent: (
        event: CellEditingStoppedEvent | CellValueChangedEvent
      ) => Table.SoloCellChange<R, M> | null = (
        event: CellEditingStoppedEvent | CellValueChangedEvent
      ): Table.SoloCellChange<R, M> | null => {
        const row: Table.Row<R, M> = event.node.data;
        if (tabling.typeguards.isModelRow(row)) {
          const field = event.column.getColId() as keyof R;
          // AG Grid treats cell values as undefined when they are cleared via edit,
          // so we need to translate that back into a null representation.
          const customCol: Table.Column<R, M> | undefined = find(columns, { field } as any);
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
              const change: Table.SoloCellChange<R, M> = {
                oldValue,
                newValue,
                field,
                column: customCol,
                id: event.data.id,
                row
              };
              return change;
            }
          }
        }
        return null;
      };

      const clearCell: (row: Table.DataRow<R, M>, def: Table.Column<R, M>) => void = hooks.useDynamicCallback(
        (row: Table.DataRow<R, M>, def: Table.Column<R, M>) => {
          const change = getCellChangeForClear(row, def);
          if (!isNil(change)) {
            props.onChangeEvent({
              type: "dataChange",
              payload: tabling.events.cellChangeToRowChange(change)
            });
          }
        }
      );

      const onPasteStart: (event: PasteStartEvent) => void = hooks.useDynamicCallback((event: PasteStartEvent) => {
        setCellChangeEvents([]);
      });

      const onPasteEnd: (event: PasteEndEvent) => void = hooks.useDynamicCallback((event: PasteEndEvent) => {
        const changes = filter(
          map(cellChangeEvents, (e: CellValueChangedEvent) => getCellChangeFromEvent(e)),
          (change: Table.SoloCellChange<R, M> | null) => change !== null
        ) as Table.SoloCellChange<R, M>[];
        if (changes.length !== 0) {
          props.onChangeEvent({
            type: "dataChange",
            payload: tabling.events.cellChangesToRowChanges(changes)
          });
        }
      });

      const getContextMenuItems: (row: Table.Row<R, M>, node: Table.RowNode) => Table.MenuItemDef[] =
        hooks.useDynamicCallback((row: Table.Row<R, M>, node: Table.RowNode): Table.MenuItemDef[] => {
          let contextMenuItems: Table.MenuItemDef[] = [];
          const fullRowLabel =
            tabling.rows.getFullRowLabel(row, {
              name: props.defaultRowName,
              label: props.defaultRowLabel
            }) || "Row";
          if (tabling.typeguards.isDataRow(row)) {
            contextMenuItems = !isNil(props.getDataRowContextMenuItems)
              ? props.getDataRowContextMenuItems(row, node)
              : [];
            if (config?.rowCanDelete?.(row) === true) {
              contextMenuItems = [
                ...contextMenuItems,
                {
                  name: `Delete ${
                    tabling.rows.getFullRowLabel(row, { name: props.defaultRowName, label: props.defaultRowLabel }) ||
                    "Row"
                  }`,
                  action: () => props.onChangeEvent({ payload: { rows: row, columns: columns }, type: "rowDelete" })
                }
              ];
            }
            if (!isNil(props.groups)) {
              if (!isNil(row.meta.group)) {
                const group: G | undefined = find(props.groups, { id: row.meta.group } as any);
                return !isNil(group)
                  ? [
                      ...contextMenuItems,
                      {
                        name: `Remove ${fullRowLabel} from Group ${group.name}`,
                        action: () =>
                          props.onChangeEvent({
                            type: "rowRemoveFromGroup",
                            payload: { columns: props.columns, rows: row, group: group.id }
                          })
                      }
                    ]
                  : [];
              } else {
                const groupableNodesAbove = findRowsUpUntilFirstGroupFooterRow(node);
                const onGroupRows = props.onGroupRows;
                if (groupableNodesAbove.length !== 0 && !isNil(onGroupRows)) {
                  let label: string;
                  if (groupableNodesAbove.length === 1) {
                    label = `Group ${fullRowLabel}`;
                  } else {
                    label = `Group ${row.meta.name || props.defaultRowName || "Row"}s`;
                    if (
                      !isNil(groupableNodesAbove[groupableNodesAbove.length - 1].data.meta.label) &&
                      !isNil(groupableNodesAbove[0].data.meta.label)
                    ) {
                      label = `Group ${row.meta.name || props.defaultRowName || "Row"}s ${
                        groupableNodesAbove[groupableNodesAbove.length - 1].data.meta.label
                      } - ${groupableNodesAbove[0].data.meta.label}`;
                    }
                  }
                  contextMenuItems.push({
                    name: label,
                    action: () =>
                      onGroupRows(map(groupableNodesAbove, (n: Table.RowNode) => n.data as Table.DataRow<R, M>))
                  });
                }
                if (props.groups.length !== 0) {
                  contextMenuItems.push({
                    name: "Add to Group",
                    subMenu: map(props.groups, (group: G) => ({
                      name: group.name,
                      action: () =>
                        props.onChangeEvent({
                          type: "rowAddToGroup",
                          payload: { columns: props.columns, rows: row, group: group.id }
                        })
                    }))
                  });
                }
              }
            }
          } else if (!isNil(props.groups)) {
            contextMenuItems = !isNil(props.getGroupRowContextMenuItems)
              ? props.getGroupRowContextMenuItems(row, node)
              : [];
            const group: G | undefined = find(props.groups, { id: row.meta.group } as any);
            /* eslint-disable indent */
            return !isNil(group)
              ? [
                  ...contextMenuItems,
                  {
                    name: `Ungroup ${group.name}`,
                    action: () =>
                      props.onChangeEvent({
                        type: "groupDelete",
                        payload: group.id
                      })
                  }
                ]
              : contextMenuItems;
          }
          return contextMenuItems;
        });

      const processDataFromClipboard: (params: ProcessDataFromClipboardParams) => CSVData = hooks.useDynamicCallback(
        (params: ProcessDataFromClipboardParams) => {
          // TODO: We need to test this in the case that we are copy and pasting starting at the action
          // columns on the left and potentially the non editable columns on the right.
          const getWritableColumnsAfter = (local: ColumnApi, col: Table.AgColumn): Table.Column<R, M>[] => {
            const cols: Table.Column<R, M>[] = [];
            let current: Table.AgColumn | null = col;
            while (!isNil(current)) {
              const c: Table.Column<R, M> | null = getColumn(col.getColId());
              if (!isNil(c) && c.isWrite !== false) {
                cols.push(c);
              }
              current = local.getDisplayedColAfter(current);
            }
            return cols;
          };

          const generateRowAddFromArray = (array: any[], cols: Table.Column<R, M>[]): Table.RowAdd<R, M> | null => {
            if (cols.length < array.length) {
              /* eslint-disable no-console */
              console.warn(
                `There are ${cols.length} writable displayed columns, but the data array
                has length ${array.length} - this most likely means there is an issue with the
                column configuration.`
              );
              return null;
            } else {
              return {
                id: `placeholder-${util.generateRandomNumericId()}`,
                data: reduce(
                  cols,
                  (curr: Table.RowAddData<R, M>, c: Table.Column<R, M>, index: number) => ({
                    ...curr,
                    [c.field]: { column: c, value: array[index] }
                  }),
                  {}
                )
              };
            }
          };

          const columnApi = props.apis?.column;
          if (!isNil(columnApi)) {
            const lastIndex = props.apis?.grid.getDisplayedRowCount();
            const focusedCell = props.apis?.grid.getFocusedCell();
            if (!isNil(focusedCell) && !isNil(lastIndex)) {
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

                const cols = getWritableColumnsAfter(columnApi, focusedCell.column);
                props.onChangeEvent({
                  type: "rowAdd",
                  payload: filter(
                    map(rowsToAdd, (row: any[]) => generateRowAddFromArray(row, cols)),
                    (ra: Table.RowAdd<R, M> | null) => !isNil(ra)
                  ) as Table.RowAdd<R, M>[]
                });
              }
            }
          }
          return params.data;
        }
      );

      const processCellValueFromClipboard: (column: Table.Column<R, M>, value: any) => string =
        hooks.useDynamicCallback((column: Table.Column<R, M>, value: any) => {
          const processor = column.processCellFromClipboard;
          if (!isNil(processor)) {
            return processor(value) || "";
          } else {
            // The value should never be undefined at this point.
            if (typeof value === "string" && String(value).trim() === "") {
              return !isNil(column.nullValue) ? column.nullValue : null;
            }
            return value;
          }
        });

      const processCellFromClipboard: (column: Table.Column<R, M>, row: Table.Row<R, M>, value?: any) => string =
        hooks.useDynamicCallback((column: Table.Column<R, M>, row: Table.Row<R, M>, value?: any) => {
          value = value === undefined ? util.getKeyValue<R, keyof R>(column.field as keyof R)(row) : value;
          return processCellValueFromClipboard(column, value);
        });

      const _processCellForClipboard: (column: Table.Column<R, M>, row: Table.Row<R, M>, value?: any) => string =
        hooks.useDynamicCallback((column: Table.Column<R, M>, row: Table.Row<R, M>, value?: any) => {
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

      const processCellForClipboard: (params: ProcessCellForExportParams) => string = hooks.useDynamicCallback(
        (params: ProcessCellForExportParams) => {
          if (!isNil(params.node)) {
            const customCol: Table.Column<R, M> | undefined = find(columns, {
              field: params.column.getColId()
            } as any);
            if (!isNil(customCol)) {
              setCellCutChange(null);
              return _processCellForClipboard(customCol, params.node.data as Table.Row<R, M>, params.value);
            }
          }
          return "";
        }
      );

      const _processCellFromClipboard: (params: ProcessCellForExportParams) => string = hooks.useDynamicCallback(
        (params: ProcessCellForExportParams) => {
          if (!isNil(params.node)) {
            const node: Table.RowNode = params.node;
            const field = params.column.getColId();
            const c = find(columns, { field } as any);
            if (!isNil(c)) {
              if (!isNil(cutCellChange)) {
                params = { ...params, value: cutCellChange.oldValue };
                props.onChangeEvent({
                  type: "dataChange",
                  payload: tabling.events.cellChangeToRowChange(cutCellChange)
                });
                setCellCutChange(null);
              }
              return processCellFromClipboard(c, node.data as Table.Row<R, M>, params.value) || "";
            } else {
              /* eslint-disable no-console */
              console.error(`Could not find column for field ${field}!`);
              return "";
            }
          }
          return "";
        }
      );

      const onCellValueChanged: (e: CellValueChangedEvent) => void = hooks.useDynamicCallback(
        (e: CellValueChangedEvent) => {
          const row: Table.Row<R, M> = e.node.data;
          // Note: If this is a placeholder row, the data will not persist.  This is because the row
          // is not yet persisted in the backend database.  While this is an EDGE case, because the
          // placeholder rows only exist for a very short period of time, these scenarios need to be
          // more concretely established.
          if (tabling.typeguards.isDataRow(row)) {
            if (e.source === "paste") {
              setCellChangeEvents([...cellChangeEvents, e]);
            } else {
              const change = getCellChangeFromEvent(e);
              if (!isNil(change)) {
                props.onChangeEvent({ type: "dataChange", payload: tabling.events.cellChangeToRowChange(change) });
                if (tabling.typeguards.isModelRow(row) && !isNil(props.onRowExpand) && !isNil(props.rowCanExpand)) {
                  const col = props.apis?.column.getColumn("expand");
                  if (
                    !isNil(col) &&
                    (isNil(oldRow.current) || props.rowCanExpand(oldRow.current) !== props.rowCanExpand(row))
                  ) {
                    props.apis?.grid.refreshCells({ force: true, rowNodes: [e.node], columns: [col] });
                  }
                }
              }
            }
          }
        }
      );

      const onCellEditingStarted = hooks.useDynamicCallback((event: CellEditingStartedEvent) => {
        const row: Table.Row<R, M> = event.node.data;
        if (tabling.typeguards.isModelRow(row)) {
          oldRow.current = row;
        }
      });

      const onCellDoubleClicked = hooks.useDynamicCallback((e: CellDoubleClickedEvent) => {
        const row: Table.Row<R, M> = e.data;
        if (tabling.typeguards.isDataRow(row)) {
          callWithColumn(e.column.getColId(), (c: Table.Column<R, M>) => {
            c.onCellDoubleClicked?.(row);
          });
        }
      });

      return (
        <Component
          {...props}
          columns={columns}
          onCellKeyDown={onCellKeyDown}
          onCellCut={onCellCut}
          onCellSpaceKey={onCellSpaceKey}
          moveToNextRow={moveToNextRow}
          onCellDoubleClicked={onCellDoubleClicked}
          processDataFromClipboard={processDataFromClipboard}
          processCellFromClipboard={_processCellFromClipboard}
          processCellForClipboard={processCellForClipboard}
          onCellEditingStarted={onCellEditingStarted}
          onPasteStart={onPasteStart}
          onPasteEnd={onPasteEnd}
          onCellValueChanged={onCellValueChanged}
          navigateToNextCell={navigateToNextCell}
          tabToNextCell={tabToNextCell}
          fillOperation={(params: FillOperationParams) => {
            if (params.initialValues.length === 1) {
              return false;
            }
            return params.initialValues[
              (params.values.length - params.initialValues.length) % params.initialValues.length
            ];
          }}
          getContextMenuItems={getContextMenuItems}
        />
      );
    }
    return hoistNonReactStatics(WithAuthenticatedDataGrid, Component);
  };

export default authenticateDataGrid;
