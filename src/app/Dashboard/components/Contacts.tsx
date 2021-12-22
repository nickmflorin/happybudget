import React, { useMemo, useEffect } from "react";
import { useDispatch } from "react-redux";
import { isNil, filter } from "lodash";

import { actions as globalActions } from "store";
import { tabling, redux } from "lib";

import { Page } from "components/layout";
import { useContacts } from "components/hooks";
import { ContactsTable, connectTableToStore } from "tabling";

import { actions, sagas } from "../store";

type M = Model.Contact;
type R = Tables.ContactRowData;

const ConnectedContactsTable = connectTableToStore<ContactsTable.Props, R, M, Tables.ContactTableStore>({
  selector: (state: Application.Store) => {
    if (redux.typeguards.isAuthenticatedStore(state)) {
      return state.dashboard.contacts;
    }
    return redux.initialState.initialTableState;
  },
  createSaga: (table: Table.TableInstance<R, M>) => sagas.createContactsTableSaga(table),
  actions: {
    tableChanged: actions.handleContactsTableChangeEventAction,
    loading: actions.loadingContactsAction,
    response: actions.responseContactsAction,
    saving: actions.savingContactsTableAction,
    addModelsToState: actions.addContactModelsToStateAction,
    setSearch: actions.setContactsSearchAction,
    updateRowsInState: actions.updateContactRowsInStateAction
  }
})(ContactsTable.Table);

const Contacts = (): JSX.Element => {
  const table = tabling.hooks.useTable<R, M>();

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(actions.requestContactsAction(null, {}));
  }, []);

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

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [__, editContactModal, editContact, _] = useContacts({
    onCreated: (m: Model.Contact) => dispatch(globalActions.authenticated.addContactToStateAction(m)),
    onUpdated: (m: Model.Contact) =>
      table.current.applyTableChange({
        type: "modelUpdated",
        payload: { model: m }
      }),
    onAttachmentRemoved: (id: number, attachmentId: number) => {
      const row = table.current.getRow(id);
      if (!isNil(row)) {
        if (tabling.typeguards.isModelRow(row)) {
          onAttachmentRemoved(row, attachmentId);
        } else {
          console.warn(
            `Suspicous Behavior: After attachment was added, row with ID
            ${id} did not refer to a model row.`
          );
        }
      } else {
        console.warn(
          `Suspicous Behavior: After attachment was added, could not find row in
          state for ID ${id}.`
        );
      }
    },
    onAttachmentAdded: (id: number, m: Model.Attachment) => {
      const row = table.current.getRow(id);
      if (!isNil(row)) {
        if (tabling.typeguards.isModelRow(row)) {
          onAttachmentAdded(row, m);
        } else {
          console.warn(
            `Suspicous Behavior: After attachment was added, row with ID
            ${id} did not refer to a model row.`
          );
        }
      } else {
        console.warn(
          `Suspicous Behavior: After attachment was added, could not find row in
          state for ID ${id}.`
        );
      }
    }
  });

  return (
    <React.Fragment>
      <Page className={"contacts"} title={"My Contacts"}>
        <ConnectedContactsTable
          table={table}
          actionContext={{}}
          tableId={"contacts"}
          editColumnConfig={[
            {
              conditional: (r: Table.NonPlaceholderBodyRow<R>) => tabling.typeguards.isModelRow(r),
              action: (r: Table.ModelRow<R>) => editContact({ id: r.id, rowId: r.id }),
              behavior: "expand",
              tooltip: "Edit"
            }
          ]}
          exportFileName={"contacts"}
          onAttachmentRemoved={onAttachmentRemoved}
          onAttachmentAdded={onAttachmentAdded}
        />
      </Page>
      {editContactModal}
    </React.Fragment>
  );
};

export default Contacts;
