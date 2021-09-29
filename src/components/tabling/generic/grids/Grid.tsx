import React, { useMemo } from "react";
import { map, isNil, includes, cloneDeep, filter } from "lodash";
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

/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
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

type ExtendAgGridProps = false;
type ExtensionProps = ExtendAgGridProps extends true ? Omit<Table.AgGridProps, OverriddenAgProps> : {};

/*
Note: Right now, we are restricting the use of AG Grid props to those that are
      explicitly defined. If we want to use an additional prop, the best practice
      is to define the prop we want to use ourselves.  This is done because AG
      Grid's typing is prone to errors.
      If we want to open the flood gates and allow our tables to define an AG
      Grid prop anywhere when they are created, we can simply set
      ExtendAgGridProps to true above.
*/
type UseAgProps<R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel> = ExtensionProps & {
  readonly allowContextMenuWithControlKey?: boolean;
  readonly frameworkComponents?: Table.FrameworkGroup;
  readonly suppressCopyRowsToClipboard?: boolean;
  readonly cellStyle?: React.CSSProperties;
  readonly getRowStyle?: Table.GetRowStyle;
  // readonly getRowClass?: Table.GetRowClassName;
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
  readonly processDataFromClipboard?: (params: ProcessDataFromClipboardParams) => any;
  readonly processCellFromClipboard?: (params: ProcessCellForExportParams) => string;
  readonly onCellEditingStarted?: (event: CellEditingStartedEvent) => void;
  readonly onPasteStart?: (event: PasteStartEvent) => void;
  readonly onPasteEnd?: (event: PasteEndEvent) => void;
  readonly onCellValueChanged?: (e: CellValueChangedEvent) => void;
  readonly fillOperation?: (params: FillOperationParams) => boolean;
  readonly getContextMenuItems?: (row: Table.Row<R>, node: Table.RowNode) => Table.MenuItemDef[];
};

export interface GridProps<R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel>
  extends UseAgProps<R, M> {
  readonly id: Table.GridId;
  readonly data?: Table.Row<R>[];
  readonly hiddenColumns: (keyof R | string)[];
  readonly gridOptions: Table.GridOptions;
  readonly indexColumn?: Partial<Table.Column<R, M>>;
  readonly columns: Table.Column<R, M>[];
  readonly className?: Table.GeneralClassName;
  readonly style?: React.CSSProperties;
  readonly rowClass?: Table.RowClassName;
  readonly rowHeight?: number;
  readonly onCellDoubleClicked?: (e: CellDoubleClickedEvent) => void;
  readonly getContextMenuItems?: (row: Table.Row<R>, node: Table.RowNode) => Table.MenuItemDef[];
  readonly navigateToNextCell?: (params: NavigateToNextCellParams) => Table.CellPosition;
  readonly processCellForClipboard?: (params: ProcessCellForExportParams) => string;
  readonly tabToNextCell?: (params: TabToNextCellParams) => Table.CellPosition;
  readonly onCellFocused?: (e: CellFocusedEvent) => void;
  readonly onCellMouseOver?: (e: CellMouseOverEvent) => void;
  readonly onCellKeyDown?: (event: CellKeyDownEvent) => void;
  readonly onGridReady: (e: Table.GridReadyEvent) => void;
  readonly onFirstDataRendered: (e: Table.FirstDataRenderedEvent) => void;
}

