import React from "react";
import { Switch, useHistory, useLocation } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolderOpen, faFolderPlus, faAddressBook } from "@fortawesome/free-solid-svg-icons";

import { componentLoader } from "lib/operational";
import { Layout } from "components/layout";
import { PrivateRoute } from "components/routes";

const Contacts = React.lazy(() => componentLoader(() => import("./Contacts")));
const NewProject = React.lazy(() => componentLoader(() => import("./NewProject")));
const Budgets = React.lazy(() => componentLoader(() => import("./Budgets")));

const Dashboard = (): JSX.Element => {
  const history = useHistory();
  const location = useLocation();

  return (
    <Layout
      sidebar={[
        {
          text: "New Project",
          icon: <FontAwesomeIcon icon={faFolderPlus} />,
          onClick: () => history.push("/new"),
          active: location.pathname.startsWith("/new")
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
        <PrivateRoute path={"/new"} component={NewProject} />
      </Switch>
    </Layout>
  );
};

export default Dashboard;
