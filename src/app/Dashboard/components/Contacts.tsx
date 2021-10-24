import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { isNil } from "lodash";

import { actions as globalActions } from "store";
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
  const table = tabling.hooks.useTable<R, M>();
  const [contactToEdit, setContactToEdit] = useState<number | undefined>(undefined);
  const [newContactModalOpen, setNewContactModalOpen] = useState(false);

  const dispatch = useDispatch();

  return (
    <React.Fragment>
      <Page className={"contacts"} title={"My Contacts"}>
        <ConnectedContactsTable
          table={table}
          tableId={"contacts-table"}
          onRowExpand={(row: Table.ModelRow<R>) => setContactToEdit(row.id)}
          exportFileName={"contacts"}
        />
        <CreateContactModal
          open={newContactModalOpen}
          onCancel={() => setNewContactModalOpen(false)}
          onSuccess={(m: Model.Contact) => {
            dispatch(globalActions.authenticated.addContactToStateAction(m));
            setNewContactModalOpen(false);
          }}
        />
      </Page>
      {!isNil(contactToEdit) && (
        <EditContactModal
          id={contactToEdit}
          onCancel={() => setContactToEdit(undefined)}
          onSuccess={(m: Model.Contact) => {
            setContactToEdit(undefined);
            table.current.applyTableChange({
              type: "modelUpdated",
              payload: m
            });
          }}
          open={true}
        />
      )}
    </React.Fragment>
  );
};

export default Contacts;
