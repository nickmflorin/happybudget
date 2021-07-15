import { useSelector } from "react-redux";
import { isNil, find } from "lodash";

import { SuppressKeyboardEventParams } from "@ag-grid-community/core";

import { getKeyValue } from "lib/util";
import { parseFirstAndLastName } from "lib/model/util";
import { useContacts } from "store/hooks";

import { selectBudgetDetail, selectBudgetDetailLoading } from "../../store/selectors";
import { GenericSubAccountsTable, GenericSubAccountsTableProps } from "../Generic";

interface SubAccountsTableProps extends Omit<GenericSubAccountsTableProps, "manager" | "columns"> {
  detail: Model.Account | Model.SubAccount | undefined;
  loadingParent: boolean;
}

const SubAccountsTable = ({ loadingParent, detail, ...props }: SubAccountsTableProps): JSX.Element => {
  const contacts = useContacts();
  const budgetDetail = useSelector(selectBudgetDetail);
  const loadingBudget = useSelector(selectBudgetDetailLoading);

  return (
    <GenericSubAccountsTable
      loadingBudget={loadingBudget}
      loadingParent={loadingParent}
      columns={[
        {
          field: "contact",
          headerName: "Contact",
          cellClass: "cell--centered",
          cellRenderer: "ContactCell",
          width: 120,
          cellEditor: "ContactCellEditor",
          type: "contact",
          index: 2,
          // Required to allow the dropdown to be selectable on Enter key.
          suppressKeyboardEvent: (params: SuppressKeyboardEventParams) => {
            if ((params.event.code === "Enter" || params.event.code === "Tab") && params.editing) {
              return true;
            }
            return false;
          },
          processCellForClipboard: (row: BudgetTable.SubAccountRow) => {
            const id = getKeyValue<BudgetTable.SubAccountRow, keyof BudgetTable.SubAccountRow>("contact")(row);
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
              const names = parseFirstAndLastName(name);
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
          type: "sum",
          fieldBehavior: ["read"],
          budget: {
            value: !isNil(budgetDetail) && !isNil(budgetDetail.estimated) ? budgetDetail.estimated : 0.0
          },
          footer: {
            value: !isNil(detail) && !isNil(detail.estimated) ? detail.estimated : 0.0
          }
        },
        {
          field: "actual",
          headerName: "Actual",
          isCalculated: true,
          type: "sum",
          fieldBehavior: ["read"],
          budget: {
            value: !isNil(budgetDetail) && !isNil(budgetDetail.actual) ? budgetDetail.actual : 0.0
          },
          footer: {
            value: !isNil(detail) && !isNil(detail.actual) ? detail.actual : 0.0
          }
        },
        {
          field: "variance",
          headerName: "Variance",
          isCalculated: true,
          type: "sum",
          fieldBehavior: ["read"],
          budget: {
            value: !isNil(budgetDetail) && !isNil(budgetDetail.variance) ? budgetDetail.variance : 0.0
          },
          footer: {
            value: !isNil(detail) && !isNil(detail.variance) ? detail.variance : 0.0
          }
        }
      ]}
      {...props}
    />
  );
};

export default SubAccountsTable;
