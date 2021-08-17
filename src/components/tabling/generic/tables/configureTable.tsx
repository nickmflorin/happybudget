import { useMemo, useState } from "react";
import { map, isNil, filter, includes, reduce } from "lodash";
import { Subtract } from "utility-types";
import { GridReadyEvent, GridOptions, FirstDataRenderedEvent, RowNode } from "@ag-grid-community/core";

import { TABLE_DEBUG } from "config";
import { tabling, hooks, util } from "lib";

import * as framework from "../framework";

export const DefaultDataGridOptions: GridOptions = {
  defaultColDef: {
    resizable: true,
    sortable: false,
    filter: false,
    suppressMovable: true
  },
  suppressHorizontalScroll: true,
  suppressContextMenu: process.env.NODE_ENV === "development" && TABLE_DEBUG,
  // If for whatever reason, we have a table that cannot support bulk-updating,
  // these two parameters need to be set to true.
  suppressCopyRowsToClipboard: false,
  suppressClipboardPaste: false,
  enableFillHandle: true,
  fillHandleDirection: "y"
};

export const DefaultFooterGridOptions: GridOptions = {
  defaultColDef: {
    resizable: false,
    sortable: false,
    filter: false,
    editable: false,
    suppressMovable: true
  },
  suppressContextMenu: true,
  suppressHorizontalScroll: true
};

export type _InjectedTableProps<R extends Table.Row, M extends Model.Model> = {
  readonly tableApis: Table.ITableApis;
  readonly hiddenColumns: Table.Field<R, M>[];
  readonly tableGridOptions: Table.TableOptionsSet;
  readonly hasExpandColumn: boolean;
  readonly getCSVData: () => CSVData;
  readonly onDataGridReady: (event: GridReadyEvent) => void;
  readonly onFooterGridReady: (event: GridReadyEvent) => void;
  readonly onPageGridReady: (event: GridReadyEvent) => void;
  readonly onFirstDataRendered: (e: FirstDataRenderedEvent) => void;
  readonly changeColumnVisibility: (
    changes: SingleOrArray<Table.ColumnVisibilityChange<R, M>>,
    sizeToFit?: boolean
  ) => void;
};

export type TableConfiguration<R extends Table.Row, M extends Model.Model> = {
  readonly className?: Table.GeneralClassName;
  readonly cookieNames?: Table.CookieNames;
  readonly columns: Table.Column<R, M>[];
  readonly calculatedColumnWidth?: number;
  readonly indexColumn?: Partial<Table.Column<R, M>>;
  readonly indexColumnWidth?: number;
  readonly expandColumn?: Partial<Table.Column<R, M>>;
  readonly expandColumnWidth?: number;
  readonly expandCellTooltip?: string;
  readonly showPageFooter?: boolean;
  readonly minimal?: boolean;
  readonly leftAlignNewRowButton?: boolean;
  readonly loading?: boolean;
  readonly framework?: Table.Framework;
  readonly search?: string;
  readonly menuPortalId?: string;
  readonly getRowName?: number | string | ((m: M) => number | string | null);
  readonly getRowLabel?: number | string | ((m: M) => number | string | null);
  readonly defaultRowLabel?: string;
  readonly defaultRowName?: string;
  readonly rowHeight?: number;
  readonly rowCanExpand?: (row: R) => boolean;
  readonly onRowExpand?: null | ((id: number) => void);
  readonly onCellFocusChanged?: (params: Table.CellFocusChangedParams<R, M>) => void;
  readonly isCellSelectable?: (params: Table.SelectableCallbackParams<R, M>) => boolean;
  readonly onSearch?: (value: string) => void;
};

const InitialAPIs = new tabling.TableApis({});

