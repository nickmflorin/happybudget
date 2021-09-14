import { useState } from "react";
import { isNil } from "lodash";

import { tabling, redux, model } from "lib";

import { Page } from "components/layout";
import { CreateContactModal, EditContactModal } from "components/modals";
import { ContactsTable, connectTableToStore } from "components/tabling";

import { actions } from "../store";

type M = Model.Contact;
type R = Tables.ContactRowData;

const ActionMap = {
  tableChanged: actions.handleContactsTableChangeEventAction,
  request: actions.requestContactsAction,
  loading: actions.loadingContactsAction,
  response: actions.responseContactsAction,
  saving: actions.savingContactsTableAction,
  addModelsToState: actions.addContactModelsToStateAction,
  setSearch: actions.setContactsSearchAction,
  clear: actions.clearContactsAction
};

const ConnectedContactsTable = connectTableToStore<ContactsTable.Props, R, M, Model.Group, Tables.ContactTableStore>({
  asyncId: "async-contacts-table",
  actions: ActionMap,
  reducer: tabling.reducers.createAuthenticatedTableReducer<R, M, Model.Group, Tables.ContactTableStore>({
    tableId: "contacts-table",
    columns: ContactsTable.Columns,
    actions: ActionMap,
    getModelRowLabel: (r: R) =>
      model.util.displayFirstAndLastName(r.names_and_image.first_name, r.names_and_image.last_name),
    getModelRowName: "Account",
    getPlaceholderRowLabel: (r: R) =>
      model.util.displayFirstAndLastName(r.names_and_image.first_name, r.names_and_image.last_name),
    getPlaceholderRowName: "Account",
    initialState: redux.initialState.initialTableState
  })
})(ContactsTable.Table);

const Contacts = (): JSX.Element => {
  const [contactToEdit, setContactToEdit] = useState<M | undefined>(undefined);
  const [newContactModalOpen, setNewContactModalOpen] = useState(false);

  return (
    <Page className={"contacts"} title={"My Contacts"}>
      <ConnectedContactsTable
        tableId={"contacts-table"}
        onRowExpand={(row: Table.ModelRow<R, M>) => {
          /*
          Important!:  At least right now, whenever a row is updated or changed, the
          associated model stored on it's meta property is not updated.  The `meta.model`
          property is the original model that was used to create the row.  Eventually, this
          will be improved - but it should be noted right now that the modal will not show the
          updated <Contact> if the table was edited.

          The relationship between rows and models needs to be improved going forward.
          */
          setContactToEdit(row.model);
        }}
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
