import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { filter } from "lodash";

import { tabling } from "lib";

import { Page } from "components/layout";
import { ContactsTable, connectTableToAuthenticatedStore } from "tabling";

import { actions, sagas } from "../store";

type M = Model.Contact;
type R = Tables.ContactRowData;

const ConnectedContactsTable = connectTableToAuthenticatedStore<ContactsTable.Props, R, M, Tables.ContactTableStore>({
  tableId: "contacts",
  selector: (state: Application.Store) => state.dashboard.contacts,
  createSaga: (table: Table.TableInstance<R, M>) => sagas.createContactsTableSaga(table),
  actions: {
    tableChanged: actions.handleContactsTableChangeEventAction,
    loading: actions.loadingContactsAction,
    response: actions.responseContactsAction,
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

  return (
    <Page className={"contacts"} title={"My Contacts"}>
      <ConnectedContactsTable
        actionContext={{}}
        table={table}
        onAttachmentRemoved={(row: Table.ModelRow<R>, id: number) =>
          dispatch(
            actions.updateContactRowsInStateAction({
              id: row.id,
              data: {
                attachments: filter(row.data.attachments, (a: Model.SimpleAttachment) => a.id !== id)
              }
            })
          )
        }
        onAttachmentAdded={(row: Table.ModelRow<R>, attachment: Model.Attachment) =>
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
          )
        }
      />
    </Page>
  );
};

export default React.memo(Contacts);
