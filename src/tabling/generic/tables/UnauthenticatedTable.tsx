import React, { useImperativeHandle, useMemo } from "react";
import { map, isNil, filter, includes } from "lodash";

import { hooks, tabling } from "lib";

import { UnauthenticatedGrid, UnauthenticatedGridProps } from "../grids";
import { UnauthenticatedMenu } from "../menus";
import {
  FooterGrid,
  UnauthenticatedFooterGridProps,
  TableConfigurationProps,
  WithConfiguredTableProps,
  WithConnectedTableProps,
  WithUnauthenticatedDataGridProps,
  DataGridProps,
  UnauthenticateDataGridProps,
  configureTable
} from "../hocs";
import TableWrapper from "./TableWrapper";

export type UnauthenticatedTableDataGridProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel
> = UnauthenticateDataGridProps<R, M> & DataGridProps<R, M> & Omit<UnauthenticatedGridProps<R, M>, "id">;

export type UnauthenticatedTableProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel
> = TableConfigurationProps<R, M> & {
  readonly table?: NonNullRef<Table.TableInstance<R, M>>;
  readonly actions?: Table.UnauthenticatedMenuActions<R, M>;
  readonly constrainTableFooterHorizontally?: boolean;
  readonly constrainPageFooterHorizontally?: boolean;
  readonly excludeColumns?:
    | SingleOrArray<string | ((col: Table.DataColumn<R, M>) => boolean)>
    | ((col: Table.DataColumn<R, M>) => boolean);
};

type _UnauthenticatedTableProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel
> = UnauthenticatedTableProps<R, M> & {
  readonly children: RenderPropChild<UnauthenticatedTableDataGridProps<R, M>>;
};

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const TableFooterGrid = FooterGrid<any, any, UnauthenticatedFooterGridProps<any>>({
  id: "footer",
  className: "grid--table-footer",
  rowClass: "row--table-footer",
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  getFooterColumn: (col: Table.DataColumn<any, any, any>) => col.footer || null
})(UnauthenticatedGrid) as {
  <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(
    props: Omit<UnauthenticatedFooterGridProps<R, M>, "id">
  ): JSX.Element;
};

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const PageFooterGrid = FooterGrid<any, any, UnauthenticatedFooterGridProps<any>>({
  id: "page",
  className: "grid--page-footer",
  rowClass: "row--page-footer",
  rowHeight: 28,
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  getFooterColumn: (col: Table.DataColumn<any, any, any>) => col.page || null
})(UnauthenticatedGrid) as {
  <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(
    props: Omit<UnauthenticatedFooterGridProps<R, M>, "id" | "grid">
  ): JSX.Element;
};

const UnauthenticatedTable = <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(
  props: WithUnauthenticatedDataGridProps<
    WithConnectedTableProps<WithConfiguredTableProps<_UnauthenticatedTableProps<R, M>, R>, R, M>
  >
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
    return map(
      filter(
        props.columns,
        (c: Table.Column<R, M>) =>
          (tabling.typeguards.isDataColumn(c) && !evaluateColumnExclusionProp(c)) ||
          tabling.typeguards.isActionColumn(c)
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
  }, [hooks.useDeepEqualMemo(props.columns), props.selector, props.excludeColumns]);

  useImperativeHandle(
    props.table,
    () => ({
      ...grid.current,
      notify: () => [],
      lookupAndNotify: () => [],
      /* eslint-disable-next-line @typescript-eslint/no-empty-function */
      clearNotifications: () => {},
      notifications: [],
      handleRequestError: () => [],
      getColumns: () => tabling.columns.filterModelColumns(columns),
      /* eslint-disable-next-line @typescript-eslint/no-empty-function */
      applyTableChange: () => {},
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
        <UnauthenticatedMenu<R, M>
          {...props}
          columns={tabling.columns.filterDataColumns(columns)}
          apis={props.tableApis.get("data")}
        />
        {props.children({
          ...props,
          apis: props.tableApis.get("data"),
          columns: columns,
          grid,
          gridOptions: props.tableGridOptions.data,
          onGridReady: props.onDataGridReady
        })}
        <TableFooterGrid
          tableId={props.tableId}
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

type Props = WithUnauthenticatedDataGridProps<
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  WithConnectedTableProps<WithConfiguredTableProps<_UnauthenticatedTableProps<any>, any>, any>
>;

const Memoized = React.memo(UnauthenticatedTable) as typeof UnauthenticatedTable;

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export default configureTable<any, any, Props>(Memoized) as {
  <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(
    props: _UnauthenticatedTableProps<R, M>
  ): JSX.Element;
};
