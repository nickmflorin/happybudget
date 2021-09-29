import { useState } from "react";
import { isNil } from "lodash";

import { tabling, redux } from "lib";

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

const ConnectedContactsTable = connectTableToStore<ContactsTable.Props, R, M, Tables.ContactTableStore>({
  asyncId: "async-contacts-table",
  actions: ActionMap,
  reducer: tabling.reducers.createAuthenticatedTableReducer<R, M, Tables.ContactTableStore>({
    tableId: "contacts-table",
    columns: ContactsTable.Columns,
    actions: ActionMap,
    initialState: redux.initialState.initialTableState
  })
})(ContactsTable.Table);

const Contacts = (): JSX.Element => {
  const [contactToEdit, setContactToEdit] = useState<number | undefined>(undefined);
  const [newContactModalOpen, setNewContactModalOpen] = useState(false);

  return (
    <Page className={"contacts"} title={"My Contacts"}>
      <ConnectedContactsTable
        tableId={"contacts-table"}
        onRowExpand={(row: Table.ModelRow<R>) => setContactToEdit(row.id)}
        exportFileName={"contacts"}
      />
      <CreateContactModal
        visible={newContactModalOpen}
        onCancel={() => setNewContactModalOpen(false)}
        onSuccess={() => setNewContactModalOpen(false)}
      />
      {!isNil(contactToEdit) && (
        <EditContactModal
          id={contactToEdit}
          onCancel={() => setContactToEdit(undefined)}
          onSuccess={() => setContactToEdit(undefined)}
          open={true}
        />
      )}
    </Page>
  );
};

export default Contacts;
