import React, { useImperativeHandle, useMemo } from "react";
import { map, isNil, filter, includes } from "lodash";

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
> = UnauthenticateDataGridProps<R, M, G> & DataGridProps<R, M, G> & Omit<UnauthenticatedGridProps<R, M, G>, "id">;

export type UnauthenticatedTableProps<
  R extends Table.RowData,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group
> = TableConfigurationProps<R, M, G> & {
  readonly table?: NonNullRef<Table.TableInstance<R, M, G>>;
  readonly actions?: Table.UnauthenticatedMenuActions<R, M, G>;
  readonly excludeColumns?: SingleOrArray<keyof R> | ((col: Table.Column<R, M, G>) => boolean);
  readonly children: RenderPropChild<UnauthenticatedTableDataGridProps<R, M, G>>;
};

const TableFooterGrid = FooterGrid<any, any, any, UnauthenticatedGridProps<any>>({
  rowId: "footer-row",
  id: "footer",
  className: "grid--table-footer",
  rowClass: "row--table-footer",
  getFooterColumn: (col: Table.Column<any, any, any>) => col.footer || null
})(UnauthenticatedGrid) as {
  <R extends Table.RowData, M extends Model.Model = Model.Model, G extends Model.Group = Model.Group>(
    props: Omit<UnauthenticatedGridProps<R, M, G>, "id">
  ): JSX.Element;
};

const PageFooterGrid = FooterGrid<any, any, any, UnauthenticatedGridProps<any>>({
  rowId: "page-row",
  id: "page",
  className: "grid--page-footer",
  rowClass: "row--page-footer",
  rowHeight: 28,
  getFooterColumn: (col: Table.Column<any, any, any>) => col.page || null
})(UnauthenticatedGrid) as {
  <R extends Table.RowData, M extends Model.Model = Model.Model, G extends Model.Group = Model.Group>(
    props: Omit<UnauthenticatedGridProps<R, M, G>, "id">
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
  const columns = useMemo<Table.Column<R, M, G>[]>((): Table.Column<R, M, G>[] => {
    const evaluateColumnExclusionProp = (c: Table.Column<R, M, G>): boolean => {
      if (c.requiresAuthentication === true) {
        return true;
      }
      if (!isNil(props.excludeColumns)) {
        if (typeof props.excludeColumns === "function") {
          return props.excludeColumns(c);
        }
        return includes(Array.isArray(props.excludeColumns) ? props.excludeColumns : [props.excludeColumns], c.field);
      }
      return false;
    };
    return map(
      filter(props.columns, (c: Table.Column<R, M, G>) => !evaluateColumnExclusionProp(c)),
      (c: Table.Column<R, M, G>) => ({
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

  useImperativeHandle(props.table, () => ({
    getCSVData: props.getCSVData,
    changeColumnVisibility: props.changeColumnVisibility,
    applyTableChange: (event: Table.ChangeEvent<R, M>) => {},
    applyGroupColorChange: (group: Model.Group) => {
      const apis = props.tableApis.get("data");
      if (!isNil(apis)) {
        const node: Table.RowNode | undefined = apis.grid.getRowNode(`group-${group.id}`);
        if (!isNil(node)) {
          apis.grid.redrawRows({ rowNodes: [node] });
        }
      }
    }
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
            colSpan: (params: Table.ColSpanParams<R, M, G>) =>
              props.hasExpandColumn && !(props.leftAlignNewRowButton === true) ? 2 : 1
          }}
        />
      }
    >
      <React.Fragment>
        <UnauthenticatedMenu<R, M, G> {...props} apis={props.tableApis.get("data")} />
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

export default configureTable<any, any, any, Props>(UnauthenticatedTable) as {
  <R extends Table.RowData, M extends Model.Model = Model.Model, G extends Model.Group = Model.Group>(
    props: UnauthenticatedTableProps<R, M, G>
  ): JSX.Element;
};
