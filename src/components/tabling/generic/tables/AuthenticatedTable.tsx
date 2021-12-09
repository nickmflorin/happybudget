import React, { useImperativeHandle, useState, useMemo } from "react";
import { forEach, isNil, uniq, map, filter, intersection } from "lodash";

import { tabling, util, hooks } from "lib";
import { Config } from "config";
import { DeleteRowsModal } from "components/modals";
import { AuthenticatedGrid } from "components/tabling/generic";

import { AuthenticatedGridProps } from "../grids";
import { AuthenticatedMenu } from "../menus";
import {
  FooterGrid,
  AuthenticatedFooterGridProps,
  TableConfigurationProps,
  WithConfiguredTableProps,
  WithAuthenticatedDataGridProps,
  WithConnectedTableProps,
  AuthenticateDataGridProps,
  DataGridProps,
  configureTable
} from "../hocs";
import TableWrapper from "./TableWrapper";

export type AuthenticatedTableDataGridProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel
> = AuthenticateDataGridProps<R, M> & DataGridProps<R, M> & Omit<AuthenticatedGridProps<R, M>, "id">;

export type AuthenticatedTableProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel
> = TableConfigurationProps<R, M> &
  Omit<
    AuthenticateDataGridProps<R, M>,
    "onChangeEvent" | "columns" | "data" | "apis" | "onRowSelectionChanged" | "rowHasCheckboxSelection" | "grid"
  > & {
    readonly table?: NonNullRef<Table.TableInstance<R, M>>;
    readonly actions?: Table.AuthenticatedMenuActions<R, M>;
    readonly constrainTableFooterHorizontally?: boolean;
    readonly constrainPageFooterHorizontally?: boolean;
    readonly excludeColumns?:
      | SingleOrArray<keyof R | string | ((col: Table.Column<R, M>) => boolean)>
      | ((col: Table.Column<R, M>) => boolean);
    readonly confirmRowDelete?: boolean;
    readonly children: RenderPropChild<AuthenticatedTableDataGridProps<R, M>>;
    readonly rowHasCheckboxSelection?: (row: Table.EditableRow<R>) => boolean;
  };

const TableFooterGrid = FooterGrid<any, any, AuthenticatedFooterGridProps<any, any>>({
  id: "footer",
  className: "grid--table-footer",
  rowClass: "row--table-footer",
  getFooterColumn: (col: Table.Column<any>) => col.footer || null
})(AuthenticatedGrid) as {
  <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(
    props: Omit<AuthenticatedFooterGridProps<R, M>, "id">
  ): JSX.Element;
};

const PageFooterGrid = FooterGrid<any, any, AuthenticatedFooterGridProps<any, any>>({
  id: "page",
  className: "grid--page-footer",
  rowClass: "row--page-footer",
  rowHeight: 28,
  getFooterColumn: (col: Table.Column<any>) => col.page || null
})(AuthenticatedGrid) as {
  <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(
    props: Omit<AuthenticatedFooterGridProps<R, M>, "id">
  ): JSX.Element;
};

