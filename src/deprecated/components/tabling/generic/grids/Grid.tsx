import React, { useMemo, useEffect } from "react";

import {
  EditableCallbackParams,
  CellClassParams,
  RowClassParams,
  GetContextMenuItemsParams,
  NavigateToNextCellParams,
  ProcessCellForExportParams,
  TabToNextCellParams,
  CellFocusedEvent,
  CellMouseOverEvent,
  CellPosition,
  CellKeyDownEvent,
  CellDoubleClickedEvent,
  SelectionChangedEvent,
  CellValueChangedEvent,
  CellEditingStartedEvent,
  PasteEndEvent,
  PasteStartEvent,
  ProcessDataFromClipboardParams,
  ValueGetterParams,
  FillOperationParams,
  ColSpanParams,
  GridReadyEvent,
  FirstDataRenderedEvent,
  RowNode,
  MenuItemDef,
  GridOptions,
} from "ag-grid-community";
import classNames from "classnames";
import { map, isNil, cloneDeep } from "lodash";
import { AgGridReact, AgGridReactProps } from "@ag-grid-community/react";

import { tabling, updateInArray, ui } from "lib";

type OverriddenAgProps =
  | "getRowClass"
  | "rowClass"
  | "rowHeight"
  | "className"
  | "suppressCopyRowsToClipboard"
  | "getContextMenuItems"
  | "rowData"
  | "columnDefs"
  | "debug"
  | "modules"
  | "getRowStyle"
  | "overlayNoRowsTemplate"
  | "overlayLoadingTemplate"
  | "navigateToNextCell"
  | "tabToNextCell"
  | "frameworkComponents";

type UseAgProps<R extends Table.RowData, RW extends Table.Row<R> = Table.BodyRow<R>> = Omit<
  AgGridReactProps<RW>,
  OverriddenAgProps
> & {
  readonly allowContextMenuWithControlKey?: boolean;
  readonly frameworkComponents?: Table.FrameworkGroup;
  readonly suppressCopyRowsToClipboard?: boolean;
  readonly cellStyle?: ui.Style;
  readonly getRowStyle?: tabling.GetRowStyle<R, RW>;
  readonly navigateToNextCell?: (params: NavigateToNextCellParams<RW>) => Table.CellPosition;
  readonly processCellForClipboard?: (params: ProcessCellForExportParams<RW>) => string;
  readonly tabToNextCell?: (params: TabToNextCellParams<RW>) => Table.CellPosition;
  readonly onCellFocused?: (e: CellFocusedEvent<RW>) => void;
  readonly onCellMouseOver?: (e: CellMouseOverEvent<RW>) => void;
  readonly onCellKeyDown?: (event: CellKeyDownEvent<RW>) => void;
  readonly onSelectionChanged?: (e: SelectionChangedEvent<RW>) => void;
  readonly onGridReady: (e: GridReadyEvent<RW>) => void;
  readonly onFirstDataRendered: (e: FirstDataRenderedEvent<RW>) => void;
  readonly onCellDoubleClicked?: (e: CellDoubleClickedEvent<RW>) => void;
  readonly processDataFromClipboard?: (params: ProcessDataFromClipboardParams<RW>) => string[][];
  readonly processCellFromClipboard?: (params: ProcessCellForExportParams<RW>) => Table.RawRowValue;
  readonly onCellEditingStarted?: (event: CellEditingStartedEvent<RW>) => void;
  readonly onPasteStart?: (event: PasteStartEvent<RW>) => void;
  readonly onPasteEnd?: (event: PasteEndEvent<RW>) => void;
  readonly onCellValueChanged?: (e: CellValueChangedEvent<RW>) => void;
  readonly fillOperation?: (params: FillOperationParams<RW>) => boolean;
  readonly getContextMenuItems?: (
    row: Table.BodyRow<R>,
    node: RowNode<Table.BodyRow<R>>,
  ) => MenuItemDef[];
};

export interface GridProps<
  R extends Table.RowData,
  RW extends Table.Row<R> = Table.BodyRow<R>,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
