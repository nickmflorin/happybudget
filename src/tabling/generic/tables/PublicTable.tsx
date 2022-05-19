import React, { useImperativeHandle, useMemo } from "react";
import { map, isNil, filter, includes } from "lodash";
import { Subtract } from "utility-types";

import { hooks, tabling } from "lib";

import { PublicGrid, PublicGridProps, PublicDataGrid } from "../grids";
import { PublicMenu } from "../menus";
import {
  FooterGrid,
  PublicFooterGridProps,
  ConfiguredTableInjectedProps,
  ConnectedPublicTableInjectedProps,
  DataGridProps,
  PublicizeDataGridProps,
  ConnectPublicTableProps,
  configureTable
} from "../hocs";
import TableWrapper from "./TableWrapper";
import { BaseTableProps } from "./AuthenticatedTable";

export type PublicTableDataGridProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel
> = PublicizeDataGridProps<R, M> & DataGridProps<R, M> & Omit<PublicGridProps<R, M>, "id">;

export type PublicTableProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>
> = BaseTableProps<R, M> &
  ConnectedPublicTableInjectedProps<R, S> &
  Omit<ConnectPublicTableProps<R, M, S>, "actionContext"> & {
    readonly actions?: Table.PublicMenuActions<R, M>;
  };

type _PublicTableProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>
> = PublicTableProps<R, M, S> & ConfiguredTableInjectedProps;

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const TableFooterGrid = FooterGrid<any, any, PublicFooterGridProps<any>>({
  id: "footer",
  className: "grid--table-footer",
  rowClass: "row--table-footer",
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  getFooterColumn: (col: Table.DataColumn<any, any, any>) => col.footer || null
})(PublicGrid) as {
  <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(
    props: Omit<PublicFooterGridProps<R, M>, "id">
  ): JSX.Element;
};

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const PageFooterGrid = FooterGrid<any, any, PublicFooterGridProps<any>>({
  id: "page",
  className: "grid--page-footer",
  rowClass: "row--page-footer",
  rowHeight: 28,
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  getFooterColumn: (col: Table.DataColumn<any, any, any>) => col.page || null
})(PublicGrid) as {
  <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(
    props: Omit<PublicFooterGridProps<R, M>, "id" | "grid">
  ): JSX.Element;
};

