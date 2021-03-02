import React from "react";
import { Redirect, Switch, Route, useHistory, useLocation } from "react-router-dom";

import { FileAddOutlined, ContactsOutlined, FolderOutlined, DeleteOutlined } from "@ant-design/icons";

import { Logout } from "components/auth";
import { Layout } from "components/layout";
import { ApplicationRoute } from "components/routes";

const Dashboard = React.lazy(() => import("./Dashboard"));
const Budget = React.lazy(() => import("./Budget"));

const Application = (): JSX.Element => {
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
        <Redirect exact from={"/"} to={"/budgets"} />
        <ApplicationRoute exact path={"/budgets/:budgetId"} component={Budget} />
        <ApplicationRoute path={["/budgets", "/contacts", "/templates", "/trash"]} component={Dashboard} />
        <Route exact path={"/logout"} component={Logout} />
      </Switch>
    </Layout>
  );
};

export default Application;
