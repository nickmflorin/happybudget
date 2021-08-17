import React, { useImperativeHandle } from "react";
import { Subtract } from "utility-types";

import { ReadOnlyGrid, ReadOnlyGridProps } from "../grids";
import { ReadOnlyMenu, ReadOnlyMenuProps } from "../menus";
import { FooterGrid } from "../hocs";
import configureTable, { _InjectedTableProps, TableConfiguration } from "./configureTable";
import TableWrapper from "./TableWrapper";

type _ReadOnlyTableProps<R extends Table.Row, M extends Model.Model> = ReadOnlyMenuProps<R, M> &
  _InjectedTableProps<R, M> &
  TableConfiguration<R, M> & {
    readonly tableRef?: NonNullRef<Table.ReadOnlyTableRefObj<R, M>>;
    readonly children: RenderPropChild<TableUi.ReadOnlyDataGridRenderParams<R, M>>;
  };

export type ReadOnlyTableProps<R extends Table.Row, M extends Model.Model> = Omit<
  Subtract<_ReadOnlyTableProps<R, M>, _InjectedTableProps<R, M>>,
  "children"
>;

const TableFooterGrid = FooterGrid<ReadOnlyGridProps>({
  rowId: "footer-row",
  id: "footer",
  className: "grid--table-footer",
  rowClass: "row--table-footer",
  getFooterColumn: (col: Table.Column<any, any>) => col.footer || null
})(ReadOnlyGrid);

const PageFooterGrid = FooterGrid<ReadOnlyGridProps>({
  rowId: "page-row",
  id: "page",
  className: "grid--page-footer",
  rowClass: "row--page-footer",
  rowHeight: 28,
  getFooterColumn: (col: Table.Column<any, any>) => col.page || null
})(ReadOnlyGrid);

const ReadOnlyTable = <R extends Table.Row, M extends Model.Model>(props: _ReadOnlyTableProps<R, M>): JSX.Element => {
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
      footer={
        props.showPageFooter ? (
          <PageFooterGrid
            onGridReady={props.onPageGridReady}
            onFirstDataRendered={props.onFirstDataRendered}
            gridOptions={props.tableGridOptions.page}
            columns={props.columns}
            hiddenColumns={props.hiddenColumns}
            indexColumn={{
              // If we want to leftAlign the New Row Button, we do not want to have the cell span 2 columns
              // because then the New Row Button will be centered horizontally between two cells and not
              // aligned with the Index cells in the grid--data.
              colSpan: (params: Table.ColSpanParams<R, M>) =>
                props.hasExpandColumn && !(props.leftAlignNewRowButton === true) ? 2 : 1
            }}
          />
        ) : (
          <></>
        )
      }
    >
      <React.Fragment>
        <ReadOnlyMenu<R, M>
          {...props}
          apis={props.tableApis.get("data")}
          actions={props.actions}
          search={props.search}
          columns={props.columns}
          menuPortalId={props.menuPortalId}
          hiddenColumns={props.hiddenColumns}
          onSearch={props.onSearch}
        />
        {props.children({
          apis: props.tableApis.get("data"),
          hiddenColumns: props.hiddenColumns,
          columns: props.columns,
          gridOptions: props.tableGridOptions.data,
          onGridReady: props.onDataGridReady,
          onFirstDataRendered: props.onFirstDataRendered,
          hasExpandColumn: props.hasExpandColumn
        })}
        <TableFooterGrid
          onGridReady={props.onFooterGridReady}
          onFirstDataRendered={props.onFirstDataRendered}
          gridOptions={props.tableGridOptions.footer}
          columns={props.columns}
          hiddenColumns={props.hiddenColumns}
        />
      </React.Fragment>
    </TableWrapper>
  );
};

export default configureTable(ReadOnlyTable);
