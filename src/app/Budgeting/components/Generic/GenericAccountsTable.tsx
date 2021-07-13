import { useRef, ReactNode } from "react";
import { isNil, map, filter } from "lodash";

import { faSigma, faPercentage, faTrashAlt, faLineColumns, faFileCsv } from "@fortawesome/pro-solid-svg-icons";

import { ColSpanParams } from "@ag-grid-community/core";

import { FieldsDropdown } from "components/dropdowns";
import { downloadAsCsvFile } from "lib/util/files";
import BudgetTableComponent from "../BudgetTable";

export interface GenericAccountsTableProps
  extends Omit<
    BudgetTable.Props<BudgetTable.AccountRow, Model.Account, Http.AccountPayload>,
    "groupParams" | "rowCanExpand" | "tableRef" | "manager"
  > {
  exportFileName: string;
  onGroupRows: (rows: BudgetTable.AccountRow[]) => void;
  onDeleteGroup: (group: Model.Group) => void;
  onEditGroup: (group: Model.Group) => void;
  onRowRemoveFromGroup: (row: BudgetTable.AccountRow) => void;
  onRowAddToGroup: (group: number, row: BudgetTable.AccountRow) => void;
  detail: Model.Template | Model.Budget | undefined;
}

const GenericAccountsTable = ({
  /* eslint-disable indent */
  onGroupRows,
  onDeleteGroup,
  onEditGroup,
  onRowRemoveFromGroup,
  onRowAddToGroup,
  exportFileName,
  detail,
  ...props
}: GenericAccountsTableProps): JSX.Element => {
  const tableRef = useRef<BudgetTable.Ref>(null);

  return (
    <BudgetTableComponent<BudgetTable.AccountRow, Model.Account, Http.AccountPayload>
      tableRef={tableRef}
      groupParams={{
        onDeleteGroup,
        onRowRemoveFromGroup,
        onGroupRows,
        onEditGroup,
        onRowAddToGroup
      }}
      rowCanExpand={(row: BudgetTable.AccountRow) => !isNil(row.identifier) || row.meta.children.length !== 0}
      getModelChildren={(model: Model.Account) => model.subaccounts}
      {...props}
      actions={(params: BudgetTable.MenuActionParams<BudgetTable.AccountRow, Model.Account>) => [
        {
          tooltip: "Delete",
          icon: faTrashAlt,
          onClick: () => {
            const rows: BudgetTable.AccountRow[] = params.apis.grid.getSelectedRows();
            props.onChangeEvent({
              payload: map(rows, (row: BudgetTable.AccountRow) => row.id),
              type: "rowDelete"
            });
          }
        },
        {
          tooltip: "Group",
          icon: faSigma,
          disabled: true,
          text: "Group"
        },
        {
          tooltip: "Mark Up",
          icon: faPercentage,
          disabled: true,
          text: "Mark Up"
        },
        {
          text: "Columns",
          tooltip: "Toggle Visibility",
          icon: faLineColumns,
          wrap: (children: ReactNode) => {
            return (
              <FieldsDropdown
                fields={map(params.columns, (col: Table.Column<BudgetTable.AccountRow, Model.Account>) => ({
                  id: col.field as string,
                  label: col.headerName as string,
                  defaultChecked: true
                }))}
                onChange={(change: FieldCheck) => {
                  const tableRefObj = tableRef.current;
                  if (!isNil(tableRefObj)) {
                    tableRefObj.setColumnVisibility({ field: change.id, visible: change.checked });
                  }
                }}
              >
                {children}
              </FieldsDropdown>
            );
          }
        },
        {
          text: "Export CSV",
          tooltip: "Export as CSV",
          icon: faFileCsv,
          wrap: (children: ReactNode) => {
            return (
              <FieldsDropdown
                fields={map(params.columns, (col: Table.Column<BudgetTable.AccountRow, Model.Account>) => ({
                  id: col.field as string,
                  label: col.headerName as string,
                  defaultChecked: true
                }))}
                buttons={[
                  {
                    onClick: (checks: FieldCheck[]) => {
                      const tableRefObj = tableRef.current;
                      const fields = map(
                        filter(checks, (field: FieldCheck) => field.checked === true),
                        (field: FieldCheck) => field.id
                      );
                      if (fields.length !== 0 && !isNil(tableRefObj)) {
                        const csvData = tableRefObj.getCSVData(fields);
                        downloadAsCsvFile(exportFileName, csvData);
                      }
                    },
                    text: "Download",
                    className: "btn--primary"
                  }
                ]}
              >
                {children}
              </FieldsDropdown>
            );
          }
        },
        ...(!isNil(props.actions) ? (Array.isArray(props.actions) ? props.actions : props.actions(params)) : [])
      ]}
      columns={[
        {
          field: "identifier",
          type: "number",
          headerName: "Account",
          width: 90,
          footer: { value: !isNil(detail) ? `${detail.name} Total` : "Total", colSpan: (params: ColSpanParams) => 2 }
        },
        {
          field: "description",
          headerName: "Account Description",
          flex: 100,
          type: "longText"
        },
        ...props.columns
      ]}
    />
  );
};

export default GenericAccountsTable;
