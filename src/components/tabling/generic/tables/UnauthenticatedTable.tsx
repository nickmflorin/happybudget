import React, { useImperativeHandle, useMemo } from "react";
import { map, isNil, filter, intersection } from "lodash";

import { hooks, tabling } from "lib";

import { UnauthenticatedGrid, UnauthenticatedGridProps } from "../grids";
import { UnauthenticatedMenu } from "../menus";
import {
  FooterGrid,
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
  <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(
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
  <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(
    props: Omit<UnauthenticatedGridProps<R, M>, "id" | "grid">
  ): JSX.Element;
};

/* eslint-disable indent */
const UnauthenticatedTable = <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(
  props: WithUnauthenticatedDataGridProps<
    R,
    WithConnectedTableProps<WithConfiguredTableProps<UnauthenticatedTableProps<R, M>, R>, R>
  >
): JSX.Element => {
  const grid = tabling.hooks.useDataGrid();
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
    ...grid.current,
    changeColumnVisibility: props.changeColumnVisibility,
    applyTableChange: (event: SingleOrArray<Table.ChangeEvent<R, M>>) => {},
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
      id={props.id}
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
        />
      }
    >
      <React.Fragment>
        <UnauthenticatedMenu<R, M> {...props} apis={props.tableApis.get("data")} />
        {props.children({
          ...props,
          apis: props.tableApis.get("data"),
          columns: columns,
          grid,
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

type Props = WithUnauthenticatedDataGridProps<
  any,
  WithConnectedTableProps<WithConfiguredTableProps<UnauthenticatedTableProps<any>, any>, any>
>;

const Memoized = React.memo(UnauthenticatedTable) as typeof UnauthenticatedTable;

export default configureTable<any, any, Props>(Memoized) as {
  <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(
    props: UnauthenticatedTableProps<R, M>
  ): JSX.Element;
};
