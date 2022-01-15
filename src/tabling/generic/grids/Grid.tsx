import React, { useMemo } from "react";
import { map, isNil, cloneDeep } from "lodash";
import classNames from "classnames";

import { AgGridReact } from "@ag-grid-community/react";
import { AllModules, ColSpanParams } from "@ag-grid-enterprise/all-modules";
import {
  ColDef,
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
  FirstDataRenderedEvent,
  SelectionChangedEvent,
  GridReadyEvent,
  CellValueChangedEvent,
  CellEditingStartedEvent,
  PasteEndEvent,
  PasteStartEvent,
  ProcessDataFromClipboardParams,
  ValueGetterParams
} from "@ag-grid-community/core";
import { FillOperationParams } from "@ag-grid-community/core/dist/cjs/entities/gridOptions";

import { Config } from "config";
import { tabling, hooks, util } from "lib";

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

type UseAgProps<R extends Table.RowData> = Omit<Table.AgGridProps, OverriddenAgProps> & {
  readonly allowContextMenuWithControlKey?: boolean;
  readonly frameworkComponents?: Table.FrameworkGroup;
  readonly suppressCopyRowsToClipboard?: boolean;
  readonly cellStyle?: React.CSSProperties;
  readonly getRowStyle?: Table.GetRowStyle;
  readonly navigateToNextCell?: (params: NavigateToNextCellParams) => Table.CellPosition;
  readonly processCellForClipboard?: (params: ProcessCellForExportParams) => void;
  readonly tabToNextCell?: (params: TabToNextCellParams) => Table.CellPosition;
  readonly onCellFocused?: (e: CellFocusedEvent) => void;
  readonly onCellMouseOver?: (e: CellMouseOverEvent) => void;
  readonly onCellKeyDown?: (event: CellKeyDownEvent) => void;
  readonly onSelectionChanged?: (e: SelectionChangedEvent) => void;
  readonly onGridReady: (e: GridReadyEvent) => void;
  readonly onFirstDataRendered: (e: FirstDataRenderedEvent) => void;
  readonly onCellDoubleClicked?: (e: CellDoubleClickedEvent) => void;
  readonly processDataFromClipboard?: (params: ProcessDataFromClipboardParams) => string[][];
  readonly processCellFromClipboard?: (params: ProcessCellForExportParams) => Table.RawRowValue;
  readonly onCellEditingStarted?: (event: CellEditingStartedEvent) => void;
  readonly onPasteStart?: (event: PasteStartEvent) => void;
  readonly onPasteEnd?: (event: PasteEndEvent) => void;
  readonly onCellValueChanged?: (e: CellValueChangedEvent) => void;
  readonly fillOperation?: (params: FillOperationParams) => boolean;
  readonly getContextMenuItems?: (row: Table.BodyRow<R>, node: Table.RowNode) => Table.MenuItemDef[];
};

export interface GridProps<R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>
  extends UseAgProps<R> {
  readonly id: Table.GridId;
  readonly tableId: string;
  readonly data?: Table.BodyRow<R>[];
  readonly hiddenColumns?: Table.HiddenColumns;
  readonly gridOptions: Table.GridOptions;
  readonly checkboxColumn?: Table.PartialActionColumn<R, M>;
  readonly columns: Table.Column<R, M>[];
  readonly className?: Table.GeneralClassName;
  readonly style?: React.CSSProperties;
  readonly rowClass?: Table.RowClassName;
  readonly rowHeight?: number;
  readonly onCellDoubleClicked?: (e: CellDoubleClickedEvent) => void;
  readonly getContextMenuItems?: (row: Table.BodyRow<R>, node: Table.RowNode) => Table.MenuItemDef[];
  readonly navigateToNextCell?: (params: NavigateToNextCellParams) => Table.CellPosition;
  readonly processCellForClipboard?: (params: ProcessCellForExportParams) => string;
  readonly tabToNextCell?: (params: TabToNextCellParams) => Table.CellPosition;
  readonly onCellFocused?: (e: CellFocusedEvent) => void;
  readonly onCellMouseOver?: (e: CellMouseOverEvent) => void;
  readonly onCellKeyDown?: (event: CellKeyDownEvent) => void;
  readonly onGridReady: (e: Table.GridReadyEvent) => void;
  readonly onFirstDataRendered: (e: Table.FirstDataRenderedEvent) => void;
  readonly localizePopupParent?: boolean;
}

