import { Page } from "components/layout";

import ContactsTable from "./ContactsTable";

const Contacts = (): JSX.Element => {
  return (
    <Page title={"Contacts"}>
      <ContactsTable />
    </Page>
  );
};

export default Contacts;