> extends UseAgProps<R> {
  readonly id: Table.GridId;
  readonly apis: Table.GridApis | null;
  readonly tableId: string;
  readonly data?: RW[];
  readonly keyListeners?: Table.KeyListener[];
  readonly hiddenColumns?: Table.HiddenColumns;
  readonly gridOptions: GridOptions<RW>;
  readonly checkboxColumn?: Table.PartialActionColumn<R, M>;
  readonly columns: Table.Column<R, M>[];
  readonly className?: Table.GeneralClassName;
  readonly style?: React.CSSProperties;
  readonly rowClass?: Table.RowClassName;
  readonly rowHeight?: number;
  readonly localizePopupParent?: boolean;
}

const Grid = <
  R extends Table.RowData,
  RW extends Table.Row<R> = Table.BodyRow<R>,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
>({
  id,
  tableId,
  columns,
  data,
  className,
  hiddenColumns,
  rowClass,
  checkboxColumn,
  style,
  keyListeners,
  localizePopupParent,
  getContextMenuItems: _getContextMenuItems,
  navigateToNextCell: _navigateToNextCell,
  tabToNextCell: _tabToNextCell,
  ...props
}: GridProps<R, M>): JSX.Element => {
  const localColumns = ui.useDeepEqualMemo<Table.RealColumn<R, M>[]>((): Table.RealColumn<
    R,
    M
  >[] => {
    const cs: Table.RealColumn<R, M>[] = map(
      tabling.columns.filterRealColumns(columns),
      (col: Table.RealColumn<R, M>, index: number): Table.RealColumn<R, M> => {
        const hidden =
          tabling.columns.isDataColumn(col) &&
          col.canBeHidden !== false &&
          !isNil(hiddenColumns) &&
          hiddenColumns[col.field] === true;
        return {
          ...col,
          headerComponentParams: { ...col.headerComponentParams, column: col },
          cellRendererParams: { ...col.cellRendererParams, columns, customCol: col, gridId: id },
          hide: hidden,
          resizable:
            index === columns.length - 1 ? false : !isNil(col.resizable) ? col.resizable : true,
          cellStyle: tabling.columns.isDataColumn(col)
            ? !isNil(col.dataType)
              ? { ...tabling.columns.getColumnTypeCSSStyle(col.dataType), ...col.cellStyle }
              : col.cellStyle
            : col.cellStyle,
        };
      },
    );
    return !isNil(checkboxColumn)
      ? updateInArray<Table.RealColumn<R, M>>(cs, { colId: "checkbox" }, checkboxColumn)
      : cs;
  }, [columns]);

  const colDefs = ui.useDeepEqualMemo(
    () =>
      map(
        localColumns,
        (col: Table.RealColumn<R, M>): Table.ColDef => ({
          ...tabling.columns.parseBaseColumn<R, M, typeof col>(col),
          suppressMenu: true,
          valueGetter: tabling.columns.isDataColumn(col)
            ? (params: ValueGetterParams) => {
                if (!isNil(params.node)) {
                  const row: Table.Row<R> = params.node.data;
                  if (tabling.rows.isBodyRow(row)) {
                    return tabling.columns.getColumnRowValue(
                      col,
                      row,
                      tabling.aggrid.getRows<R, Table.BodyRow<R>>(params.api),
                      "aggrid",
                    );
                  }
                }
                return col.nullValue;
              }
            : undefined,
          cellRenderer:
            typeof col.cellRenderer === "string"
              ? col.cellRenderer
              : !isNil(col.cellRenderer)
              ? col.cellRenderer[id]
              : undefined,
          colSpan: (params: ColSpanParams) =>
            !isNil(col.colSpan)
              ? col.colSpan({
                  ...params,
                  columns: localColumns,
                })
              : 1,
          editable: (params: EditableCallbackParams) => {
            const row: Table.Row<R> = params.node.data;
            if (tabling.rows.isBodyRow(row) && tabling.columns.isBodyColumn(col)) {
              return tabling.columns.isEditable<R, M>(col, row);
            }
            return false;
          },
          cellClass: (params: CellClassParams) => {
            const row: Table.Row<R> = params.node.data;
            if (tabling.rows.isEditableRow(row)) {
              const isSelectable = tabling.columns.isBodyColumn(col)
                ? isNil(col.selectable)
                  ? true
                  : typeof col.selectable === "function"
                  ? col.selectable({ row })
                  : col.selectable
                : tabling.columns.isCalculatedColumn(col);
              return tabling.aggrid.mergeClassNames<CellClassParams>(
                params,
                "cell",
                col.cellClass,
                {
                  "cell--not-selectable": isSelectable === false,
                },
              );
            }
            return tabling.aggrid.mergeClassNames<CellClassParams>(params, "cell", col.cellClass, {
              "cell--not-selectable": true,
            });
          },
        }),
      ),
    [localColumns],
  );

  const navigateToNextCell = useMemo(
    () =>
      (params: NavigateToNextCellParams): CellPosition => {
        if (_navigateToNextCell !== undefined) {
          return { ..._navigateToNextCell(params), rowPinned: null };
        }
        return params.nextCellPosition || params.previousCellPosition;
      },
    [_navigateToNextCell],
  );

  const tabToNextCell = useMemo(
    () =>
      (params: TabToNextCellParams): CellPosition => {
        if (_tabToNextCell !== undefined) {
          return { ..._tabToNextCell(params), rowPinned: null };
        }
        return params.nextCellPosition === null
          ? params.previousCellPosition
          : params.nextCellPosition;
      },
    [_tabToNextCell],
  );

  const getRowStyle = useMemo(
    () =>
      !isNil(props.getRowStyle)
        ? (props.getRowStyle as (params: RowClassParams) => { [key: string]: string })
        : undefined,
    [props.getRowStyle],
  );

  /*
  We have to deep clone the row data because it is being pulled directly from the store and as such,
  is immutable.  If we did not do this, than AG Grid would be applying the updates to the elements
  of the data in the store, i.e. mutating the store.  This only becomes a problem since we are
  nestling the actual underlying row data in a `data` property of the <Row> model.
  */
  const rowData = ui.useDeepEqualMemo(
    () => map(data, (r: Table.BodyRow<R>) => cloneDeep(r)),
    [data],
  );

  const getContextMenuItems = useMemo(
    () => (params: GetContextMenuItemsParams<Table.BodyRow<R>>) => {
      if (!isNil(_getContextMenuItems) && !isNil(params.node)) {
        const row: Table.Row<R> = params.node.data;
        if (tabling.rows.isBodyRow(row)) {
          return _getContextMenuItems(row, params.node);
        }
      }
      return [];
    },
    [_getContextMenuItems],
  );

  const getRowClass = useMemo(
    () => (params: RowClassParams) =>
      tabling.aggrid.mergeClassNames<RowClassParams>(params, "row", rowClass),
    [rowClass],
  );

  useEffect(() => {
    const instantiatedListeners: ((e: KeyboardEvent) => void)[] = [];
    const apis = props.apis;
    if (!isNil(apis) && !isNil(keyListeners)) {
      for (let i = 0; i < keyListeners.length; i++) {
        const listener = (e: KeyboardEvent) => keyListeners[i](apis.grid, e);
        window.addEventListener("keydown", listener);
        instantiatedListeners.push(listener);
      }
    }
    return () => {
      for (let i = 0; i < instantiatedListeners.length; i++) {
        window.removeEventListener("keydown", instantiatedListeners[i]);
      }
    };
  }, [keyListeners, props.apis]);

  return (
    <div
      id={`${tableId}-${id}`}
      className={classNames("ag-theme-alpine", "grid", className)}
      style={style}
    >
      <AgGridReact<Table.BodyRow<R>>
        headerHeight={38}
        cellFlashDelay={100}
        cellFadeDelay={500}
        suppressRowClickSelection={true}
        stopEditingWhenCellsLoseFocus={true}
        enableRangeSelection={true}
        animateRows={true}
        enterMovesDown={false}
        immutableData={true}
        getRowNodeId={(r: Table.BodyRow<R>) => `${r.id}`}
        valueCache={true}
        rowBuffer={50}
        {...props}
        rowDragManaged={false}
        rowHeight={props.rowHeight === undefined ? 36 : props.rowHeight}
        navigateToNextCell={navigateToNextCell}
        tabToNextCell={tabToNextCell}
        getRowStyle={getRowStyle}
        getContextMenuItems={getContextMenuItems}
        getRowClass={getRowClass}
        rowData={rowData}
        columnDefs={colDefs}
        debug={process.env.NEXT_PUBLIC_TABLE_DEBUG === "true"}
        overlayNoRowsTemplate="<span></span>"
        overlayLoadingTemplate="<span></span>"
        popupParent={
          localizePopupParent
            ? document.getElementById(tableId) || undefined
            : document.querySelector("body") || undefined
        }
      />
    </div>
  );
};

export default React.memo(Grid) as typeof Grid;