const Grid = <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>({
  id,
  tableId,
  columns,
  data,
  className,
  hiddenColumns,
  rowClass,
  checkboxColumn,
  style,
  localizePopupParent,
  ...props
}: GridProps<R, M>): JSX.Element => {
  const localColumns = useMemo<Table.RealColumn<R, M>[]>((): Table.RealColumn<R, M>[] => {
    const cs: Table.RealColumn<R, M>[] = map(
      tabling.columns.filterRealColumns(columns),
      (col: Table.RealColumn<R, M>, index: number): Table.RealColumn<R, M> => {
        const hidden =
          tabling.typeguards.isDataColumn(col) &&
          col.canBeHidden === true &&
          (isNil(hiddenColumns) || hiddenColumns[col.field] === true);
        return {
          ...col,
          headerComponentParams: { ...col.headerComponentParams, column: col },
          cellRendererParams: { ...col.cellRendererParams, columns, customCol: col, gridId: id },
          hide: hidden,
          resizable: index === columns.length - 1 ? false : !isNil(col.resizable) ? col.resizable : true,
          cellStyle: tabling.typeguards.isDataColumn(col)
            ? !isNil(col.dataType)
              ? { ...tabling.columns.getColumnTypeCSSStyle(col.dataType), ...col.cellStyle }
              : col.cellStyle
            : col.cellStyle
        };
      }
    );
    return !isNil(checkboxColumn)
      ? util.updateInArray<Table.RealColumn<R, M>>(cs, { colId: "checkbox" }, checkboxColumn)
      : cs;
  }, [hiddenColumns, hooks.useDeepEqualMemo(columns)]);

  const colDefs = useMemo(
    () =>
      map(
        localColumns,
        (col: Table.RealColumn<R, M>): ColDef => ({
          ...tabling.columns.parseBaseColumn<R, M, typeof col>(col),
          suppressMenu: true,
          valueGetter: tabling.typeguards.isDataColumn(col)
            ? (params: ValueGetterParams) => {
                if (!isNil(params.node)) {
                  const row: Table.Row<R> = params.node.data;
                  if (tabling.typeguards.isBodyRow(row)) {
                    return tabling.columns.getColumnRowValue(
                      col,
                      row,
                      tabling.aggrid.getRows<R, Table.BodyRow<R>>(params.api),
                      "aggrid"
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
                  columns: localColumns
                })
              : 1,
          editable: (params: EditableCallbackParams) => {
            const row: Table.Row<R> = params.node.data;
            if (tabling.typeguards.isBodyRow(row) && tabling.typeguards.isBodyColumn(col)) {
              return tabling.columns.isEditable<R, M>(col, row);
            }
            return false;
          },
          cellClass: (params: CellClassParams) => {
            const row: Table.Row<R> = params.node.data;
            if (tabling.typeguards.isEditableRow(row)) {
              const isSelectable = tabling.typeguards.isBodyColumn(col)
                ? isNil(col.selectable)
                  ? true
                  : typeof col.selectable === "function"
                  ? col.selectable({ row })
                  : col.selectable
                : tabling.typeguards.isCalculatedColumn(col);
              return tabling.aggrid.mergeClassNames<CellClassParams>(params, "cell", col.cellClass, {
                "cell--not-selectable": isSelectable === false
              });
            }
            return tabling.aggrid.mergeClassNames<CellClassParams>(params, "cell", col.cellClass, {
              "cell--not-selectable": true
            });
          }
        })
      ),
    [hooks.useDeepEqualMemo(localColumns)]
  );

  const navigateToNextCell = useMemo(
    () =>
      (params: NavigateToNextCellParams): CellPosition => {
        if (!isNil(props.navigateToNextCell)) {
          return { ...props.navigateToNextCell(params), rowPinned: null };
        }
        return params.nextCellPosition || params.previousCellPosition;
      },
    []
  );

  const tabToNextCell = useMemo(
    () =>
      (params: TabToNextCellParams): CellPosition => {
        if (!isNil(props.tabToNextCell)) {
          return { ...props.tabToNextCell(params), rowPinned: null };
        }
        return params.nextCellPosition === null ? params.previousCellPosition : params.nextCellPosition;
      },
    []
  );

  const getRowStyle = useMemo(
    () =>
      !isNil(props.getRowStyle)
        ? (props.getRowStyle as (params: RowClassParams) => { [key: string]: string })
        : undefined,
    [props.getRowStyle]
  );

  /*
  We have to deep clone the row data because it is being pulled directly from
	the store and as such, is immutable.  If we did not do this, than AG Grid would
	be applying the updates to the elements of the data in the store, i.e. mutating
	the store.  This only becomes a problem since we are nestling the actual
	underlying row data in a `data` property of the <Row> model.
  */
  const rowData = useMemo(() => map(data, (r: Table.BodyRow<R>) => cloneDeep(r)), [hooks.useDeepEqualMemo(data)]);

  const getContextMenuItems = useMemo(
    () => (params: GetContextMenuItemsParams) => {
      if (!isNil(props.getContextMenuItems) && !isNil(params.node)) {
        const row: Table.Row<R> = params.node.data;
        if (tabling.typeguards.isBodyRow(row)) {
          return props.getContextMenuItems(row, params.node);
        }
      }
      return [];
    },
    [props.getContextMenuItems]
  );

  const getRowClass = useMemo(
    () => (params: RowClassParams) => tabling.aggrid.mergeClassNames<RowClassParams>(params, "row", rowClass),
    []
  );

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const getRowNodeId = useMemo(() => (r: any) => r.id, []);

  return (
    <div id={`${tableId}-${id}`} className={classNames("ag-theme-alpine", "grid", className)} style={style}>
      <AgGridReact
        headerHeight={38}
        cellFlashDelay={100}
        cellFadeDelay={500}
        suppressRowClickSelection={true}
        stopEditingWhenCellsLoseFocus={true}
        enableRangeSelection={true}
        animateRows={true}
        enterMovesDown={false}
        immutableData={true}
        getRowNodeId={getRowNodeId}
        valueCache={true}
        rowBuffer={50}
        {...props}
        rowDragManaged={false}
        reactUi={false}
        rowHeight={props.rowHeight === undefined ? 36 : props.rowHeight}
        navigateToNextCell={navigateToNextCell}
        tabToNextCell={tabToNextCell}
        getRowStyle={getRowStyle}
        getContextMenuItems={getContextMenuItems}
        getRowClass={getRowClass}
        rowData={rowData}
        columnDefs={colDefs}
        debug={Config.tableDebug}
        modules={AllModules}
        overlayNoRowsTemplate={"<span></span>"}
        overlayLoadingTemplate={"<span></span>"}
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
