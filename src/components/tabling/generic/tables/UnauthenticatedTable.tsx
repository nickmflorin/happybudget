import React, { useImperativeHandle, useMemo } from "react";
import { map } from "lodash";

import { hooks } from "lib";

import { UnauthenticatedGrid, UnauthenticatedGridProps } from "../grids";
import { UnauthenticatedMenu } from "../menus";
import {
  FooterGrid,
  TableConfigurationProps,
  WithConfiguredTableProps,
  WithConnectedTableProps,
  DataGridProps,
  UnauthenticateDataGridProps,
  configureTable
} from "../hocs";
import TableWrapper from "./TableWrapper";

export type UnauthenticatedTableDataGridProps<
  R extends Table.RowData,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group
> = UnauthenticateDataGridProps<R, M> & DataGridProps<R, M, G> & Omit<UnauthenticatedGridProps<R, M>, "id">;

export type UnauthenticatedTableProps<
  R extends Table.RowData,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group
> = TableConfigurationProps<R, M> & {
  readonly tableRef?: NonNullRef<Table.UnauthenticatedTableRefObj<R>>;
  readonly actions?: Table.UnauthenticatedMenuActions<R, M>;
  readonly children: RenderPropChild<UnauthenticatedTableDataGridProps<R, M, G>>;
};

const TableFooterGrid = FooterGrid<any, UnauthenticatedGridProps<any>>({
  rowId: "footer-row",
  id: "footer",
  className: "grid--table-footer",
  rowClass: "row--table-footer",
  getFooterColumn: (col: Table.Column<any>) => col.footer || null
})(UnauthenticatedGrid) as {
  <R extends Table.RowData, M extends Model.Model = Model.Model>(
    props: Omit<UnauthenticatedGridProps<R, M>, "id">
  ): JSX.Element;
};

const PageFooterGrid = FooterGrid<any, UnauthenticatedGridProps<any>>({
  rowId: "page-row",
  id: "page",
  className: "grid--page-footer",
  rowClass: "row--page-footer",
  rowHeight: 28,
  getFooterColumn: (col: Table.Column<any>) => col.page || null
})(UnauthenticatedGrid) as {
  <R extends Table.RowData, M extends Model.Model = Model.Model>(
    props: Omit<UnauthenticatedGridProps<R, M>, "id">
  ): JSX.Element;
};

/* eslint-disable indent */
const UnauthenticatedTable = <
  R extends Table.RowData,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group
>(
  props: WithConnectedTableProps<WithConfiguredTableProps<UnauthenticatedTableProps<R, M, G>, R, M>, R, M, G>
): JSX.Element => {
  /**
   * Note: Ideally, we would be including the selector in the mechanics of the
   * connectTableToStore HOC.  However, that HOC is usually applied to tables after
   * the columns have already been provided - meaning that the HOC would not have
   * a chance to provide the altered columns to this component (or the configureTable HOC).
   *
   * We should improve the tabling API such that we can apply connectTableToStore and
   * configureTable in any order, and the selector will still be included in the editor
   * and renderer params for each column.
   */
  const columns = useMemo<Table.Column<R, M>[]>((): Table.Column<R, M>[] => {
    return map(props.columns, (c: Table.Column<R, M>) => ({
      ...c,
      cellRendererParams: { ...c.cellRendererParams, selector: props.selector },
      cellEditorParams: { ...c.cellEditorParams, selector: props.selector }
    }));
  }, [hooks.useDeepEqualMemo(props.columns)]);

  useImperativeHandle(props.tableRef, () => ({
    getCSVData: props.getCSVData,
    changeColumnVisibility: props.changeColumnVisibility
  }));

  return (
    <TableWrapper
      loading={props.loading}
      minimal={props.minimal}
      className={props.className}
      menuPortalId={props.menuPortalId}
      showPageFooter={props.showPageFooter}
      footer={
        <PageFooterGrid
          onGridReady={props.onPageGridReady}
          onFirstDataRendered={props.onFirstDataRendered}
          gridOptions={props.tableGridOptions.page}
          columns={columns}
          hiddenColumns={props.hiddenColumns}
          framework={props.framework}
          indexColumn={{
            // If we want to leftAlign the New Row Button, we do not want to have the cell span 2 columns
            // because then the New Row Button will be centered horizontally between two cells and not
            // aligned with the Index cells in the grid--data.
            colSpan: (params: Table.ColSpanParams<R, M>) =>
              props.hasExpandColumn && !(props.leftAlignNewRowButton === true) ? 2 : 1
          }}
        />
      }
    >
      <React.Fragment>
        <UnauthenticatedMenu<R, M> {...props} apis={props.tableApis.get("data")} />
        {props.children({
          apis: props.tableApis.get("data"),
          hiddenColumns: props.hiddenColumns,
          columns: columns,
          gridOptions: props.tableGridOptions.data,
          data: props.data,
          groups: props.groups,
          hasExpandColumn: props.hasExpandColumn,
          framework: props.framework,
          onGridReady: props.onDataGridReady,
          onFirstDataRendered: props.onFirstDataRendered
        })}
        <TableFooterGrid
          onGridReady={props.onFooterGridReady}
          onFirstDataRendered={props.onFirstDataRendered}
          gridOptions={props.tableGridOptions.footer}
          columns={columns}
          hiddenColumns={props.hiddenColumns}
          framework={props.framework}
        />
      </React.Fragment>
    </TableWrapper>
  );
};

type Props = WithConnectedTableProps<WithConfiguredTableProps<UnauthenticatedTableProps<any>, any>, any>;

export default configureTable<any, any, Props>(UnauthenticatedTable) as {
  <R extends Table.RowData, M extends Model.Model = Model.Model, G extends Model.Group = Model.Group>(
    props: UnauthenticatedTableProps<R, M, G>
  ): JSX.Element;
};
