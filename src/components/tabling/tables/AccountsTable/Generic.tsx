import { isNil, map, filter, includes } from "lodash";

import { Column } from "@ag-grid-community/core";

import { tabling } from "lib";
import { BudgetTable, BudgetTableProps } from "components/tabling";
import { framework } from "components/tabling/generic";

type R = Tables.AccountRow;
type M = Model.Account;

type OmitTableProps = "levelType" | "cookieNames" | "getRowChildren" | "getRowLabel" | "showPageFooter";

export interface GenericAccountsTableProps extends Omit<BudgetTableProps<R, M>, OmitTableProps> {
  readonly cookieNames?: Omit<Table.CookieNames, "hiddenColumns">;
  readonly exportFileName: string;
  readonly tableFooterIdentifierValue: string;
  readonly onEditGroup?: (group: Model.Group) => void;
}

const GenericAccountsTable = ({
  onEditGroup,
  exportFileName,
  tableFooterIdentifierValue,
  ...props
}: GenericAccountsTableProps): JSX.Element => {
  const table = tabling.hooks.useBudgetTableIfNotDefined(props.table);
  return (
    <BudgetTable<R, M>
      {...props}
      levelType={"budget"}
      showPageFooter={false}
      table={table}
      getRowChildren={(model: M) => model.subaccounts}
      getRowLabel={(model: M) => model.identifier || model.description}
      getRowName={"Account"}
      cookieNames={{ ...props.cookieNames, hiddenColumns: "account-table-hidden-columns" }}
      actions={(params: Table.MenuActionParams<R, M>) => [
        {
          icon: "trash-alt",
          disabled: params.selectedRows.length === 0,
          onClick: () => {
            const rows: R[] = params.apis.grid.getSelectedRows();
            props.onChangeEvent?.({
              payload: { rows, columns: params.columns },
              type: "rowDelete"
            });
          }
        },
        {
          icon: "folder",
          disabled: true,
          text: "Group"
        },
        {
          icon: "badge-percent",
          disabled: true,
          text: "Mark Up"
        },
        framework.actions.ToggleColumnAction(table.current, params),
        framework.actions.ExportCSVAction(table.current, params, exportFileName),
        ...(!isNil(props.actions) ? (Array.isArray(props.actions) ? props.actions : props.actions(params)) : [])
      ]}
      columns={[
        {
          field: "identifier",
          columnType: "number",
          headerName: "Account",
          footer: {
            value: tableFooterIdentifierValue,
            colSpan: (params: Table.ColSpanParams<R, M>) => 2
          },
          index: 0,
          cellRenderer: "IdentifierCell",
          width: 100,
          maxWidth: 100,
          suppressSizeToFit: true,
          cellStyle: { textAlign: "left" },
          cellRendererParams: {
            onGroupEdit: onEditGroup
          },
          colSpan: (params: Table.ColSpanParams<R, M>) => {
            const row: R = params.data;
            if (row.meta.isGroupRow === true) {
              /*
              Note: We have to look at all of the visible columns that are present up until
              the calculated columns.  This means we have to use the AG Grid ColumnApi (not our
              own columns).
              */
              const agColumns: Column[] | undefined = params.columnApi?.getAllDisplayedColumns();
              if (!isNil(agColumns)) {
                const readColumns: Table.Field<R, M>[] = map(
                  filter(params.columns, (c: Table.Column<R, M>) => {
                    const fieldBehavior: Table.FieldBehavior[] = c.fieldBehavior || ["read", "write"];
                    return includes(fieldBehavior, "read") && c.isCalculated !== true;
                  }),
                  (c: Table.Column<R, M>) => c.field
                );
                const readableAgColumns = filter(agColumns, (c: Column) => includes(readColumns, c.getColId()));
                return readableAgColumns.length;
              }
            }
            return 1;
          }
        },
        {
          field: "description",
          headerName: "Account Description",
          flex: 100,
          columnType: "longText"
        },
        ...props.columns
      ]}
    />
  );
};

export default GenericAccountsTable;
