import React, { useImperativeHandle, useState, useMemo, useRef } from "react";
import { forEach, isNil, uniq, map, filter, includes, reduce } from "lodash";
import { Subtract } from "utility-types";

import { tabling, util, hooks, notifications } from "lib";

import { TableNotifications } from "components/notifications";
import { useConfirmation } from "components/notifications/hooks";
import { AuthenticatedGrid } from "tabling/generic";

import * as genericColumns from "../columns";
import { AuthenticatedGridProps, AuthenticatedDataGrid } from "../grids";
import { AuthenticatedMenu } from "../menus";
import {
  FooterGrid,
  AuthenticatedFooterGridProps,
  TableConfigurationProps,
  ConfiguredTableInjectedProps,
  ConnectAuthenticatedTableProps,
  AuthenticateDataGridProps,
  DataGridProps,
  ConnectedAuthenticatedTableInjectedProps,
  InternalAuthenticateDataGridProps,
  configureTable
} from "../hocs";
import TableWrapper from "./TableWrapper";

export type AuthenticatedTableDataGridProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel
> = InternalAuthenticateDataGridProps<R, M> & DataGridProps<R, M> & Omit<AuthenticatedGridProps<R, M>, "id">;

export type BaseTableProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel
> = TableConfigurationProps<R, M> &
  DataGridProps<R, M> & {
    readonly minimal?: boolean;
    readonly rowHeight?: number;
    readonly menuPortalId?: string;
    readonly showPageFooter?: boolean;
    readonly constrainTableFooterHorizontally?: boolean;
    readonly constrainPageFooterHorizontally?: boolean;
    readonly excludeColumns?:
      | SingleOrArray<string | ((col: Table.DataColumn<R, M>) => boolean)>
      | ((col: Table.DataColumn<R, M>) => boolean);
  };

export type AuthenticatedTableProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>
> = BaseTableProps<R, M> &
  Omit<AuthenticateDataGridProps<R, M>, "apis"> &
  Omit<ConnectAuthenticatedTableProps<R, M, S>, "actionContext"> &
  ConnectedAuthenticatedTableInjectedProps<R, M> & {
    readonly hasDragColumn?: boolean;
    readonly checkboxColumn?: Table.PartialActionColumn<R, M>;
    readonly checkboxColumnWidth?: number;
    readonly savingChangesPortalId?: string;
    readonly actions?: Table.AuthenticatedMenuActions<R, M>;
    readonly confirmRowDelete?: boolean;
    readonly localizePopupParent?: boolean;
    readonly rowHasCheckboxSelection?: (row: Table.EditableRow<R>) => boolean;
  };

type _AuthenticatedTableProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>
> = AuthenticatedTableProps<R, M, S> & ConfiguredTableInjectedProps;

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const TableFooterGrid = FooterGrid<any, any, AuthenticatedFooterGridProps<any, any>>({
  id: "footer",
  className: "grid--table-footer",
  rowClass: "row--table-footer",
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  getFooterColumn: (col: Table.DataColumn<any, any, any>) => col.footer || null
})(AuthenticatedGrid) as {
  <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(
    props: Omit<AuthenticatedFooterGridProps<R, M>, "id">
  ): JSX.Element;
};

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const PageFooterGrid = FooterGrid<any, any, AuthenticatedFooterGridProps<any, any>>({
  id: "page",
  className: "grid--page-footer",
  rowClass: "row--page-footer",
  rowHeight: 28,
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  getFooterColumn: (col: Table.DataColumn<any, any, any>) => col.page || null
})(AuthenticatedGrid) as {
  <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(
    props: Omit<AuthenticatedFooterGridProps<R, M>, "id">
  ): JSX.Element;
};