const PublicTable = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>
>(
  props: _PublicTableProps<R, M, S>
): JSX.Element => {
  const grid = tabling.hooks.useDataGrid();
  /**
   * Note: Ideally, we would be including the selector in the mechanics of the
   * connectTableToStore HOC.  However, that HOC is usually applied to tables
   * after the columns have already been provided - meaning that the HOC would
   * not have a chance to provide the altered columns to this component (or the
   * configureTable HOC).
   *
   * We should improve the tabling API such that we can apply connectTableToStore
   * and configureTable in any order, and the selector will still be included in
   * the editor and renderer params for each column.
   */
  const columns = useMemo<Table.Column<R, M>[]>((): Table.Column<R, M>[] => {
    const evaluateColumnExclusionProp = (c: Table.DataColumn<R, M>): boolean => {
      if (!isNil(props.excludeColumns)) {
        if (typeof props.excludeColumns === "function") {
          return props.excludeColumns(c);
        }
        return includes(Array.isArray(props.excludeColumns) ? props.excludeColumns : [props.excludeColumns], c.field);
      }
      return false;
    };
    const cs = map(
      filter(
        filter(
          props.columns,
          (c: Table.Column<R, M>) =>
            tabling.columns.isActionColumn(c) || tabling.columns.isFakeColumn(c) || c.requiresAuthentication !== true
        ),
        (c: Table.Column<R, M>) =>
          (tabling.columns.isDataColumn(c) && !evaluateColumnExclusionProp(c)) || tabling.columns.isActionColumn(c)
      ) as Table.RealColumn<R, M>[],
      (c: Table.RealColumn<R, M>) => ({
        ...c,
        cellRendererParams: {
          ...c.cellRendererParams,
          selector: props.selector,
          footerRowSelectors: props.footerRowSelectors
        },
        cellEditorParams: { ...c.cellEditorParams, selector: props.selector }
      })
    );
    return map(cs, (c: Table.Column<R, M>) => ({
      ...c,
      cellRendererParams: { ...c.cellRendererParams, table: props.table.current }
    }));
  }, [hooks.useDeepEqualMemo(props.columns), props.selector, props.excludeColumns, props.table.current]);

  useImperativeHandle(
    props.table,
    () => ({
      ...grid.current,
      /* eslint-disable-next-line @typescript-eslint/no-empty-function */
      saving: () => {},
      notify: () => [],
      lookupAndNotify: () => [],
      /* eslint-disable-next-line @typescript-eslint/no-empty-function */
      clearNotifications: () => {},
      notifications: [],
      handleRequestError: () => [],
      getColumns: () => tabling.columns.filterModelColumns(columns),
      /* eslint-disable-next-line @typescript-eslint/no-empty-function */
      dispatchEvent: () => {},
      changeColumnVisibility: props.changeColumnVisibility,
      getRowsAboveAndIncludingFocusedRow: () => {
        const apis = props.tableApis.get("data");
        if (!isNil(apis)) {
          const position: Table.CellPosition | null = apis.grid.getFocusedCell();
          if (!isNil(position)) {
            const nodes: Table.RowNode[] = [];
            let rowIndex = position.rowIndex;
            let node: Table.RowNode | undefined = apis.grid.getDisplayedRowAtIndex(rowIndex);
            while (rowIndex >= 0 && node !== undefined) {
              nodes.push(node);
              rowIndex = rowIndex - 1;
              if (rowIndex >= 0) {
                node = apis.grid.getDisplayedRowAtIndex(rowIndex);
              }
            }
            return map(nodes, (nd: Table.RowNode) => {
              const row: Table.BodyRow<R> = nd.data;
              return row;
            });
          }
        }
        return [];
      },
      getRows: () => {
        const apis = props.tableApis.get("data");
        if (!isNil(apis)) {
          return tabling.aggrid.getRows(apis.grid);
        }
        return [];
      },
      getRow: (id: Table.BodyRowId) => {
        const apis = props.tableApis.get("data");
        if (!isNil(apis)) {
          const node: Table.RowNode | undefined = apis.grid.getRowNode(String(id));
          return !isNil(node) ? (node.data as Table.BodyRow<R>) : null;
        }
        return null;
      },
      getFocusedRow: () => {
        const apis = props.tableApis.get("data");
        if (!isNil(apis)) {
          const position: Table.CellPosition | null = apis.grid.getFocusedCell();
          if (!isNil(position)) {
            const node: Table.RowNode | undefined = apis.grid.getDisplayedRowAtIndex(position.rowIndex);
            if (!isNil(node)) {
              const row: Table.BodyRow<R> = node.data;
              return row;
            }
          }
        }
        return null;
      }
    }),
    [hooks.useDeepEqualMemo(columns)]
  );

  return (
    <TableWrapper
      id={props.tableId}
      loading={props.loading}
      minimal={props.minimal}
      className={props.className}
      menuPortalId={props.menuPortalId}
      showPageFooter={props.showPageFooter}
      footer={
        <PageFooterGrid
          apis={props.tableApis.get("page")}
          tableId={props.tableId}
          onGridReady={props.onPageGridReady}
          onFirstDataRendered={props.onFirstDataRendered}
          gridOptions={props.tableGridOptions.page}
          columns={columns}
          hiddenColumns={props.hiddenColumns}
          framework={props.framework}
          constrainHorizontally={props.constrainPageFooterHorizontally}
        />
      }
    >
      <React.Fragment>
        <PublicMenu<R, M>
          {...props}
          columns={tabling.columns.filterDataColumns(columns)}
          apis={props.tableApis.get("data")}
        />
        <PublicDataGrid
          {...props}
          apis={props.tableApis.get("data")}
          columns={columns}
          gridOptions={props.tableGridOptions.data}
          grid={grid}
          onGridReady={props.onDataGridReady}
          calculatedCellHasInfo={props.calculatedCellHasInfo}
          onCalculatedCellInfoClicked={props.onCalculatedCellInfoClicked}
        />
        <TableFooterGrid
          tableId={props.tableId}
          apis={props.tableApis.get("footer")}
          onGridReady={props.onFooterGridReady}
          onFirstDataRendered={props.onFirstDataRendered}
          gridOptions={props.tableGridOptions.footer}
          columns={columns}
          hiddenColumns={props.hiddenColumns}
          framework={props.framework}
          constrainHorizontally={props.constrainTableFooterHorizontally}
        />
      </React.Fragment>
    </TableWrapper>
  );
};

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export default configureTable<_PublicTableProps<any, any, any>, any, any>(PublicTable) as {
  <
    R extends Table.RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    S extends Redux.TableStore<R> = Redux.TableStore<R>
  >(
    props: Subtract<_PublicTableProps<R, M, S>, ConfiguredTableInjectedProps>
  ): JSX.Element;
};
