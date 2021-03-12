import React from "react";
import { Route, Switch, useHistory, useLocation } from "react-router-dom";

import { FileAddOutlined, ContactsOutlined, FolderOutlined, DeleteOutlined } from "@ant-design/icons";

import { Layout } from "components/layout";

const Contacts = React.lazy(() => import("./components/Contacts"));
const Budgets = React.lazy(() => import("./components/Budgets/Active"));
const Trash = React.lazy(() => import("./components/Budgets/Trash"));
const Templates = React.lazy(() => import("./components/Templates"));

const Dashboard = (): JSX.Element => {
  const history = useHistory();
  const location = useLocation();

  return (
    <Layout
      sidebar={[
        {
          text: "New Budget",
          icon: <FileAddOutlined className={"icon"} />,
          onClick: () => history.push("/templates"),
          active: location.pathname.startsWith("/templates")
        },
        {
          text: "Budgets",
          icon: <FolderOutlined className={"icon"} />,
          onClick: () => history.push("/budgets"),
          active: location.pathname.startsWith("/budgets")
        },
        {
          text: "Trash",
          icon: <DeleteOutlined className={"icon"} />,
          onClick: () => history.push("/trash"),
          active: location.pathname.startsWith("/trash")
        },
        {
          text: "Contacts",
          icon: <ContactsOutlined className={"icon"} />,
          onClick: () => history.push("/contacts"),
          active: location.pathname.startsWith("/contacts")
        }
      ]}
    >
      <Switch>
        <Route exact path={"/contacts"} component={Contacts} />
        <Route exact path={"/budgets"} component={Budgets} />
        <Route exact path={"/templates"} component={Templates} />
        <Route exact path={"/trash"} component={Trash} />
      </Switch>
    </Layout>
  );
};

export default Dashboard;
