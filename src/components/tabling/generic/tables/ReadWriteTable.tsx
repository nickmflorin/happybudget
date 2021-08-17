import React, { useImperativeHandle, useState, useMemo } from "react";
import { forEach, isNil, find, uniq } from "lodash";
import { Subtract } from "utility-types";

import { tabling, util } from "lib";
import { ReadWriteGrid } from "components/tabling/generic";

import { ReadWriteGridProps } from "../grids";
import { ReadWriteMenu, ReadWriteMenuProps } from "../menus";
import { FooterGrid } from "../hocs";
import configureTable, { _InjectedTableProps, TableConfiguration } from "./configureTable";
import TableWrapper from "./TableWrapper";

type _ReadWriteTableProps<R extends Table.Row, M extends Model.Model> = ReadWriteMenuProps<R, M> &
  _InjectedTableProps<R, M> &
  TableConfiguration<R, M> & {
    readonly tableRef?: NonNullRef<Table.ReadWriteTableRefObj<R, M>>;
    readonly children: RenderPropChild<TableUi.ReadWriteDataGridRenderParams<R, M>>;
    readonly onChangeEvent: (event: Table.ChangeEvent<R, M>) => void;
    readonly rowHasCheckboxSelection?: (row: R) => boolean;
  };

export type ReadWriteTableProps<R extends Table.Row, M extends Model.Model> = Omit<
  Subtract<_ReadWriteTableProps<R, M>, _InjectedTableProps<R, M>>,
  "children"
>;

const TableFooterGrid = FooterGrid<ReadWriteGridProps>({
  rowId: "footer-row",
  id: "footer",
  className: "grid--table-footer",
  rowClass: "row--table-footer",
  getFooterColumn: (col: Table.Column<any, any>) => col.footer || null
})(ReadWriteGrid);

const PageFooterGrid = FooterGrid<ReadWriteGridProps>({
  rowId: "page-row",
  id: "page",
  className: "grid--page-footer",
  rowClass: "row--page-footer",
  rowHeight: 28,
  getFooterColumn: (col: Table.Column<any, any>) => col.page || null
})(ReadWriteGrid);

const ReadWriteTable = <R extends Table.Row, M extends Model.Model>(props: _ReadWriteTableProps<R, M>): JSX.Element => {
  const [selectedRows, setSelectedRows] = useState<R[]>([]);

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
      let columnsToRefresh: Table.Field<R, M>[] = [];

      const changes: Table.RowChange<R, M>[] = tabling.util.consolidateTableChange(event.payload);

      // Look at the changes for each row and determine if the field changed is
      // associated with a column that refreshes other columns.
      forEach(changes, (rowChange: Table.RowChange<R, M>) => {
        const node = apis?.grid.getRowNode(String(rowChange.id));
        if (!isNil(node)) {
          let hasColumnsToRefresh = false;
          for (let i = 0; i < Object.keys(rowChange.data).length; i++) {
            const field: Table.Field<R, M> = Object.keys(rowChange.data)[i];
            const change = util.getKeyValue<Table.RowChangeData<R, M>, Table.Field<R, M>>(field)(
              rowChange.data
            ) as Table.NestedCellChange<R, M>;
            // Check if the cellChange is associated with a Column that when changed,
            // should refresh other columns.
            const col: Table.Column<R, M> | undefined = find(props.columns, { field } as any);
            if (!isNil(col) && !isNil(col.refreshColumns)) {
              const fieldsToRefresh = col.refreshColumns({
                ...change,
                id: rowChange.id,
                field
              });
              if (!isNil(fieldsToRefresh) && fieldsToRefresh.length !== 0) {
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

  const actions = useMemo<Table.ReadWriteMenuActions<R, M>>(
    (): Table.ReadWriteMenuActions<R, M> =>
      tabling.util.combineMenuActions<Table.ReadWriteMenuActionParams<R, M>, R, M>(
        (params: Table.ReadWriteMenuActionParams<R, M>) => {
          return [
            {
              index: 0,
              icon: "trash-alt",
              disabled: params.selectedRows.length === 0,
              isWriteOnly: true,
              onClick: () => {
                const apis: Table.GridApis | null = props.tableApis.get("data");
                const rows: R[] = apis?.grid.getSelectedRows() || [];
                if (rows.length !== 0) {
                  props.onChangeEvent?.({
                    payload: { rows, columns: params.columns },
                    type: "rowDelete"
                  });
                }
              }
            }
          ];
        },
        !isNil(props.actions) ? props.actions : []
      ),
    [props.actions]
  );

  useImperativeHandle(props.tableRef, () => ({
    getCSVData: props.getCSVData,
    changeColumnVisibility: props.changeColumnVisibility,
    applyTableChange: _onChangeEvent
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
            apis={props.tableApis.get("page")}
            onGridReady={props.onPageGridReady}
            onFirstDataRendered={props.onFirstDataRendered}
            onChangeEvent={_onChangeEvent}
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
        <ReadWriteMenu<R, M>
          {...props}
          apis={props.tableApis.get("data")}
          actions={actions}
          search={props.search}
          columns={props.columns}
          menuPortalId={props.menuPortalId}
          hiddenColumns={props.hiddenColumns}
          selectedRows={selectedRows}
          onSearch={props.onSearch}
          rowHasCheckboxSelection={props.rowHasCheckboxSelection}
        />
        {props.children({
          apis: props.tableApis.get("data"),
          hiddenColumns: props.hiddenColumns,
          columns: props.columns,
          gridOptions: props.tableGridOptions.data,
          onGridReady: props.onDataGridReady,
          onFirstDataRendered: props.onFirstDataRendered,
          onRowSelectionChanged: (rows: R[]) => setSelectedRows(rows),
          hasExpandColumn: props.hasExpandColumn,
          onChangeEvent: _onChangeEvent,
          rowHasCheckboxSelection: props.rowHasCheckboxSelection
        })}
        <TableFooterGrid
          apis={props.tableApis.get("footer")}
          onGridReady={props.onFooterGridReady}
          onFirstDataRendered={props.onFirstDataRendered}
          gridOptions={props.tableGridOptions.footer}
          columns={props.columns}
          hiddenColumns={props.hiddenColumns}
          onChangeEvent={_onChangeEvent}
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

export default configureTable(ReadWriteTable);
