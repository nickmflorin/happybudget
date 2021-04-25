import React from "react";
import { Switch, useHistory, useLocation } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolderOpen, faFolderPlus, faAddressBook } from "@fortawesome/pro-light-svg-icons";

import { componentLoader } from "lib/operational";
import { Layout } from "components/layout";
import { PrivateRoute } from "components/routes";

const Contacts = React.lazy(() => componentLoader(() => import("./components/Contacts")));
const Templates = React.lazy(() => componentLoader(() => import("./components/Templates")));
const Budgets = React.lazy(() => componentLoader(() => import("./components/Budgets")));

const Dashboard = (): JSX.Element => {
  const history = useHistory();
  const location = useLocation();

  return (
    <Layout
      sidebar={[
        {
          text: "Templates",
          icon: <FontAwesomeIcon icon={faFolderPlus} />,
          onClick: () => history.push("/templates"),
          active: location.pathname.startsWith("/templates") || location.pathname.startsWith("/discover")
        },
        {
          text: "My Budgets",
          icon: <FontAwesomeIcon icon={faFolderOpen} />,
          onClick: () => history.push("/budgets"),
          active: location.pathname.startsWith("/budgets")
        },
        {
          text: "Contacts",
          icon: <FontAwesomeIcon icon={faAddressBook} />,
          onClick: () => history.push("/contacts"),
          active: location.pathname.startsWith("/contacts")
        }
      ]}
    >
      <Switch>
        <PrivateRoute exact path={"/contacts"} component={Contacts} />
        <PrivateRoute exact path={"/budgets"} component={Budgets} />
        <PrivateRoute path={["/templates", "/discover"]} component={Templates} />
      </Switch>
    </Layout>
  );
};

export default Dashboard;
