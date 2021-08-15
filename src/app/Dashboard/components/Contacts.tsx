import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Dispatch } from "redux";
import { isNil, find } from "lodash";

import { hooks } from "lib";

import { Page } from "components/layout";
import { CreateContactModal, EditContactModal } from "components/modals";
import { ContactsTable } from "components/tabling";

import { selectors, actions } from "store";

const Contacts = (): JSX.Element => {
  const [contactToEdit, setContactToEdit] = useState<Model.Contact | undefined>(undefined);
  const [newContactModalOpen, setNewContactModalOpen] = useState(false);
  const dispatch: Dispatch = useDispatch();
  const contacts = useSelector(selectors.selectContacts);
  const loading = useSelector(selectors.selectContactsLoading);
  const search = useSelector(selectors.selectContactsSearch);

  useEffect(() => {
    dispatch(actions.requestContactsAction(null));
  }, []);

  const onEditContact = hooks.useDynamicCallback((id: number) => {
    const contact: Model.Contact | undefined = find(contacts, { id } as any);
    if (!isNil(contact)) {
      setContactToEdit(contact);
    }
  });

  return (
    <Page className={"contacts"} title={"My Contacts"}>
      <ContactsTable
        loading={loading}
        data={contacts}
        search={search}
        onEditContact={onEditContact}
        onSearch={(value: string) => dispatch(actions.setContactsSearchAction(value))}
        onChangeEvent={(e: Table.ChangeEvent<Tables.ContactRow, Model.Contact>) =>
          dispatch(actions.handleContactsTableChangeEventAction(e))
        }
        exportFileName={"contacts"}
      />
      <CreateContactModal
        visible={newContactModalOpen}
        onCancel={() => setNewContactModalOpen(false)}
        onSuccess={() => setNewContactModalOpen(false)}
      />
      {!isNil(contactToEdit) && (
        <EditContactModal
          contact={contactToEdit}
          onCancel={() => setContactToEdit(undefined)}
          onSuccess={() => setContactToEdit(undefined)}
          visible={true}
        />
      )}
    </Page>
  );
};

export default Contacts;