/* eslint-disable indent */
const AuthenticatedTable = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>
>(
  props: WithAuthenticatedDataGridProps<
    R,
    WithConnectedTableProps<WithConfiguredTableProps<AuthenticatedTableProps<R, M>, R>, R, M, S>
  >
): JSX.Element => {
  const grid = tabling.hooks.useDataGrid();
  const [selectedRows, setSelectedRows] = useState<Table.EditableRow<R>[]>([]);
  const [deleteRows, setDeleteRows] = useState<Table.EditableRow<R>[] | undefined>(undefined);

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
    const evaluateColumnExclusionProp = (c: Table.Column<R, M>): boolean => {
      if (!isNil(props.excludeColumns)) {
        if (typeof props.excludeColumns === "function") {
          return props.excludeColumns(c);
        }
        return (
          intersection(Array.isArray(props.excludeColumns) ? props.excludeColumns : [props.excludeColumns], [
            c.field,
            c.colId
          ]).length !== 0
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
  const _onChangeEvent = useMemo(
    () => (event: Table.ChangeEvent<R, M>) => {
      const apis: Table.GridApis | null = props.tableApis.get("data");

      // TODO: We might have to also apply similiar logic for when a row is added?
      if (tabling.typeguards.isDataChangeEvent(event)) {
        let nodesToRefresh: Table.RowNode[] = [];
        let columnsToRefresh: (keyof R)[] = [];

        const changes: Table.RowChange<R>[] = tabling.events.consolidateRowChanges(event.payload);

        forEach(changes, (rowChange: Table.RowChange<R>) => {
          const node = apis?.grid.getRowNode(String(rowChange.id));
          if (!isNil(node)) {
            let hasColumnsToRefresh = false;

            let field: keyof R;
            for (field in rowChange.data) {
              const change = util.getKeyValue<Table.RowChangeData<R>, keyof R>(field)(
                rowChange.data
              ) as Table.CellChange<R>;
              const col: Table.Column<R, M> | null = tabling.columns.getColumn(props.columns, field);

              if (!isNil(col)) {
                /* Check if the cellChange is associated with a Column that has
									 it's own change event handler. */
                if (tabling.typeguards.isModelRowId(rowChange.id)) {
                  col.onDataChange?.(rowChange.id, change);
                }

                /* Check if the cellChange is associated with a Column that when
									 changed, should refresh other columns. */
                if (!isNil(col.refreshColumns)) {
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

      /* Wait until the end to trigger the onChangeEvent.  The onChangeEvent
				 handler is synchronous, and if we execute before hand the callbacks
				 will not be able to access the previous state of a given row because it
				 will already have been changed. */
      props.onChangeEvent(event);
    },
    [props.onChangeEvent, hooks.useDeepEqualMemo(props.columns)]
  );

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
                const rows = filter((apis?.grid.getSelectedRows() || []) as Table.BodyRow<R>[], (r: Table.BodyRow<R>) =>
                  tabling.typeguards.isEditableRow(r)
                ) as Table.EditableRow<R>[];
                if (rows.length === 1 || props.confirmRowDelete === false) {
                  props.onChangeEvent({
                    payload: { rows: map(rows, (r: Table.EditableRow<R>) => r.id) },
                    type: "rowDelete"
                  });
                } else if (rows.length !== 0) {
                  setDeleteRows(rows);
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
    ...grid.current,
    changeColumnVisibility: props.changeColumnVisibility,
    applyTableChange: (event: SingleOrArray<Table.ChangeEvent<R, M>>) =>
      Array.isArray(event) ? map(event, (e: Table.ChangeEvent<R, M>) => _onChangeEvent(e)) : _onChangeEvent(event),
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
  }));

  const addNewRow = hooks.useDynamicCallback(() => {
    const dataGridApi = props.tableApis.get("data");
    if (!isNil(dataGridApi)) {
      _onChangeEvent({
        type: "rowAdd",
        payload: { count: 1 },
        placeholderIds: [tabling.managers.placeholderRowId()]
      });
    }
  });

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
          tableId={props.id}
          apis={props.tableApis.get("page")}
          onGridReady={props.onPageGridReady}
          onFirstDataRendered={props.onFirstDataRendered}
          onChangeEvent={_onChangeEvent}
          footerRowSelectors={props.footerRowSelectors}
          gridOptions={props.tableGridOptions.page}
          columns={columns}
          framework={props.framework}
          hiddenColumns={props.hiddenColumns}
          constrainHorizontally={props.constrainPageFooterHorizontally}
        />
      }
    >
      <React.Fragment>
        <AuthenticatedMenu<R, M>
          {...props}
          apis={props.tableApis.get("data")}
          actions={actions}
          selectedRows={selectedRows}
          hasEditColumn={props.hasEditColumn}
          hasDragColumn={
            props.hasDragColumn === undefined
              ? Config.tableRowOrdering
              : props.hasDragColumn && Config.tableRowOrdering === true
          }
        />
        {props.children({
          ...props,
          tableId: props.id,
          apis: props.tableApis.get("data"),
          columns: columns,
          gridOptions: props.tableGridOptions.data,
          grid,
          onGridReady: props.onDataGridReady,
          onRowSelectionChanged: (rows: Table.EditableRow<R>[]) => setSelectedRows(rows),
          onChangeEvent: _onChangeEvent,
          rowHasCheckboxSelection: props.rowHasCheckboxSelection
        })}
        <TableFooterGrid
          tableId={props.id}
          apis={props.tableApis.get("footer")}
          onGridReady={props.onFooterGridReady}
          onFirstDataRendered={props.onFirstDataRendered}
          gridOptions={props.tableGridOptions.footer}
          columns={columns}
          hiddenColumns={props.hiddenColumns}
          onChangeEvent={_onChangeEvent}
          framework={props.framework}
          footerRowSelectors={props.footerRowSelectors}
          constrainHorizontally={props.constrainTableFooterHorizontally}
          checkboxColumn={{
            cellRenderer: "NewRowCell",
            cellRendererParams: {
              onNewRow: addNewRow
            }
          }}
        />
        {!isNil(deleteRows) && (
          <DeleteRowsModal
            open={true}
            onCancel={() => setDeleteRows(undefined)}
            onOk={() => {
              props.onChangeEvent({
                payload: { rows: map(deleteRows, (r: Table.EditableRow<R>) => r.id) },
                type: "rowDelete"
              });
              setDeleteRows(undefined);
            }}
            rows={deleteRows}
          />
        )}
      </React.Fragment>
    </TableWrapper>
  );
};

type Props = WithAuthenticatedDataGridProps<
  any,
  WithConnectedTableProps<WithConfiguredTableProps<AuthenticatedTableProps<any>, any>, any>
>;

const Memoized = React.memo(AuthenticatedTable) as typeof AuthenticatedTable;

export default configureTable<any, any, Props>(Memoized) as {
  <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(
    props: AuthenticatedTableProps<R, M>
  ): JSX.Element;
};
