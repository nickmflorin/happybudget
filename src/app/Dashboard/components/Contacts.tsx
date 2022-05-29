import React, { useEffect } from "react";
import { useDispatch } from "react-redux";

import { tabling } from "lib";

import { Page } from "components/layout";
import { ContactsTable, connectTableToAuthenticatedStore } from "tabling";

import { actions, sagas } from "../store";

type M = Model.Contact;
type R = Tables.ContactRowData;

const ConnectedContactsTable = connectTableToAuthenticatedStore<
  ContactsTable.Props,
  R,
  M,
  Redux.ActionContext,
  Tables.ContactTableStore
>({
  tableId: "contacts",
  selector: () => (state: Application.Store) => state.dashboard.contacts,
  createSaga: (table: Table.TableInstance<R, M>) => sagas.createContactsTableSaga(table),
  actions: {
    handleEvent: actions.handleContactsTableEventAction,
    loading: actions.loadingContactsAction,
    response: actions.responseContactsAction,
    setSearch: actions.setContactsSearchAction
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
      <ConnectedContactsTable tableContext={{}} table={table} />
    </Page>
  );
};

export default React.memo(Contacts);
