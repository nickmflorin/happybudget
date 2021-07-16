import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Dispatch } from "redux";

import { Input, Button } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/pro-light-svg-icons";

import { CreateContactModal } from "app/modals";
import { ActionsMenuBar } from "components/menus";
import { Page } from "components/layout";

import { setContactsSearchAction } from "store/actions";
import ContactsTable from "./ContactsTable";

const Contacts = (): JSX.Element => {
  const [newContactModalOpen, setNewContactModalOpen] = useState(false);
  const dispatch: Dispatch = useDispatch();
  const contacts = useSelector((state: Modules.ApplicationStore) => state.user.contacts);

  return (
    <React.Fragment>
      <Page className={"contacts"} title={"My Contacts"}>
        <ActionsMenuBar className={"mb--15"}>
          <Input
            placeholder={"Search Contacts"}
            value={contacts.search}
            allowClear={true}
            prefix={<FontAwesomeIcon className={"icon"} icon={faSearch} />}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              dispatch(setContactsSearchAction(event.target.value))
            }
          />
          <Button className={"btn--primary"} onClick={() => setNewContactModalOpen(true)}>
            {"Add Contact"}
          </Button>
        </ActionsMenuBar>
        <ContactsTable />
      </Page>
      <CreateContactModal
        open={newContactModalOpen}
        onCancel={() => setNewContactModalOpen(false)}
        onSuccess={() => setNewContactModalOpen(false)}
      />
    </React.Fragment>
  );
};

export default Contacts;
