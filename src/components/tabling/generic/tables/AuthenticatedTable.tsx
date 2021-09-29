import React, { useImperativeHandle, useState, useMemo } from "react";
import { forEach, isNil, find, uniq, map, filter, intersection } from "lodash";

import { tabling, util, hooks } from "lib";
import { AuthenticatedGrid } from "components/tabling/generic";

import { AuthenticatedGridProps } from "../grids";
import { AuthenticatedMenu } from "../menus";
import {
  FooterGrid,
  TableConfigurationProps,
  WithConfiguredTableProps,
  WithConnectedTableProps,
  AuthenticateDataGridProps,
  DataGridProps,
  configureTable
} from "../hocs";
import TableWrapper from "./TableWrapper";

export type AuthenticatedTableDataGridProps<
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel
> = AuthenticateDataGridProps<R, M> & DataGridProps<R, M> & Omit<AuthenticatedGridProps<R, M>, "id">;

export type AuthenticatedTableProps<
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel
> = TableConfigurationProps<R, M> &
  Omit<
    AuthenticateDataGridProps<R, M>,
    "onChangeEvent" | "columns" | "data" | "apis" | "onRowSelectionChanged" | "rowHasCheckboxSelection"
  > & {
    readonly table?: NonNullRef<Table.TableInstance<R, M>>;
    readonly actions?: Table.AuthenticatedMenuActions<R, M>;
    readonly excludeColumns?:
      | SingleOrArray<keyof R | string | ((col: Table.Column<R, M>) => boolean)>
      | ((col: Table.Column<R, M>) => boolean);
    readonly children: RenderPropChild<AuthenticatedTableDataGridProps<R, M>>;
    readonly rowHasCheckboxSelection?: (row: Table.NonGroupRow<R, M>) => boolean;
  };

const TableFooterGrid = FooterGrid<any, any, AuthenticatedGridProps<any, any>>({
  rowId: "footer-row",
  id: "footer",
  className: "grid--table-footer",
  rowClass: "row--table-footer",
  getFooterColumn: (col: Table.Column<any>) => col.footer || null
})(AuthenticatedGrid) as {
  <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel>(
    props: Omit<AuthenticatedGridProps<R, M>, "id">
  ): JSX.Element;
};

const PageFooterGrid = FooterGrid<any, any, AuthenticatedGridProps<any, any>>({
  rowId: "page-row",
  id: "page",
  className: "grid--page-footer",
  rowClass: "row--page-footer",
  rowHeight: 28,
  getFooterColumn: (col: Table.Column<any>) => col.page || null
})(AuthenticatedGrid) as {
  <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel>(
    props: Omit<AuthenticatedGridProps<R, M>, "id">
  ): JSX.Element;
};

/* eslint-disable indent */
const AuthenticatedTable = <
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
  S extends Redux.TableStore<R, M> = Redux.TableStore<R, M>
