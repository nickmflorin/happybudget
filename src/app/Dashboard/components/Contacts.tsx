import React, { useState, useMemo } from "react";
import { useDispatch } from "react-redux";
import { isNil, filter } from "lodash";

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
  clear: actions.clearContactsAction,
  updateRowsInState: actions.updateContactRowsInStateAction
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

  const onAttachmentRemoved = useMemo(
    () => (row: Table.ModelRow<R>, id: number) =>
      dispatch(
        actions.updateContactRowsInStateAction({
          id: row.id,
          data: {
            attachments: filter(row.data.attachments, (a: Model.SimpleAttachment) => a.id !== id)
          }
        })
      ),
    []
  );

  const onAttachmentAdded = useMemo(
    () => (row: Table.ModelRow<R>, attachment: Model.Attachment) =>
      dispatch(
        actions.updateContactRowsInStateAction({
          id: row.id,
          data: {
            attachments: [
              ...row.data.attachments,
              { id: attachment.id, name: attachment.name, extension: attachment.extension, url: attachment.url }
            ]
          }
        })
      ),
    []
  );

  return (
    <React.Fragment>
      <Page className={"contacts"} title={"My Contacts"}>
        <ConnectedContactsTable
          table={table}
          tableId={"contacts-table"}
          onRowExpand={(row: Table.ModelRow<R>) => setContactToEdit(row.id)}
          exportFileName={"contacts"}
          onAttachmentRemoved={onAttachmentRemoved}
          onAttachmentAdded={onAttachmentAdded}
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
          onAttachmentRemoved={(id: number) => {
            const row = table.current.getRow(contactToEdit);
            if (!isNil(row)) {
              if (tabling.typeguards.isModelRow(row)) {
                onAttachmentRemoved(row, id);
              } else {
                console.warn(
                  `Suspicous Behavior: After attachment was added, row with ID
                  ${contactToEdit} did not refer to a model row.`
                );
              }
            } else {
              console.warn(
                `Suspicous Behavior: After attachment was added, could not find row in
                state for ID ${contactToEdit}.`
              );
            }
          }}
          onAttachmentAdded={(m: Model.Attachment) => {
            const row = table.current.getRow(contactToEdit);
            if (!isNil(row)) {
              if (tabling.typeguards.isModelRow(row)) {
                onAttachmentAdded(row, m);
              } else {
                console.warn(
                  `Suspicous Behavior: After attachment was added, row with ID
                  ${contactToEdit} did not refer to a model row.`
                );
              }
            } else {
              console.warn(
                `Suspicous Behavior: After attachment was added, could not find row in
                state for ID ${contactToEdit}.`
              );
            }
          }}
          onSuccess={(m: Model.Contact) => {
            setContactToEdit(undefined);
            table.current.applyTableChange({
              type: "modelUpdated",
              payload: { model: m }
            });
          }}
          open={true}
        />
      )}
    </React.Fragment>
  );
};

export default Contacts;
