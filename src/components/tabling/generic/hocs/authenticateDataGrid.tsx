import { useMemo, useRef, useState, useImperativeHandle } from "react";
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
  NavigateToNextCellParams,
  TabToNextCellParams,
  CheckboxSelectionCallbackParams
} from "@ag-grid-community/core";
import { FillOperationParams } from "@ag-grid-community/core/dist/cjs/entities/gridOptions";

import { tabling, hooks } from "lib";
import useCellNavigation from "./useCellNavigation";
import useContextMenu, { UseContextMenuParams } from "./useContextMenu";
import useAuthenticatedClipboard from "./useAuthenticatedClipboard";
import useColumnHelpers from "./useColumnHelpers";

interface InjectedAuthenticatedDataGridProps<R extends Table.RowData> {
  readonly getCSVData: (fields?: (keyof R | string)[]) => CSVData;
  readonly processCellForClipboard: (params: ProcessCellForExportParams) => string;
  readonly onCellDoubleClicked?: (e: CellDoubleClickedEvent) => void;
  readonly processDataFromClipboard: (params: ProcessDataFromClipboardParams) => any;
  readonly processCellFromClipboard: (params: ProcessCellForExportParams) => string;
  readonly onCellEditingStarted: (event: CellEditingStartedEvent) => void;
  readonly onPasteStart: (event: PasteStartEvent) => void;
  readonly onPasteEnd: (event: PasteEndEvent) => void;
  readonly onCellValueChanged: (e: CellValueChangedEvent) => void;
  readonly fillOperation: (params: FillOperationParams) => boolean;
  readonly onCellKeyDown: (event: CellKeyDownEvent) => void;
  readonly navigateToNextCell: (params: NavigateToNextCellParams) => Table.CellPosition;
  readonly tabToNextCell: (params: TabToNextCellParams) => Table.CellPosition;
}

export interface AuthenticateDataGridProps<R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel>
  extends UseContextMenuParams<R> {
  readonly apis: Table.GridApis | null;
  readonly tableId: Table.Id;
  readonly grid: NonNullRef<Table.DataGridInstance<R>>;
  readonly columns: Table.Column<R, M>[];
  readonly data: Table.BodyRow<R>[];
  readonly rowCanExpand?: boolean | ((row: Table.ModelRow<R>) => boolean);
  readonly generateNewRowData?: (rows: Table.BodyRow<R>[]) => Partial<R>;
  readonly rowHasCheckboxSelection: ((row: Table.EditableRow<R>) => boolean) | undefined;
  readonly onRowSelectionChanged: (rows: Table.EditableRow<R>[]) => void;
  readonly onRowExpand?: (row: Table.ModelRow<R>) => void;
  readonly isCellEditable?: (params: Table.CellCallbackParams<R, M>) => boolean;
  readonly onChangeEvent: (event: Table.ChangeEvent<R>) => void;
  readonly onEditGroup?: (g: Table.GroupRow<R>) => void;
  readonly onEditMarkup?: (g: Table.MarkupRow<R>) => void;
}

export type WithAuthenticatedDataGridProps<R extends Table.RowData, T> = T & InjectedAuthenticatedDataGridProps<R>;

