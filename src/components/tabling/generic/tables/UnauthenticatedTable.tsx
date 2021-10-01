import React, { useImperativeHandle, useMemo } from "react";
import { map, isNil, filter, intersection } from "lodash";

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
  M extends Model.TypedHttpModel = Model.TypedHttpModel
> = UnauthenticateDataGridProps<R, M> & DataGridProps<R, M> & Omit<UnauthenticatedGridProps<R, M>, "id">;

export type UnauthenticatedTableProps<
  R extends Table.RowData,
  M extends Model.TypedHttpModel = Model.TypedHttpModel
> = TableConfigurationProps<R, M> & {
  readonly table?: NonNullRef<Table.TableInstance<R>>;
  readonly actions?: Table.UnauthenticatedMenuActions<R, M>;
  readonly excludeColumns?:
    | SingleOrArray<keyof R | string | ((col: Table.Column<R, M>) => boolean)>
    | ((col: Table.Column<R, M>) => boolean);
  readonly children: RenderPropChild<UnauthenticatedTableDataGridProps<R, M>>;
};

const TableFooterGrid = FooterGrid<any, any, UnauthenticatedGridProps<any>>({
  id: "footer",
  className: "grid--table-footer",
  rowClass: "row--table-footer",
  getFooterColumn: (col: Table.Column<any, any, any>) => col.footer || null
})(UnauthenticatedGrid) as {
  <R extends Table.RowData, M extends Model.TypedHttpModel = Model.TypedHttpModel>(
    props: Omit<UnauthenticatedGridProps<R, M>, "id">
  ): JSX.Element;
};

const PageFooterGrid = FooterGrid<any, any, UnauthenticatedGridProps<any>>({
  id: "page",
  className: "grid--page-footer",
  rowClass: "row--page-footer",
  rowHeight: 28,
  getFooterColumn: (col: Table.Column<any, any, any>) => col.page || null
})(UnauthenticatedGrid) as {
  <R extends Table.RowData, M extends Model.TypedHttpModel = Model.TypedHttpModel>(
    props: Omit<UnauthenticatedGridProps<R, M>, "id">
  ): JSX.Element;
};

/* eslint-disable indent */
const UnauthenticatedTable = <R extends Table.RowData, M extends Model.TypedHttpModel = Model.TypedHttpModel>(
  props: WithConnectedTableProps<WithConfiguredTableProps<UnauthenticatedTableProps<R, M>, R>, R, M>
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
    const evaluateColumnExclusionProp = (c: Table.Column<R, M>): boolean => {
      if (!isNil(props.excludeColumns)) {
        if (typeof props.excludeColumns === "function") {
          return props.excludeColumns(c);
        }
        return (
          intersection(Array.isArray(props.excludeColumns) ? props.excludeColumns : [props.excludeColumns], [
            c.field,
            c.colId
          ]).length === 0
        );
      }
      return false;
    };
    return map(
      filter(props.columns, (c: Table.Column<R, M>) => !evaluateColumnExclusionProp(c)),
      (c: Table.Column<R, M>) => ({
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
    applyTableChange: (event: SingleOrArray<Table.ChangeEvent<R>>) => {},
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
    },
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
            colSpan: (params: Table.ColSpanParams<R, M>) =>
              props.hasExpandColumn && !(props.leftAlignNewRowButton === true) ? 2 : 1
          }}
        />
      }
    >
      <React.Fragment>
        <UnauthenticatedMenu<R, M> {...props} apis={props.tableApis.get("data")} />
        {props.children({
          ...props,
          apis: props.tableApis.get("data"),
          columns: columns,
          gridOptions: props.tableGridOptions.data,
          onGridReady: props.onDataGridReady
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
  <R extends Table.RowData, M extends Model.TypedHttpModel = Model.TypedHttpModel>(
    props: UnauthenticatedTableProps<R, M>
  ): JSX.Element;
};
