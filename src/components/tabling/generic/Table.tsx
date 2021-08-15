import { useState, useMemo, useImperativeHandle } from "react";
import classNames from "classnames";
import { map, isNil, filter } from "lodash";

import { GridReadyEvent, GridOptions, FirstDataRenderedEvent } from "@ag-grid-community/core";

import { WrapInApplicationSpinner, ShowHide } from "components";
import { tabling, hooks } from "lib";

import * as framework from "./framework";
import TableMenu, { TableMenuProps } from "./Menu";
import {
  TableFooterGrid,
  PageFooterGrid,
  DataGrid,
  DataGridProps,
  DefaultDataGridOptions,
  DefaultFooterGridOptions
} from "./grids";

type InternalDataGridProvidedProps =
  | "apis"
  | "onFirstDataRendered"
  | "onGridReady"
  | "options"
  | "ordering"
  | "hasExpandColumn"
  | "hiddenColumns"
  | "selectionChanged";
type InternalMenuProvidedProps = "apis" | "columns" | "selectedRows" | "hiddenColumns";

export interface TableProps<R extends Table.Row, M extends Model.Model>
  extends Omit<DataGridProps<R, M>, InternalDataGridProvidedProps>,
    Omit<TableMenuProps<R, M>, InternalMenuProvidedProps>,
    StandardComponentProps {
  readonly table?: Table.Ref<R, M>;
  readonly loading?: boolean;
  readonly showPageFooter?: boolean;
  readonly renderDataGrid?: (params: DataGridProps<R, M>) => JSX.Element;
}

const Table = <R extends Table.Row, M extends Model.Model>({
  table,
  columns,
  className,
  style = {},
  loading,
  actions,
  menuPortalId,
  showPageFooter,
  onSearch,
  renderDataGrid,
  ...props
}: TableProps<R, M>) => {
  const grid = tabling.hooks.useGridIfNotDefined<R, M>(props.grid);
  const [selectedRows, setSelectedRows] = useState<R[]>([]);

  const [apis, _setApis] = useState<tabling.TableApis>(new tabling.TableApis({}));
  const [hiddenColumns, changeColumnVisibility] = tabling.hooks.useHiddenColumns({
    cookie: props.cookieNames?.hiddenColumns,
    validateAgainst: map(
      filter(columns, (col: Table.Column<R, M>) => col.canBeHidden !== false),
      (col: Table.Column<R, M>) => col.field
    ),
    apis
  });

  const gridOptions = useMemo((): Table.TableOptionsSet => {
    let page: GridOptions = { ...DefaultFooterGridOptions, alignedGrids: [] };
    let footer: GridOptions = { ...DefaultFooterGridOptions, alignedGrids: [] };
    const data: GridOptions = { ...DefaultDataGridOptions, alignedGrids: [page, footer] };
    footer = { ...footer, alignedGrids: [page, data] };
    page = { ...footer, alignedGrids: [footer, data] };
    return { data, footer, page };
  }, []);

  const hasExpandColumn = useMemo(() => !isNil(props.rowCanExpand), [props.rowCanExpand]);

  useImperativeHandle(table, () => ({
    applyTableChange: grid.current.applyTableChange,
    getCSVData: grid.current.getCSVData,
    changeColumnVisibility
  }));

  const localColumns = useMemo<Table.Column<R, M>[]>((): Table.Column<R, M>[] => {
    let orderedColumns = tabling.util.orderColumns<Table.Column<R, M>, R, M>(columns);
    if (orderedColumns.length !== 0) {
      return map([
        ...filter(orderedColumns, (col: Table.Column<R, M>) => !(col.isCalculated === true)),
        ...map(
          filter(orderedColumns, (col: Table.Column<R, M>) => col.isCalculated === true),
          (def: Table.Column<R, M>) => framework.columnObjs.CalculatedColumn(def)
        )
      ]);
    }
    return orderedColumns;
  }, [hooks.useDeepEqualMemo(columns), hasExpandColumn, props.onRowExpand, props.rowCanExpand]);

  const onGridReady = hooks.useDynamicCallback((e: GridReadyEvent, id: Table.GridId) => {
    const newApis = apis.clone();
    newApis.set(id, { grid: e.api, column: e.columnApi });
    _setApis(newApis);
  });

  const onDataGridReady = useMemo(() => (e: GridReadyEvent) => onGridReady(e, "data"), []);
  const onFooterGridReady = useMemo(() => (e: GridReadyEvent) => onGridReady(e, "footer"), []);
  const onPageGridReady = useMemo(() => (e: GridReadyEvent) => onGridReady(e, "page"), []);

  const onFirstDataRendered = useMemo(
    () =>
      (event: FirstDataRenderedEvent): void => {
        event.api.sizeColumnsToFit();
      },
    []
  );

  return (
    <WrapInApplicationSpinner hideWhileLoading={false} loading={loading}>
      <div className={classNames("table", className)} style={style}>
        <div
          className={classNames("core-table", {
            "with-page-footer": showPageFooter,
            "with-table-menu": isNil(menuPortalId)
          })}
        >
          <TableMenu<R, M>
            apis={apis.get("data")}
            actions={actions}
            search={props.search}
            onSearch={onSearch}
            columns={columns}
            menuPortalId={menuPortalId}
            selectedRows={selectedRows}
            hiddenColumns={hiddenColumns}
            rowHasCheckboxSelection={props.rowHasCheckboxSelection}
          />
          {!isNil(renderDataGrid) ? (
            renderDataGrid({
              apis: apis.get("data"),
              onGridReady: onDataGridReady,
              onFirstDataRendered,
              columns: localColumns,
              gridOptions: gridOptions.data,
              onSelectionChanged: (rows: R[]) => setSelectedRows(rows),
              hiddenColumns,
              hasExpandColumn,
              grid,
              ...props
            })
          ) : (
            <DataGrid<R, M>
              apis={apis.get("data")}
              grid={grid}
              onGridReady={onDataGridReady}
              onFirstDataRendered={onFirstDataRendered}
              columns={localColumns}
              gridOptions={gridOptions.data}
              onSelectionChanged={(rows: R[]) => setSelectedRows(rows)}
              hiddenColumns={hiddenColumns}
              hasExpandColumn={hasExpandColumn}
              {...props}
            />
          )}
          <TableFooterGrid<R, M>
            onGridReady={onFooterGridReady}
            onFirstDataRendered={onFirstDataRendered}
            gridOptions={gridOptions.footer}
            columns={localColumns}
            hasExpandColumn={hasExpandColumn}
            hiddenColumns={hiddenColumns}
            framework={props.framework}
            onChangeEvent={props.onChangeEvent}
          />
        </div>
        <ShowHide show={showPageFooter}>
          <div className={"page-footer-grid-wrapper"}>
            <div style={{ flexGrow: 100 }}></div>
            <PageFooterGrid<R, M>
              onGridReady={onPageGridReady}
              onFirstDataRendered={onFirstDataRendered}
              gridOptions={gridOptions.page}
              columns={localColumns}
              hasExpandColumn={hasExpandColumn}
              hiddenColumns={hiddenColumns}
              framework={props.framework}
              onChangeEvent={props.onChangeEvent}
            />
          </div>
        </ShowHide>
      </div>
    </WrapInApplicationSpinner>
  );
};

export default Table;
