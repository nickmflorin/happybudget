import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Dispatch } from "redux";
import { isNil, find, filter, map } from "lodash";
import { createSelector } from "reselect";

import { hooks } from "lib";
import { selectors, actions } from "store";

import { Page } from "components/layout";
import { CreateContactModal, EditContactModal } from "components/modals";
import { ContactsTable } from "components/tabling";

const selectSaving = createSelector(
  (state: Modules.Authenticated.StoreObj) => state.user.contacts.deleting,
  (state: Modules.Authenticated.StoreObj) => state.user.contacts.updating,
  (state: Modules.Authenticated.StoreObj) => state.user.contacts.creating,
  (...args: (Redux.ModelListActionInstance[] | boolean)[]) => {
    return (
      filter(
        map(args, (arg: Redux.ModelListActionInstance[] | boolean) =>
          Array.isArray(arg) ? arg.length !== 0 : arg === true
        ),
        (value: boolean) => value === true
      ).length !== 0
    );
  }
);

const Contacts = (): JSX.Element => {
  const [contactToEdit, setContactToEdit] = useState<Model.Contact | undefined>(undefined);
  const [newContactModalOpen, setNewContactModalOpen] = useState(false);
  const dispatch: Dispatch = useDispatch();
  const contacts = useSelector(selectors.selectContacts);
  const loading = useSelector(selectors.selectContactsLoading);
  const search = useSelector(selectors.selectContactsSearch);
  const saving = useSelector(selectSaving);

  useEffect(() => {
    dispatch(actions.authenticated.requestContactsAction(null));
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
        models={contacts}
        search={search}
        saving={saving}
        onEditContact={onEditContact}
        onSearch={(value: string) => dispatch(actions.authenticated.setContactsSearchAction(value))}
        onChangeEvent={(e: Table.ChangeEvent<Tables.ContactRow, Model.Contact>) =>
          dispatch(actions.authenticated.handleContactsTableChangeEventAction(e))
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