const configureTable = <P extends _InjectedTableProps<R, M>, R extends Table.Row = any, M extends Model.Model = any>(
  Component: SimpleFunctionComponent<P>
) =>
  /* eslint-disable indent */
  function Comp(props: Subtract<P, _InjectedTableProps<R, M>> & TableConfiguration<R, M>): JSX.Element {
    const [_apis, _setApis] = useState<tabling.TableApis>(InitialAPIs);
    //const _apis = useRef<tabling.TableApis>(InitialAPIs);

    const [hiddenColumns, changeColumnVisibility] = tabling.hooks.useHiddenColumns<R, M>({
      cookie: props.cookieNames?.hiddenColumns,
      validateAgainst: map(
        filter(props.columns, (col: Table.Column<R, M>) => col.canBeHidden !== false),
        (col: Table.Column<R, M>) => col.field
      ),
      apis: _apis
    });

    const onDataGridReady = useMemo(() => (e: GridReadyEvent) => onGridReady(e, "data"), []);
    const onFooterGridReady = useMemo(() => (e: GridReadyEvent) => onGridReady(e, "footer"), []);
    const onPageGridReady = useMemo(() => (e: GridReadyEvent) => onGridReady(e, "page"), []);

    const onGridReady = hooks.useDynamicCallback((e: GridReadyEvent, id: Table.GridId) => {
      const newApis = _apis.clone();
      newApis.set(id, { grid: e.api, column: e.columnApi });
      _setApis(newApis);
    });

    const onFirstDataRendered = useMemo(
      () =>
        (event: FirstDataRenderedEvent): void => {
          event.api.sizeColumnsToFit();
        },
      []
    );

    const tableGridOptions = useMemo((): Table.TableOptionsSet => {
      let page: GridOptions = { ...DefaultFooterGridOptions, alignedGrids: [] };
      let footer: GridOptions = { ...DefaultFooterGridOptions, alignedGrids: [] };
      const data: GridOptions = { ...DefaultDataGridOptions, alignedGrids: [page, footer] };
      footer = { ...footer, alignedGrids: [page, data] };
      page = { ...footer, alignedGrids: [footer, data] };
      return { data, footer, page };
    }, []);

    const hasExpandColumn = useMemo(() => !isNil(props.onRowExpand), [props.onRowExpand]);

    const columns = useMemo<Table.Column<R, M>[]>((): Table.Column<R, M>[] => {
      let orderedColumns = tabling.util.orderColumns<Table.Column<R, M>, R, M>(props.columns);
      if (hasExpandColumn === true) {
        return [
          framework.columnObjs.IndexColumn({ ...props.indexColumn }, hasExpandColumn, props.indexColumnWidth),
          framework.columnObjs.ExpandColumn(
            {
              // These are only applicable for the non-footer grids, but it is easier to define them
              // at the top Table level than at the Grid level.
              cellRendererParams: {
                ...props.expandColumn?.cellRendererParams,
                onClick: props.onRowExpand,
                rowCanExpand: props.rowCanExpand,
                tooltip: props.expandCellTooltip
              }
            },
            props.expandColumnWidth
          ),
          ...orderedColumns
        ];
      }
      return [
        framework.columnObjs.IndexColumn({ ...props.indexColumn }, hasExpandColumn || false, props.indexColumnWidth),
        ...orderedColumns
      ];
    }, [
      hooks.useDeepEqualMemo(props.columns),
      hasExpandColumn,
      props.calculatedColumnWidth,
      props.onRowExpand,
      props.rowCanExpand
    ]);

    const processCellForClipboard = hooks.useDynamicCallback((column: Table.Column<R, M>, row: R, value?: any) => {
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

    const getCSVData = hooks.useDynamicCallback((fields?: Table.Field<R, M>[]) => {
      const apis: Table.GridApis | null = _apis.get("data");
      if (!isNil(apis)) {
        const cs: Table.Column<R, M>[] = filter(
          columns,
          (column: Table.Column<R, M>) =>
            column.canBeExported !== false && (isNil(fields) || includes(fields, column.field))
        );
        const csvData: CSVData = [map(cs, (col: Table.Column<R, M>) => col.headerName || "")];
        apis.grid.forEachNode((node: RowNode, index: number) => {
          const row: R = node.data;
          csvData.push(
            reduce(
              cs,
              (current: CSVRow, column: Table.Column<R, M>) => [...current, processCellForClipboard(column, row)],
              []
            )
          );
        });
        return csvData;
      }
      return [];
    });

    return (
      <Component
        {...(props as P & TableConfiguration<R, M>)}
        columns={columns}
        tableApis={_apis}
        hasExpandColumn={hasExpandColumn}
        tableGridOptions={tableGridOptions}
        hiddenColumns={hiddenColumns}
        getCSVData={getCSVData}
        onDataGridReady={onDataGridReady}
        onFooterGridReady={onFooterGridReady}
        onPageGridReady={onPageGridReady}
        onFirstDataRendered={onFirstDataRendered}
        changeColumnVisibility={changeColumnVisibility}
      />
    );
  };

export default configureTable;
