import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { isNil, find } from "lodash";

import { model } from "lib";
import { selectors } from "store";
import { EditContactModal, CreateContactModal } from "components/modals";
import { ReadWriteBudgetSubAccountsTable, ReadWriteBudgetSubAccountsTableProps } from "components/tabling";

type PreContactCreate = Omit<Table.CellChange<Tables.SubAccountRow, Model.SubAccount>, "newValue">;

type OmitTableProps = "contacts" | "onEditContact" | "onNewContact" | "menuPortalId" | "columns";

interface SubAccountsTableProps extends Omit<ReadWriteBudgetSubAccountsTableProps, OmitTableProps> {
  readonly tableRef: NonNullRef<BudgetTable.ReadWriteTableRefObj<Tables.SubAccountRow, Model.SubAccount>>;
}

const SubAccountsTable = (props: SubAccountsTableProps): JSX.Element => {
  const [preContactCreate, setPreContactCreate] = useState<PreContactCreate | null>(null);
  const [initialContactFormValues, setInitialContactFormValues] = useState<any>(null);
  const [contactToEdit, setContactToEdit] = useState<number | null>(null);
  const [createContactModalVisible, setCreateContactModalVisible] = useState(false);

  const contacts = useSelector(selectors.selectContacts);

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
      <ReadWriteBudgetSubAccountsTable
        {...props}
        menuPortalId={"supplementary-header"}
        contacts={contacts}
        onEditContact={(contact: number) => setContactToEdit(contact)}
        onNewContact={(params: { name?: string; change: PreContactCreate }) => {
          setPreContactCreate(params.change);
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
            const cellChange: Table.CellChange<Tables.SubAccountRow, Model.SubAccount> = {
              ...preContactCreate,
              newValue: contact.id
            };
            props.tableRef.current.applyTableChange({
              type: "dataChange",
              payload: cellChange
            });
          }
        }}
        onCancel={() => setCreateContactModalVisible(false)}
      />
    </React.Fragment>
  );
};

export default SubAccountsTable;