/* eslint-disable indent */
const Grid = <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel>({
  id,
  columns,
  data,
  className,
  hiddenColumns,
  rowClass,
  indexColumn,
  style,
  ...props
}: GridProps<R, M>): JSX.Element => {
  const localColumns = useMemo<Table.Column<R, M>[]>((): Table.Column<R, M>[] => {
    let cs: Table.Column<R, M>[] = map(
      columns,
      (col: Table.Column<R, M>, index: number): Table.Column<R, M> =>
        ({
          ...col,
          headerComponentParams: { ...col.headerComponentParams, column: col },
          cellRendererParams: { ...col.cellRendererParams, columns, customCol: col, gridId: id },
          hide: includes(hiddenColumns, col.field),
          resizable: index === columns.length - 1 ? false : !isNil(col.resizable) ? col.resizable : true,
          cellStyle: { ...tabling.columns.getColumnTypeCSSStyle(col.columnType), ...col.cellStyle }
        } as Table.Column<R, M>)
    );
    cs = !isNil(indexColumn) ? util.updateInArray<Table.Column<R, M>>(cs, { field: "index" }, indexColumn) : cs;
    return cs;
  }, [hooks.useDeepEqualMemo(columns)]);

  const colDefs = useMemo(
    () =>
      map(
        filter(localColumns, (c: Table.Column<R, M>) => c.isFake !== true),
        (col: Table.Column<R, M>): ColDef => {
          /*
        While AG Grid will not break if we include extra properties on the ColDef(s)
        (properties from our own custom Table.Column model) - they will complain a lot.
        So we need to try to remove them.
        */
          const {
            footer,
            page,
            selectable,
            requiresAuthentication,
            index,
            canBeExported,
            canBeHidden,
            isRead,
            isWrite,
            isFake,
            columnType,
            tableColumnType,
            nullValue,
            domain,
            refreshColumns,
            onCellDoubleClicked,
            processCellForClipboard,
            processCellFromClipboard,
            getHttpValue,
            getRowValue,
            getGroupValue,
            getMarkupValue,
            ...agColumn
          } = col;
          return {
            ...agColumn,
            field: col.field as string,
            cellStyle: !isNil(col.cellStyle) ? (col.cellStyle as { [key: string]: any }) : undefined,
            suppressMenu: true,
            valueGetter: isNil(agColumn.valueGetter)
              ? (params: ValueGetterParams) => {
                  if (!isNil(params.node)) {
                    const row: Table.Row<R> | undefined = params.node.data;
                    if (!isNil(row) && !isNil(row.data)) {
                      return row.data[params.column.getColId() as keyof R];
                    }
                  }
                  return col.nullValue !== undefined ? col.nullValue : null;
                }
              : agColumn.valueGetter,
            cellRenderer:
              /* eslint-disable indent */
              typeof col.cellRenderer === "string"
                ? col.cellRenderer
                : !isNil(col.cellRenderer)
                ? col.cellRenderer[id]
                : undefined,
            colSpan: (params: ColSpanParams) => (!isNil(col.colSpan) ? col.colSpan({ ...params, columns }) : 1),
            editable: (params: EditableCallbackParams) => {
              const row: Table.Row<R> = params.node.data;
              return typeof col.editable === "function"
                ? col.editable({ row, column: col })
                : isNil(col.editable)
                ? false
                : col.editable;
            },
            cellClass: (params: CellClassParams) => {
              const row: Table.Row<R> = params.node.data;
              if (tabling.typeguards.isEditableRow(row)) {
                /* eslint-disable indent */
                const isSelectable = isNil(col.selectable)
                  ? true
                  : typeof col.selectable === "function"
                  ? col.selectable({ row, column: col })
                  : col.selectable;
                return tabling.aggrid.mergeClassNames<CellClassParams>(params, "cell", col.cellClass, {
                  "cell--not-selectable": isSelectable === false,
                  "cell--not-editable": !(col.editable === true)
                });
              }
              return tabling.aggrid.mergeClassNames<CellClassParams>(params, "cell", col.cellClass, {
                "cell--not-selectable": true,
                "cell--not-editable": true
              });
            }
          };
        }
      ),
    [hooks.useDeepEqualMemo(localColumns)]
  );

  const navigateToNextCell = (params: NavigateToNextCellParams): CellPosition => {
    if (!isNil(props.navigateToNextCell)) {
      return { ...props.navigateToNextCell(params), rowPinned: null };
    }
    return params.nextCellPosition || params.previousCellPosition;
  };

  const tabToNextCell = (params: TabToNextCellParams): CellPosition => {
    if (!isNil(props.tabToNextCell)) {
      return { ...props.tabToNextCell(params), rowPinned: null };
    }
    return params.nextCellPosition;
  };

  return (
    <div className={classNames("ag-theme-alpine", "grid", className)} style={style}>
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
        getRowNodeId={(r: any) => r.id}
        {...props}
        rowHeight={props.rowHeight === undefined ? 36 : props.rowHeight}
        navigateToNextCell={navigateToNextCell}
        tabToNextCell={tabToNextCell}
        getRowStyle={
          // Because AG Grid is terrible with their type bindings, we have to do this
          // to keep things quiet.
          !isNil(props.getRowStyle)
            ? (props.getRowStyle as (params: RowClassParams) => { [key: string]: string })
            : undefined
        }
        getContextMenuItems={(params: GetContextMenuItemsParams) => {
          if (!isNil(props.getContextMenuItems) && !isNil(params.node)) {
            const row: Table.Row<R> = params.node.data;
            return props.getContextMenuItems(row, params.node);
          }
          return [];
        }}
        getRowClass={(params: RowClassParams) =>
          tabling.aggrid.mergeClassNames<RowClassParams>(params, "row", rowClass)
        }
        rowData={map(data, (r: Table.Row<R>) => {
          /*
          We have to deep clone the row data because it is being pulled directly from the store
          and as such, is immutable.  If we did not do this, than AG Grid would be applying the
          updates to the elements of the data in the store, i.e. mutating the store.  This only
          becomes a problem since we are nestling the actual underlying row data in a `data` property
          of the <Row> model.
          */
          return cloneDeep(r);
        })}
        columnDefs={colDefs}
        debug={Config.tableDebug}
        modules={AllModules}
        overlayNoRowsTemplate={"<span></span>"}
        overlayLoadingTemplate={"<span></span>"}
      />
    </div>
  );
};

export default Grid;