const AuthenticatedTable = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>
>(
  props: _AuthenticatedTableProps<R, M, S>
): JSX.Element => {
  const grid = tabling.hooks.useDataGrid();
  const [savingVisible, setSavingVisible] = useState(false);
  const [saving, _setSaving] = useState(false);
  /* After any changes finish saving, we display "Changes Saved" for a short
     duration before hiding the component.  We need to keep track of the timeout
     that is used to hide the component after the delay such that if additional
     changes start saving before the timeout delay finishes, the original timeout
     can be cancelled. */
  const hideSavingChangesTimout = useRef<NodeJS.Timeout | null>(null);
  const [selectedRows, setSelectedRows] = useState<Table.EditableRow<R>[]>([]);

  const NotificationsHandler = notifications.ui.useNotificationsManager({
    defaultBehavior: "append",
    defaultClosable: true
  });

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
    let cs = [
      genericColumns.CheckboxColumn<R, M>(
        { ...props.checkboxColumn, pinned: props.pinFirstColumn || props.pinActionColumns ? "left" : undefined },
        props.hasEditColumn,
        props.checkboxColumnWidth
      ),
      ...map(
        filter(
          props.columns,
          (c: Table.Column<R, M>) =>
            (tabling.columns.isDataColumn(c) && !evaluateColumnExclusionProp(c)) || !tabling.columns.isDataColumn(c)
        ),
        (c: Table.Column<R, M>) =>
          tabling.columns.isRealColumn(c)
            ? ({
                ...c,
                cellRendererParams: {
                  ...c.cellRendererParams,
                  selector: props.selector,
                  footerRowSelectors: props.footerRowSelectors
                },
                cellEditorParams: { ...c.cellEditorParams, selector: props.selector }
              } as Table.RealColumn<R, M>)
            : c
      )
    ];
    if (props.hasDragColumn !== false) {
      cs = [
        genericColumns.DragColumn<R, M>({
          pinned: props.pinFirstColumn || props.pinActionColumns ? "left" : undefined
        }),
        ...cs
      ];
    }
    return map(cs, (c: Table.Column<R, M>) => ({
      ...c,
      cellRendererParams: { ...c.cellRendererParams, table: props.table.current }
    }));
  }, [hooks.useDeepEqualMemo(props.columns), props.selector, props.excludeColumns, props.table.current]);

  /**
   * Modified version of the onEvent callback passed into the Grid.  The
   * modified version of the callback will first fire the original callback,
   * but then inspect whether or not the column associated with any of the fields
   * that were changed warrant refreshing another column.
   */
  const _onEvent = useMemo(
    () => (event: Table.Event<R, M>) => {
      const apis: Table.GridApis | null = props.tableApis.get("data");

      // TODO: We might have to also apply similiar logic for when a row is added?
      if (tabling.events.isChangeEvent(event) && tabling.events.isDataChangeEvent(event)) {
        const nodesToRefresh: Table.RowNode[] = [];
        let columnsToRefresh: string[] = [];

        const changes: Table.RowChange<R>[] = tabling.events.consolidateRowChanges(event.payload);

        forEach(changes, (rowChange: Table.RowChange<R>) => {
          const node = apis?.grid.getRowNode(String(rowChange.id));
          if (!isNil(node)) {
            let hasColumnsToRefresh = false;

            let field: keyof Table.EditableRow<R>["data"];
            for (field in rowChange.data) {
              /* If the field in the RowChangeData is a parsedField, it does not
                 correspond to an RealColumn, but a FakeColumn (since the field
                 is not displayed, just used to derive the values of other
                 columns).  In this case, we cannot apply the logic below. */
              const parsedFields = reduce(
                tabling.columns.filterBodyColumns(props.columns),
                (curr: string[], c: Table.BodyColumn<R, M>) => [...curr, ...(c.parsedFields || [])],
                []
              );
              if (!includes(parsedFields, field)) {
                const change = util.getKeyValue<Table.RowChangeData<R>, keyof Table.EditableRow<R>["data"]>(field)(
                  rowChange.data
                ) as Table.CellChange;
                const col: Table.Column<R, M> | null = tabling.columns.getColumn(props.columns, field);
                if (!isNil(col) && tabling.columns.isBodyColumn<R, M>(col)) {
                  /* Check if the cellChange is associated with a Column that has
										 it's own change event handler. */
                  if (tabling.rows.isModelRowId(rowChange.id)) {
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
            columns: columnsToRefresh
          });
        }
      }

      /* Wait until the end to trigger the onEvent.  The onEvent
				 handler is synchronous, and if we execute before hand the callbacks
				 will not be able to access the previous state of a given row because it
				 will already have been changed. */
      props.onEvent(event);
    },
    [props.onEvent, hooks.useDeepEqualMemo(props.columns)]
  );

  const setSaving = useMemo(
    () => (value: boolean) => {
      if (value === true) {
        /* Set the saving state to True before setting visibility to True so the
           <SavingChanges> component first appears in the "Saving Changes" state
           without a flash. */
        _setSaving(true);
        setSavingVisible(true);
        /* If changes start saving and there is already a timeout set that is
           instructed to hide the <SavingChanges> component after a delay, we
					 need to cancel it, since the new "Saving Changes" should be visible
					 for the remainder of the saving time and the previously set timeout
					 will hide it while changes are potentially still saving. */
        if (!isNil(hideSavingChangesTimout.current)) {
          clearTimeout(hideSavingChangesTimout.current);
        }
      } else {
        /* Set a timeout that will hide the <SavingChanges> component (which will
           now be in the "Changes Saved" state) after a delay of 2 seconds. */
        const timeout = setTimeout(() => {
          setSavingVisible(false);
        }, 2000);
        hideSavingChangesTimout.current = timeout;
        _setSaving(false);
      }
    },
    [saving, hideSavingChangesTimout.current]
  );

  const [confirmModal, confirmRowDelete] = useConfirmation<[Table.EditableRow<R>[]]>({
    okButtonClass: "btn--danger",
    okText: "Delete",
    suppressionKey: "delete-row-confirmation-suppressed",
    detail: "This action is not recoverable, the data will be permanently erased.",
    title: "Delete Rows",
    onConfirmed: (rows: Table.EditableRow<R>[]) =>
      props.onEvent({
        payload: { rows: map(rows, (r: Table.EditableRow<R>) => r.id) },
        type: "rowDelete"
      })
  });

  const actions = useMemo<Table.AuthenticatedMenuActions<R, M>>(
    (): Table.AuthenticatedMenuActions<R, M> =>
      tabling.menu.combineMenuActions<Table.AuthenticatedMenuActionParams<R, M>, R, M>(
        () => [
          {
            index: 0,
            icon: "trash-alt",
            disabled: selectedRows.length === 0,
            isWriteOnly: true,
            onClick: () => {
              const apis: Table.GridApis | null = props.tableApis.get("data");
              const rows = filter((apis?.grid.getSelectedRows() || []) as Table.BodyRow<R>[], (r: Table.BodyRow<R>) =>
                tabling.rows.isEditableRow(r)
              ) as Table.EditableRow<R>[];
              if (rows.length !== 0) {
                confirmRowDelete([rows], `You are about to delete ${rows.length} rows.`);
              }
            }
          }
        ],
        !isNil(props.actions) ? props.actions : []
      ),
    [props.actions, props.tableApis, selectedRows.length]
  );

  useImperativeHandle(props.table, () => {
    return {
      ...grid.current,
      ...NotificationsHandler,
      saving: (v: boolean) => {
        setSaving(v);
      },
      changeColumnVisibility: props.changeColumnVisibility,
      getColumns: () => tabling.columns.filterModelColumns(columns),
      dispatchEvent: (event: SingleOrArray<Table.Event<R, M>>) =>
        Array.isArray(event) ? map(event, (e: Table.Event<R, M>) => _onEvent(e)) : _onEvent(event),
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
    };
  });

  const addNewRow = hooks.useDynamicCallback(() => {
    const dataGridApi = props.tableApis.get("data");
    if (!isNil(dataGridApi)) {
      _onEvent({
        type: "rowAdd",
        payload: { count: 1 },
        placeholderIds: [tabling.rows.placeholderRowId()]
      });
    }
  });

  const onRowSelectionChanged = hooks.useDynamicCallback((rows: Table.EditableRow<R>[]) => {
    setSelectedRows(rows);
  });

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
          apis={props.tableApis.get("page")}
          onGridReady={props.onPageGridReady}
          onFirstDataRendered={props.onFirstDataRendered}
          onEvent={_onEvent}
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
          saving={saving}
          savingVisible={savingVisible}
          apis={props.tableApis.get("data")}
          actions={actions}
          columns={tabling.columns.filterDataColumns(columns)}
          selectedRows={selectedRows}
          hasEditColumn={props.hasEditColumn}
          hasDragColumn={props.hasDragColumn === undefined ? true : props.hasDragColumn}
        />
        <AuthenticatedDataGrid
          {...props}
          apis={props.tableApis.get("data")}
          columns={columns}
          gridOptions={props.tableGridOptions.data}
          grid={grid}
          onGridReady={props.onDataGridReady}
          onRowSelectionChanged={onRowSelectionChanged}
          onEvent={_onEvent}
          rowHasCheckboxSelection={props.rowHasCheckboxSelection}
        />
        <TableNotifications
          notifications={NotificationsHandler.notifications}
          tableId={props.tableId}
          /* If there is no data in the table, we want to render the notification
             under the table - otherwise, it will be hard to read. */
          offset={props.data.length === 0 ? -10 : 30}
        />
        <TableFooterGrid
          tableId={props.tableId}
          apis={props.tableApis.get("footer")}
          onGridReady={props.onFooterGridReady}
          onFirstDataRendered={props.onFirstDataRendered}
          gridOptions={props.tableGridOptions.footer}
          columns={columns}
          hiddenColumns={props.hiddenColumns}
          onEvent={_onEvent}
          framework={props.framework}
          constrainHorizontally={props.constrainTableFooterHorizontally}
          checkboxColumn={{
            cellRenderer: "NewRowCell",
            cellRendererParams: {
              onNewRow: addNewRow
            }
          }}
        />
        {confirmModal}
      </React.Fragment>
    </TableWrapper>
  );
};

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export default configureTable<_AuthenticatedTableProps<any, any, any>, any, any>(AuthenticatedTable) as {
  <
    R extends Table.RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    S extends Redux.TableStore<R> = Redux.TableStore<R>
  >(
    props: Subtract<_AuthenticatedTableProps<R, M, S>, ConfiguredTableInjectedProps>
  ): JSX.Element;
};
