import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Dispatch } from "redux";

import { Input, Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";

import { ActionsMenuBar } from "components/menus";
import { Page } from "components/layout";

import { setContactsSearchAction } from "../actions";
import ContactsTable from "./ContactsTable";
import CreateContactModal from "./CreateContactModal";

const Contacts = (): JSX.Element => {
  const [newContactModalOpen, setNewContactModalOpen] = useState(false);
  const dispatch: Dispatch = useDispatch();
  const contacts = useSelector((state: Redux.IApplicationStore) => state.dashboard.contacts);

  return (
    <React.Fragment>
      <Page title={"My Contacts"}>
        <ActionsMenuBar expand={0} className={"mb--15"}>
          <Input
            placeholder={"Search Contacts"}
            value={contacts.search}
            allowClear={true}
            prefix={<SearchOutlined />}
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