>(
  props: WithConnectedTableProps<WithConfiguredTableProps<AuthenticatedTableProps<R, M>, R>, R, M, S>
): JSX.Element => {
  const [selectedRows, setSelectedRows] = useState<Table.DataRow<R, M>[]>([]);

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

  /**
   * Modified version of the onChangeEvent callback passed into the Grid.  The
   * modified version of the callback will first fire the original callback,
   * but then inspect whether or not the column associated with any of the fields
   * that were changed warrant refreshing another column.
   */
  const _onChangeEvent = (event: Table.ChangeEvent<R, M>) => {
    props.onChangeEvent(event);

    const apis: Table.GridApis | null = props.tableApis.get("data");

    // TODO: We might have to also apply similiar logic for when a row is added?
    if (tabling.typeguards.isDataChangeEvent(event)) {
      let nodesToRefresh: Table.RowNode[] = [];
      let columnsToRefresh: (keyof R)[] = [];

      const changes: Table.RowChange<R, M>[] = tabling.events.consolidateTableChange(event.payload);

      // Look at the changes for each row and determine if the field changed is
      // associated with a column that refreshes other columns.
      forEach(changes, (rowChange: Table.RowChange<R, M>) => {
        const node = apis?.grid.getRowNode(String(rowChange.id));
        if (!isNil(node)) {
          let hasColumnsToRefresh = false;

          let field: keyof R;
          for (field in rowChange.data) {
            const change = util.getKeyValue<Table.RowChangeData<R>, keyof R>(field)(
              rowChange.data
            ) as Table.CellChange<R>;
            // Check if the cellChange is associated with a Column that when changed,
            // should refresh other columns.
            const col: Table.Column<R, M> | undefined = find(columns, { field } as any);
            if (!isNil(col) && !isNil(col.refreshColumns)) {
              const fieldsToRefresh = col.refreshColumns(change);
              if (!isNil(fieldsToRefresh) && (!Array.isArray(fieldsToRefresh) || fieldsToRefresh.length !== 0)) {
                hasColumnsToRefresh = true;
                columnsToRefresh = uniq([
                  ...columnsToRefresh,
                  ...(Array.isArray(fieldsToRefresh) ? fieldsToRefresh : [fieldsToRefresh])
                ]);
              }
            }
          }
          if (hasColumnsToRefresh === true) {
            nodesToRefresh.push(node);
          }
        }
      });
      if (columnsToRefresh.length !== 0) {
        apis?.grid.refreshCells({
          force: true,
          rowNodes: nodesToRefresh,
          columns: columnsToRefresh as string[]
        });
      }
    }
  };

  const actions = useMemo<Table.AuthenticatedMenuActions<R, M>>(
    (): Table.AuthenticatedMenuActions<R, M> =>
      tabling.menu.combineMenuActions<Table.AuthenticatedMenuActionParams<R, M>, R, M>(
        (params: Table.AuthenticatedMenuActionParams<R, M>) => {
          return [
            {
              index: 0,
              icon: "trash-alt",
              disabled: params.selectedRows.length === 0,
              isWriteOnly: true,
              onClick: () => {
                const apis: Table.GridApis | null = props.tableApis.get("data");
                const rows = filter((apis?.grid.getSelectedRows() || []) as Table.Row<R, M>[], (r: Table.Row<R, M>) =>
                  tabling.typeguards.isEditableRow(r)
                ) as Table.EditableRow<R, M>[];
                if (rows.length !== 0) {
                  props.onChangeEvent({
                    payload: { rows: map(rows, (r: Table.EditableRow<R, M>) => r.id) },
                    type: "rowDelete"
                  });
                }
              }
            }
          ];
        },
        !isNil(props.actions) ? props.actions : []
      ),
    [props.actions, props.tableApis]
  );

  useImperativeHandle(props.table, () => ({
    getCSVData: props.getCSVData,
    changeColumnVisibility: props.changeColumnVisibility,
    applyTableChange: _onChangeEvent,
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
            const row: Table.Row<R, M> = nd.data;
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
            const row: Table.Row<R, M> = node.data;
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
          apis={props.tableApis.get("page")}
          onGridReady={props.onPageGridReady}
          onFirstDataRendered={props.onFirstDataRendered}
          onChangeEvent={_onChangeEvent}
          footerRowSelectors={props.footerRowSelectors}
          gridOptions={props.tableGridOptions.page}
          columns={columns}
          framework={props.framework}
          hiddenColumns={props.hiddenColumns}
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
        <AuthenticatedMenu<R, M>
          {...props}
          apis={props.tableApis.get("data")}
          actions={actions}
          selectedRows={selectedRows}
        />
        {props.children({
          ...props,
          apis: props.tableApis.get("data"),
          columns: columns,
          gridOptions: props.tableGridOptions.data,
          onGridReady: props.onDataGridReady,
          onRowSelectionChanged: (rows: Table.DataRow<R, M>[]) => setSelectedRows(rows),
          onChangeEvent: _onChangeEvent,
          rowHasCheckboxSelection: props.rowHasCheckboxSelection
        })}
        <TableFooterGrid
          apis={props.tableApis.get("footer")}
          onGridReady={props.onFooterGridReady}
          onFirstDataRendered={props.onFirstDataRendered}
          gridOptions={props.tableGridOptions.footer}
          columns={columns}
          hiddenColumns={props.hiddenColumns}
          onChangeEvent={_onChangeEvent}
          framework={props.framework}
          footerRowSelectors={props.footerRowSelectors}
          indexColumn={{
            cellRenderer: "NewRowCell",
            // If we want to leftAlign the New Row Button, we do not want to have the cell span 2 columns
            // because then the New Row Button will be centered horizontally between two cells and not
            // aligned with the Index cells in the grid--data.
            colSpan: (params: Table.ColSpanParams<R, M>) =>
              props.hasExpandColumn && !(props.leftAlignNewRowButton === true) ? 2 : 1,
            // The onChangeEvent callback is needed to dispatch the action to create a new row.
            cellRendererParams: {
              onChangeEvent: _onChangeEvent
            }
          }}
        />
      </React.Fragment>
    </TableWrapper>
  );
};

type Props = WithConnectedTableProps<WithConfiguredTableProps<AuthenticatedTableProps<any>, any>, any>;

export default configureTable<any, any, Props>(AuthenticatedTable) as {
  <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel>(
    props: AuthenticatedTableProps<R, M>
  ): JSX.Element;
};
