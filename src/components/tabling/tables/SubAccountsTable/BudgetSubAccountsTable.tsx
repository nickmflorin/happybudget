import { isNil, find } from "lodash";

import { SuppressKeyboardEventParams, RowNode } from "@ag-grid-community/core";

import { util, model } from "lib";
import GenericSubAccountsTable, { GenericSubAccountsTableProps } from "./Generic";

type OmitTableProps = "budgetType" | "onCellFocusChanged" | "columns";

type PreContactCreate = Omit<Table.CellChange<Tables.SubAccountRow, Model.SubAccount>, "newValue">;

export interface BudgetSubAccountsTableProps extends Omit<GenericSubAccountsTableProps, OmitTableProps> {
  readonly detail: Model.Account | Model.SubAccount | undefined;
  readonly budget: Model.Budget | undefined;
  readonly contacts: Model.Contact[];
  readonly onNewContact: (params: { name?: string; change: PreContactCreate }) => void;
  readonly onEditContact: (id: number) => void;
}

const BudgetSubAccountsTable = ({
  detail,
  budget,
  contacts,
  onEditContact,
  onNewContact,
  ...props
}: BudgetSubAccountsTableProps): JSX.Element => {
  return (
    <GenericSubAccountsTable
      {...props}
      budgetType={"budget"}
      onCellFocusChanged={(params: Table.CellFocusChangedParams<Tables.SubAccountRow, Model.SubAccount>) => {
        /*
          For the ContactCell, we want the contact tag in the cell to be clickable
          only when the cell is focused.  This means we have to rerender the cell when
          it becomes focused or unfocused so that the tag becomes clickable (in the focused
          case) or unclickable (in the unfocused case).
          */
        const rowNodes: RowNode[] = [];
        if (params.cell.column.field === "contact") {
          rowNodes.push(params.cell.rowNode);
        }
        if (!isNil(params.previousCell) && params.previousCell.column.field === "contact") {
          rowNodes.push(params.previousCell.rowNode);
        }
        if (rowNodes.length !== 0) {
          params.apis.grid.refreshCells({
            force: true,
            rowNodes,
            columns: ["contact"]
          });
        }
      }}
      columns={[
        {
          field: "contact",
          headerName: "Contact",
          cellClass: "cell--renders-html",
          cellRenderer: { data: "ContactCell" },
          width: 120,
          cellEditor: "ContactEditor",
          columnType: "contact",
          index: 2,
          cellRendererParams: { onEditContact },
          cellEditorParams: { onNewContact },
          // Required to allow the dropdown to be selectable on Enter key.
          suppressKeyboardEvent: (params: SuppressKeyboardEventParams) => {
            if ((params.event.code === "Enter" || params.event.code === "Tab") && params.editing) {
              return true;
            }
            return false;
          },
          processCellForClipboard: (row: Tables.SubAccountRow) => {
            const id = util.getKeyValue<Tables.SubAccountRow, keyof Tables.SubAccountRow>("contact")(row);
            if (isNil(id)) {
              return "";
            }
            const contact: Model.Contact | undefined = find(contacts, { id } as any);
            return !isNil(contact) ? contact.full_name : "";
          },
          processCellFromClipboard: (name: string): Model.Contact | null => {
            if (name.trim() === "") {
              return null;
            } else {
              const names = model.util.parseFirstAndLastName(name);
              const contact: Model.Contact | undefined = find(contacts, {
                first_name: names[0],
                last_name: names[1]
              });
              return contact || null;
            }
          }
        },
        {
          field: "estimated",
          headerName: "Estimated",
          isCalculated: true,
          columnType: "sum",
          fieldBehavior: ["read"],
          page: {
            value: !isNil(budget) && !isNil(budget.estimated) ? budget.estimated : 0.0
          },
          footer: {
            value: !isNil(detail) && !isNil(detail.estimated) ? detail.estimated : 0.0
          }
        },
        {
          field: "actual",
          headerName: "Actual",
          isCalculated: true,
          columnType: "sum",
          fieldBehavior: ["read"],
          page: {
            value: !isNil(budget) && !isNil(budget.actual) ? budget.actual : 0.0
          },
          footer: {
            value: !isNil(detail) && !isNil(detail.actual) ? detail.actual : 0.0
          }
        },
        {
          field: "variance",
          headerName: "Variance",
          isCalculated: true,
          columnType: "sum",
          fieldBehavior: ["read"],
          page: {
            value: !isNil(budget) && !isNil(budget.variance) ? budget.variance : 0.0
          },
          footer: {
            value: !isNil(detail) && !isNil(detail.variance) ? detail.variance : 0.0
          }
        }
      ]}
    />
  );
};

export default BudgetSubAccountsTable;
