import React from "react";
import { Redirect, Switch, Route, useHistory, useLocation } from "react-router-dom";

import { HomeOutlined, DeleteOutlined, FolderOutlined } from "@ant-design/icons";

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
          text: "Dashboard",
          icon: <HomeOutlined className={"icon"} />,
          onClick: () => history.push("/"),
          active: location.pathname.startsWith("/")
        },
        {
          text: "Budgets",
          icon: <FolderOutlined className={"icon"} />,
          onClick: () => history.push("/budgets"),
          active: location.pathname.startsWith("/budgets")
        },
        {
          text: "Contacts",
          icon: <DeleteOutlined className={"icon"} />,
          onClick: () => history.push("/contacts"),
          active: location.pathname.startsWith("/contacts")
        }
      ]}
    >
      <Switch>
        <Redirect exact from={"/"} to={"/budgets"} />
        <ApplicationRoute path={["/budgets", "/contacts"]} component={Dashboard} />
        <ApplicationRoute exact path={"/budgets/:budgetId"} component={Budget} />
        <Route exact path={"/logout"} component={Logout} />
      </Switch>
    </Layout>
  );
};

export default Application;
