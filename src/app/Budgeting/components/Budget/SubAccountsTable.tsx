import React, { useState } from "react";
import { useSelector } from "react-redux";
import { isNil, find } from "lodash";

import { SuppressKeyboardEventParams, RowNode } from "@ag-grid-community/core";

import { EditContactModal, CreateContactModal } from "app/modals";
import { getKeyValue } from "lib/util";
import { parseFirstAndLastName } from "lib/model/util";
import { useContacts } from "store/hooks";

import { selectBudgetDetail, selectBudgetDetailLoading } from "../../store/selectors";
import { GenericSubAccountsTable, GenericSubAccountsTableProps } from "../Generic";

interface SubAccountsTableProps extends Omit<GenericSubAccountsTableProps, "manager" | "columns" | "budgetType"> {
  detail: Model.Account | Model.SubAccount | undefined;
  loadingParent: boolean;
}

const SubAccountsTable = ({ loadingParent, detail, ...props }: SubAccountsTableProps): JSX.Element => {
  const [initialContactFormValues, setInitialContactFormValues] = useState<any>(null);
  const [contactToEdit, setContactToEdit] = useState<Model.Contact | null>(null);
  const [createContactModalVisible, setCreateContactModalVisible] = useState(false);

  const contacts = useContacts();
  const budgetDetail = useSelector(selectBudgetDetail);
  const loadingBudget = useSelector(selectBudgetDetailLoading);

  return (
    <React.Fragment>
      <GenericSubAccountsTable
        budgetType={"budget"}
        loadingBudget={loadingBudget}
        loadingParent={loadingParent}
        onCellFocusChanged={(params: Table.CellFocusChangedParams<BudgetTable.SubAccountRow, Model.SubAccount>) => {
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
            cellClass: "cell--centered",
            cellRenderer: "ContactCell",
            width: 120,
            cellEditor: "ContactCellEditor",
            columnType: "contact",
            index: 2,
            cellRendererParams: {
              onEditContact: (contact: Model.Contact) => setContactToEdit(contact)
            },
            cellEditorParams: {
              onNewContact: (name?: string) => {
                setInitialContactFormValues(null);
                if (!isNil(name)) {
                  const [firstName, lastName] = parseFirstAndLastName(name);
                  setInitialContactFormValues({
                    first_name: firstName,
                    last_name: lastName
                  });
                }
                setCreateContactModalVisible(true);
              }
            },
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
            columnType: "sum",
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
            columnType: "sum",
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
            columnType: "sum",
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
      {!isNil(contactToEdit) && (
        <EditContactModal
          visible={true}
          contact={contactToEdit}
          onSuccess={() => setContactToEdit(null)}
          onCancel={() => setContactToEdit(null)}
        />
      )}
      <CreateContactModal
        visible={createContactModalVisible}
        initialValues={initialContactFormValues}
        onSuccess={() => setCreateContactModalVisible(false)}
        onCancel={() => setCreateContactModalVisible(false)}
      />
    </React.Fragment>
  );
};

export default SubAccountsTable;