/* eslint-disable indent */
const authenticateDataGrid =
  <
    R extends Table.RowData,
    M extends Model.HttpModel = Model.HttpModel,
    T extends AuthenticateDataGridProps<R, M> = AuthenticateDataGridProps<R, M>
  >(
    config?: Table.AuthenticatedDataGridConfig<R>
  ) =>
  (
    Component:
      | React.ComponentClass<WithAuthenticatedDataGridProps<R, T>, {}>
      | React.FunctionComponent<WithAuthenticatedDataGridProps<R, T>>
  ): React.FunctionComponent<T> => {
    function WithAuthenticatedDataGrid(props: T) {
      const [
        processCellForClipboard,
        getCSVData,
        processCellFromClipboard,
        processDataFromClipboard,
        setCellCutChange
      ] = useAuthenticatedClipboard<R, M>({
        columns: props.columns,
        apis: props.apis,
        onChangeEvent: props.onChangeEvent
      });
      const [getColumn, callWithColumn] = useColumnHelpers(props.columns);
      const [cellChangeEvents, setCellChangeEvents] = useState<CellValueChangedEvent[]>([]);
      const oldRow = useRef<Table.ModelRow<R> | null>(null); // TODO: Figure out a better way to do this.

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
              cellRendererParams: { ...col.cellRendererParams, generateNewRowData: props.generateNewRowData },
              cellEditorParams: { ...col.cellEditorParams, onDoneEditing },
              editable: (params: Table.CellCallbackParams<R, M>) => {
                if (!tabling.typeguards.isEditableRow(params.row)) {
                  return false;
                } else if (!isNil(props.isCellEditable)) {
                  return props.isCellEditable(params);
                } else {
                  const colEditable = col.editable;
                  if (!isNil(colEditable)) {
                    return typeof colEditable === "function" ? colEditable(params) : colEditable;
                  }
                  return true;
                }
              },
              valueSetter: (params: ValueSetterParams) => {
                // By default, AG Grid treats Backspace clearing the cell as setting the
                // value to undefined - but we have to set it to the null value associated
                // with the column.
                if (params.newValue === undefined || params.newValue === "") {
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
                // We can apply this mutation to the immutable data from the store because we deep
                // clone each row before feeding it into the AG Grid tables.
                params.data.data[params.column.getColId()] = params.newValue;
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
                    const changes: Table.SoloCellChange<R>[] = !Array.isArray(range)
                      ? getTableChangesFromRangeClear(range, api)
                      : flatten(map(range, (rng: CellRange) => getTableChangesFromRangeClear(rng, api)));
                    props.onChangeEvent({
                      type: "dataChange",
                      payload: tabling.events.consolidateCellChanges(changes)
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
                    const row: Table.BodyRow<R> = params.node.data;
                    const c: Table.Column<R, M> | null = getColumn(column.getColId());
                    if (!isNil(c) && tabling.typeguards.isEditableRow(row) && c.editorIsPopup === true) {
                      clearCell(row, c);
                      return true;
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
              const row: Table.BodyRow<R> = params.data;
              if (tabling.typeguards.isEditableRow(row)) {
                return isNil(props.rowHasCheckboxSelection) || props.rowHasCheckboxSelection(row);
              }
              return false;
            }
          }
        );
        return cs;
      }, [hooks.useDeepEqualMemo(props.columns)]);

      const [navigateToNextCell, tabToNextCell, moveToNextColumn, moveToNextRow] = useCellNavigation({
        apis: props.apis,
        tableId: props.tableId,
        columns,
        includeRowInNavigation: config?.includeRowInNavigation,
        onNewRowRequired: () =>
          props.onChangeEvent({
            type: "rowAdd",
            payload: { id: tabling.rows.placeholderRowId(), data: props.generateNewRowData?.(props.data) }
          })
      });

      const [getContextMenuItems] = useContextMenu(props);

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
              const row: Table.BodyRow<R> = node.data;
              if (tabling.typeguards.isEditableRow(row)) {
                callWithColumn(focusedCell.column.getColId(), (c: Table.Column<R, M>) => {
                  if (tabling.typeguards.isEditableRow(row)) {
                    const change = getCellChangeForClear(row, c);
                    local.flashCells({ columns: [focusedCell.column], rowNodes: [node] });
                    if (!isNil(change)) {
                      setCellCutChange(change);
                    }
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
        row: Table.EditableRow<R>,
        col: Table.Column<R, M>
      ) => Table.SoloCellChange<R> | null = hooks.useDynamicCallback(
        (row: Table.EditableRow<R>, col: Table.Column<R, M>): Table.SoloCellChange<R> | null => {
          const clearValue = col.nullValue !== undefined ? col.nullValue : null;
          const colId = col.field;
          if (
            tabling.typeguards.isModelRow(row) &&
            !isNil(colId) &&
            (row.data[colId] === undefined || row.data[colId] !== clearValue)
          ) {
            const change: Table.SoloCellChange<R> = {
              oldValue: row.data[colId],
              newValue: clearValue,
              id: row.id,
              field: colId
            };
            return change;
          } else {
            return null;
          }
        }
      );

      const getTableChangesFromRangeClear: (range: CellRange, gridApi?: GridApi) => Table.SoloCellChange<R>[] =
        hooks.useDynamicCallback((range: CellRange, gridApi?: GridApi): Table.SoloCellChange<R>[] => {
          const changes: Table.SoloCellChange<R>[] = [];
          if (!isNil(props.apis) && !isNil(range.startRow) && !isNil(range.endRow)) {
            gridApi = isNil(gridApi) ? gridApi : props.apis.grid;
            let colIds: (keyof R)[] = map(range.columns, (col: Table.AgColumn) => col.getColId() as keyof R);
            let startRowIndex = Math.min(range.startRow.rowIndex, range.endRow.rowIndex);
            let endRowIndex = Math.max(range.startRow.rowIndex, range.endRow.rowIndex);
            for (let i = startRowIndex; i <= endRowIndex; i++) {
              const node: Table.RowNode | undefined = props.apis.grid.getDisplayedRowAtIndex(i);
              if (!isNil(node)) {
                const row: Table.BodyRow<R> = node.data;
                if (tabling.typeguards.isEditableRow(row)) {
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

      const getCellChangesFromEvent: (
        event: CellEditingStoppedEvent | CellValueChangedEvent
      ) => Table.SoloCellChange<R>[] = (
        event: CellEditingStoppedEvent | CellValueChangedEvent
      ): Table.SoloCellChange<R>[] => {
        const hasChanged = (ch: Table.SoloCellChange<R>): boolean => {
          return ch.newValue !== ch.oldValue;
        };

        const row: Table.BodyRow<R> = event.node.data;
        if (tabling.typeguards.isEditableRow(row)) {
          // The field might not necessarily be a key of the RowData, if the colId was specified
          // for the Column and the field was not.
          const field = event.column.getColId() as keyof R | string;

          const customCol: Table.Column<R, M> | null = getColumn(field);
          if (!isNil(customCol)) {
            /*
            AG Grid treats cell values as undefined when they are cleared via edit,
            so we need to translate that back into a null representation.

            Note: Converting undefined values back to the column's corresponding null
            values may now be handled by the valueSetter on the Table.Column object.
            We may be able to remove - but leave now for safety.
            */
            const nullValue = customCol.nullValue === undefined ? null : customCol.nullValue;
            const oldValue = event.oldValue === undefined ? nullValue : event.oldValue;
            let newValue = event.newValue === undefined ? nullValue : event.newValue;

            let changes: Table.SoloCellChange<R>[];
            if (!isNil(customCol.getCellChanges)) {
              changes = customCol.getCellChanges(row.id, oldValue, newValue);
            } else {
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
              changes = [
                {
                  oldValue,
                  newValue,
                  field: field as keyof R,
                  id: event.data.id
                }
              ];
            }
            return filter(changes, (ch: Table.SoloCellChange<R>) => hasChanged(ch));
          }
        }
        return [];
      };

      const clearCell: (row: Table.EditableRow<R>, def: Table.Column<R, M>) => void = hooks.useDynamicCallback(
        (row: Table.EditableRow<R>, def: Table.Column<R, M>) => {
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
        const changes: Table.SoloCellChange<R>[] = reduce(
          cellChangeEvents,
          (curr: Table.SoloCellChange<R>[], e: CellValueChangedEvent) => [...curr, ...getCellChangesFromEvent(e)],
          []
        );
        if (changes.length !== 0) {
          props.onChangeEvent({
            type: "dataChange",
            payload: tabling.events.consolidateCellChanges(changes)
          });
        }
      });

      const onCellValueChanged: (e: CellValueChangedEvent) => void = hooks.useDynamicCallback(
        (e: CellValueChangedEvent) => {
          const row: Table.BodyRow<R> = e.node.data;
          // Note: If this is a placeholder row, the data will not persist.  This is because the row
          // is not yet persisted in the backend database.  While this is an EDGE case, because the
          // placeholder rows only exist for a very short period of time, these scenarios need to be
          // more concretely established.
          if (tabling.typeguards.isEditableRow(row)) {
            if (e.source === "paste") {
              setCellChangeEvents([...cellChangeEvents, e]);
            } else {
              const changes = getCellChangesFromEvent(e);
              if (changes.length !== 0) {
                props.onChangeEvent({ type: "dataChange", payload: tabling.events.consolidateCellChanges(changes) });
                if (tabling.typeguards.isModelRow(row) && !isNil(props.onRowExpand) && !isNil(props.rowCanExpand)) {
                  const col = props.apis?.column.getColumn("expand");
                  if (
                    !isNil(col) &&
                    (isNil(oldRow.current) ||
                      (typeof props.rowCanExpand === "function" &&
                        props.rowCanExpand(oldRow.current) !== props.rowCanExpand(row)))
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
        const row: Table.BodyRow<R> = event.node.data;
        if (tabling.typeguards.isModelRow(row)) {
          oldRow.current = row;
        }
      });

      const onCellDoubleClicked = hooks.useDynamicCallback((e: CellDoubleClickedEvent) => {
        const row: Table.BodyRow<R> = e.data;
        if (tabling.typeguards.isModelRow(row)) {
          callWithColumn(e.column.getColId(), (c: Table.Column<R, M>) => {
            c.onCellDoubleClicked?.(row);
          });
        }
      });

      useImperativeHandle(props.grid, () => ({
        getCSVData
      }));

      return (
        <Component
          {...props}
          columns={columns}
          getCSVData={getCSVData}
          onCellKeyDown={onCellKeyDown}
          onCellCut={onCellCut}
          onCellSpaceKey={onCellSpaceKey}
          moveToNextRow={moveToNextRow}
          onCellDoubleClicked={onCellDoubleClicked}
          processDataFromClipboard={processDataFromClipboard}
          processCellFromClipboard={processCellFromClipboard}
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
