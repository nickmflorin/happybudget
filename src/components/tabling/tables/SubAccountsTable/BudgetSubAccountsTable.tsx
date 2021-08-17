import { isNil, find } from "lodash";

import { RowNode } from "@ag-grid-community/core";

import { model } from "lib";
import { framework } from "components/tabling/generic";
import GenericSubAccountsTable, { GenericSubAccountsTableProps } from "./Generic";

type R = Tables.SubAccountRow;
type M = Model.SubAccount;

type OmitTableProps = "budgetType" | "onCellFocusChanged" | "columns";

type PreContactCreate = Omit<Table.CellChange<R, M>, "newValue">;

export interface BudgetSubAccountsTableProps extends Omit<GenericSubAccountsTableProps, OmitTableProps> {
  readonly detail: Model.Account | M | undefined;
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
      onCellFocusChanged={(params: Table.CellFocusChangedParams<R, M>) => {
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
        framework.columnObjs.ModelSelectColumn<R, M, Model.Contact>({
          field: "contact",
          headerName: "Contact",
          cellRenderer: { data: "ContactCell" },
          cellEditor: "ContactEditor",
          columnType: "contact",
          index: 2,
          cellRendererParams: { onEditContact },
          cellEditorParams: { onNewContact },
          models: contacts,
          modelClipboardValue: (m: Model.Contact) => m.full_name,
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
        }),
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
