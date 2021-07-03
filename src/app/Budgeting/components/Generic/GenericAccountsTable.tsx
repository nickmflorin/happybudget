import { useRef, ReactNode } from "react";
import { isNil, map, filter } from "lodash";

import { faSigma, faPercentage, faTrashAlt, faLineColumns, faFileCsv } from "@fortawesome/pro-solid-svg-icons";

import { FieldsDropdown } from "components/dropdowns";
import { downloadAsCsvFile } from "lib/util/files";
import BudgetTableComponent from "../BudgetTable";

export interface GenericAccountsTableProps<
  R extends BudgetTable.AccountRow,
  M extends Model.Account,
  G extends Model.Group,
  P extends Http.ModelPayload<M> = Http.ModelPayload<M>
> extends Omit<
    BudgetTable.Props<R, M, G, P>,
    | "identifierField"
    | "identifierFieldHeader"
    | "groupParams"
    | "tableFooterIdentifierValue"
    | "rowCanExpand"
    | "tableRef"
  > {
  exportFileName: string;
  onGroupRows: (rows: R[]) => void;
  onDeleteGroup: (group: G) => void;
  onEditGroup: (group: G) => void;
  onRowRemoveFromGroup: (row: R) => void;
  onRowAddToGroup: (group: number, row: R) => void;
  detail: Model.Template | Model.Budget | undefined;
}

const GenericAccountsTable = <
  R extends BudgetTable.AccountRow,
  M extends Model.Account,
  G extends Model.Group,
  P extends Http.ModelPayload<M> = Http.ModelPayload<M>
>({
  /* eslint-disable indent */
  onGroupRows,
  onDeleteGroup,
  onEditGroup,
  onRowRemoveFromGroup,
  onRowAddToGroup,
  exportFileName,
  detail,
  ...props
}: GenericAccountsTableProps<R, M, G, P>): JSX.Element => {
  const tableRef = useRef<BudgetTable.Ref>(null);

  return (
    <BudgetTableComponent<R, M, G, P>
      tableRef={tableRef}
      identifierField={"identifier"}
      identifierFieldHeader={"Account"}
      identifierColumn={{ ...props.identifierColumn, width: 90 }}
      tableFooterIdentifierValue={!isNil(detail) ? `${detail.name} Total` : "Total"}
      groupParams={{
        onDeleteGroup,
        onRowRemoveFromGroup,
        onGroupRows,
        onEditGroup,
        onRowAddToGroup
      }}
      rowCanExpand={(row: R) => row.identifier !== null || row.meta.children.length !== 0}
      {...props}
      actions={(params: BudgetTable.MenuActionParams<R>) => [
        {
          tooltip: "Delete",
          icon: faTrashAlt,
          onClick: () => {
            const rows: R[] = params.apis.grid.getSelectedRows();
            props.onRowDelete(map(rows, (row: R) => row.id));
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
                fields={map(params.columns, (col: Table.Column<R>) => ({
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
                fields={map(params.columns, (col: Table.Column<R>) => ({
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
