import React, { useMemo } from "react";
import { map, isNil, includes } from "lodash";
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
  ProcessDataFromClipboardParams
} from "@ag-grid-community/core";
import { FillOperationParams } from "@ag-grid-community/core/dist/cjs/entities/gridOptions";

import { TABLE_DEBUG } from "config";
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
type UseAgProps<R extends Table.RowData, M extends Model.Model = Model.Model> = ExtensionProps & {
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
  readonly getContextMenuItems?: (row: Table.Row<R, M>, node: Table.RowNode) => Table.MenuItemDef[];
};

export interface GridProps<R extends Table.RowData, M extends Model.Model = Model.Model> extends UseAgProps<R, M> {
  readonly id: Table.GridId;
  readonly data?: Table.Row<R, M>[];
  readonly hiddenColumns: (keyof R)[];
  readonly gridOptions: Table.GridOptions;
  readonly indexColumn?: Partial<Table.Column<R, M>>;
  readonly columns: Table.Column<R, M>[];
  readonly className?: Table.GeneralClassName;
  readonly style?: React.CSSProperties;
  readonly rowClass?: Table.RowClassName;
  readonly rowHeight?: number;
  readonly onCellDoubleClicked?: (e: CellDoubleClickedEvent) => void;
  readonly getContextMenuItems?: (row: Table.Row<R, M>, node: Table.RowNode) => Table.MenuItemDef[];
  readonly navigateToNextCell?: (params: NavigateToNextCellParams) => Table.CellPosition;
  readonly processCellForClipboard?: (params: ProcessCellForExportParams) => string;
  readonly tabToNextCell?: (params: TabToNextCellParams) => Table.CellPosition;
  readonly onCellFocused?: (e: CellFocusedEvent) => void;
  readonly onCellMouseOver?: (e: CellMouseOverEvent) => void;
  readonly onCellKeyDown?: (event: CellKeyDownEvent) => void;
  readonly onGridReady: (e: Table.GridReadyEvent) => void;
  readonly onFirstDataRendered: (e: Table.FirstDataRenderedEvent) => void;
}

const Grid = <R extends Table.RowData, M extends Model.Model = Model.Model>({
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
  const rowData = useMemo(
    () => (isNil(data) ? [] : map(data, (row: Table.Row<R, M>) => ({ ...row, meta: { ...row.meta, gridId: id } }))),
    [id, hooks.useDeepEqualMemo(data)]
  );

  const localColumns = useMemo<Table.Column<R, M>[]>((): Table.Column<R, M>[] => {
    let cs: Table.Column<R, M>[] = map(
      columns,
      (col: Table.Column<R, M>, index: number): Table.Column<R, M> =>
        ({
          ...col,
          headerComponentParams: { ...col.headerComponentParams, customCol: col },
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
      map(localColumns, (col: Table.Column<R, M>): ColDef => {
        /*
        While AG Grid will not break if we include extra properties on the ColDef(s)
        (properties from our own custom Table.Column model) - they will complain a lot.
        So we need to try to remove them.
        */
        const {
          footer,
          page,
          selectable,
          isCalculating,
          index,
          canBeExported,
          canBeHidden,
          isRead,
          isWrite,
          columnType,
          tableColumnType,
          nullValue,
          domain,
          refreshColumns,
          onCellDoubleClicked,
          processCellForClipboard,
          processCellFromClipboard,
          getHttpValue,
          getModelValue,
          getRowValue,
          ...agColumn
        } = col;
        return {
          ...agColumn,
          field: col.field as string,
          cellStyle: !isNil(col.cellStyle) ? (col.cellStyle as { [key: string]: any }) : undefined,
          suppressMenu: true,
          cellRenderer:
            /* eslint-disable indent */
            typeof col.cellRenderer === "string"
              ? col.cellRenderer
              : !isNil(col.cellRenderer)
              ? col.cellRenderer[id]
              : undefined,
          colSpan: (params: ColSpanParams) => (!isNil(col.colSpan) ? col.colSpan({ ...params, columns }) : 1),
          editable: (params: EditableCallbackParams) => {
            const row: R = params.node.data;
            /* eslint-disable indent */
            return isNil(col.editable)
              ? false
              : typeof col.editable === "function"
              ? col.editable({ row, column: col })
              : col.editable;
          },
          cellClass: (params: CellClassParams) => {
            const row: R = params.node.data;
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
        };
      }),
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
        rowHeight={36}
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
            const row: Table.Row<R, M> = params.node.data;
            return props.getContextMenuItems(row, params.node);
          }
          return [];
        }}
        getRowClass={(params: RowClassParams) =>
          tabling.aggrid.mergeClassNames<RowClassParams>(params, "row", rowClass)
        }
        rowData={rowData}
        columnDefs={colDefs}
        debug={process.env.NODE_ENV === "development" && TABLE_DEBUG}
        modules={AllModules}
        overlayNoRowsTemplate={"<span></span>"}
        overlayLoadingTemplate={"<span></span>"}
      />
    </div>
  );
};

export default Grid;
