import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { isNil } from "lodash";

import { model, tabling } from "lib";
import { actions, selectors } from "store";
import { EditContactModal, CreateContactModal } from "components/modals";
import { SubAccountsTable as GenericSubAccountsTable } from "components/tabling";

type R = Tables.SubAccountRowData;
type M = Model.SubAccount;

type OmitTableProps = "contacts" | "onEditContact" | "onNewContact" | "menuPortalId" | "columns" | "onExportPdf";

export interface BudgetSubAccountsTableProps
  extends Omit<GenericSubAccountsTable.AuthenticatedBudgetProps, OmitTableProps> {
  readonly budgetId: number;
  readonly budget: Model.Budget | null;
  readonly setPreviewModalVisible: (v: boolean) => void;
}

const SubAccountsTable = ({
  budget,
  budgetId,
  setPreviewModalVisible,
  ...props
}: BudgetSubAccountsTableProps): JSX.Element => {
  const [preContactEdit, setPreContactEdit] = useState<Table.EditableRowId | null>(null);
  const [preContactCreate, setPreContactCreate] = useState<{ name?: string; id: Table.EditableRowId } | null>(null);
  const [initialContactFormValues, setInitialContactFormValues] = useState<any>(null);
  const [contactToEdit, setContactToEdit] = useState<number | null>(null);
  const [createContactModalVisible, setCreateContactModalVisible] = useState(false);

  const dispatch = useDispatch();
  const contacts = useSelector(selectors.selectContacts);
  const table = tabling.hooks.useTableIfNotDefined<R, M>(props.table);

  return (
    <React.Fragment>
      <GenericSubAccountsTable.AuthenticatedBudget
        {...props}
        table={table}
        contacts={contacts}
        menuPortalId={"supplementary-header"}
        savingChangesPortalId={"saving-changes"}
        onEditContact={(params: { contact: number; id: Table.EditableRowId }) => {
          setPreContactEdit(params.id);
          setContactToEdit(params.contact);
        }}
        onExportPdf={() => setPreviewModalVisible(true)}
        onNewContact={(params: { name?: string; id: Table.EditableRowId }) => {
          setPreContactCreate(params);
          setInitialContactFormValues(null);
          if (!isNil(params.name)) {
            const [firstName, lastName] = model.util.parseFirstAndLastName(params.name);
            setInitialContactFormValues({
              first_name: firstName,
              last_name: lastName
            });
          }
          setCreateContactModalVisible(true);
        }}
      />
      {!isNil(contactToEdit) && (
        <EditContactModal
          open={true}
          id={contactToEdit}
          onSuccess={(m: Model.Contact) => {
            dispatch(actions.authenticated.updateContactInStateAction({ id: m.id, data: m }));
            setContactToEdit(null);
            setPreContactEdit(null);
            if (!isNil(preContactEdit)) {
              const row: Table.BodyRow<R> | null = table.current.getRow(preContactEdit);
              if (!isNil(row) && tabling.typeguards.isModelRow(row) && row.data.rate === null && m.rate !== null) {
                table.current.applyTableChange({
                  type: "dataChange",
                  payload: {
                    id: row.id,
                    data: { rate: { oldValue: row.data.rate, newValue: m.rate } }
                  }
                });
              }
            }
          }}
          onCancel={() => setContactToEdit(null)}
        />
      )}
      {createContactModalVisible && (
        <CreateContactModal
          open={true}
          initialValues={initialContactFormValues}
          onSuccess={(m: Model.Contact) => {
            dispatch(actions.authenticated.addContactToStateAction(m));
            setPreContactCreate(null);
            setInitialContactFormValues(null);
            setCreateContactModalVisible(false);
            // If we have enough information from before the contact was created in the specific
            // cell, combine that information with the new value to perform a table update, showing
            // the created contact in the new cell.
            if (!isNil(preContactCreate)) {
              const row: Table.BodyRow<R> | null = table.current.getRow(preContactCreate.id);
              if (!isNil(row) && tabling.typeguards.isModelRow(row)) {
                let rowChange: Table.RowChange<R> = {
                  id: row.id,
                  data: { contact: { oldValue: row.data.contact || null, newValue: m.id } }
                };
                // If the Row does not already specify a rate and the Contact does specify a rate,
                // use the rate that is specified for the Contact.
                if (m.rate !== null && row.data.rate === null) {
                  rowChange = {
                    ...rowChange,
                    data: { ...rowChange.data, rate: { oldValue: row.data.rate, newValue: m.rate } }
                  };
                }
                table.current.applyTableChange({
                  type: "dataChange",
                  payload: rowChange
                });
              }
            }
          }}
          onCancel={() => setCreateContactModalVisible(false)}
        />
      )}
    </React.Fragment>
  );
};

export default SubAccountsTable;
