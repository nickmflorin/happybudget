import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { isNil, find } from "lodash";

import { SuppressKeyboardEventParams, RowNode } from "@ag-grid-community/core";

import { EditContactModal, CreateContactModal } from "components/modals";
import { getKeyValue } from "lib/util";
import { parseFirstAndLastName } from "lib/model/util";
import { simpleDeepEqualSelector } from "store/selectors";

import { selectBudgetDetail, selectBudgetDetailLoading } from "../../store/selectors";
import { GenericSubAccountsTable, GenericSubAccountsTableProps } from "../Generic";

type PreContactCreate = Omit<Table.CellChange<BudgetTable.SubAccountRow, Model.SubAccount>, "newValue">;

interface SubAccountsTableProps extends Omit<GenericSubAccountsTableProps, "manager" | "columns" | "budgetType"> {
  readonly detail: Model.Account | Model.SubAccount | undefined;
  readonly loadingParent: boolean;
}

const selectContacts = simpleDeepEqualSelector((state: Modules.ApplicationStore) => state.user.contacts.data);

const SubAccountsTable = ({ loadingParent, detail, ...props }: SubAccountsTableProps): JSX.Element => {
  const [preContactCreate, setPreContactCreate] = useState<PreContactCreate | null>(null);
  const [initialContactFormValues, setInitialContactFormValues] = useState<any>(null);
  const [contactToEdit, setContactToEdit] = useState<number | null>(null);
  const [createContactModalVisible, setCreateContactModalVisible] = useState(false);

  const contacts = useSelector(selectContacts);
  const budgetDetail = useSelector(selectBudgetDetail);
  const loadingBudget = useSelector(selectBudgetDetailLoading);

  const editingContact = useMemo(() => {
    if (!isNil(contactToEdit)) {
      const contact: Model.Contact | undefined = find(contacts, { id: contactToEdit } as any);
      if (!isNil(contact)) {
        return contact;
      } else {
        /* eslint-disable no-console */
        console.error(`Could not find contact with ID ${contactToEdit} in state.`);
        return null;
      }
    }
    return null;
  }, [contactToEdit]);

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
              onEditContact: (contact: number) => setContactToEdit(contact)
            },
            cellEditorParams: {
              onNewContact: (params: { name?: string; change: PreContactCreate }) => {
                setPreContactCreate(params.change);
                setInitialContactFormValues(null);
                if (!isNil(params.name)) {
                  const [firstName, lastName] = parseFirstAndLastName(params.name);
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
      {!isNil(editingContact) && (
        <EditContactModal
          visible={true}
          contact={editingContact}
          onSuccess={() => setContactToEdit(null)}
          onCancel={() => setContactToEdit(null)}
        />
      )}
      <CreateContactModal
        visible={createContactModalVisible}
        initialValues={initialContactFormValues}
        onSuccess={(contact: Model.Contact) => {
          setPreContactCreate(null);
          setInitialContactFormValues(null);
          setCreateContactModalVisible(false);
          // If we have enough information from before the contact was created in the specific
          // cell, combine that information with the new value to perform a table update, showing
          // the created contact in the new cell.
          if (!isNil(preContactCreate)) {
            const cellChange: Table.CellChange<BudgetTable.SubAccountRow, Model.SubAccount> = {
              ...preContactCreate,
              newValue: contact.id
            };
            if (!isNil(props.tableRef.current)) {
              props.tableRef.current.applyTableChange({
                type: "dataChange",
                payload: cellChange
              });
            }
          }
        }}
        onCancel={() => setCreateContactModalVisible(false)}
      />
    </React.Fragment>
  );
};

export default SubAccountsTable;
