import React from "react";
import { Switch, useHistory, useLocation } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolderOpen, faFolderPlus, faAddressBook } from "@fortawesome/free-solid-svg-icons";

import { Layout } from "components/layout";
import { PrivateRoute } from "components/routes";

const Contacts = React.lazy(() => import("./Contacts"));
const Budgets = React.lazy(() => import("./Budgets/Active"));
const Trash = React.lazy(() => import("./Budgets/Trash"));
const Templates = React.lazy(() => import("./Templates"));

const Dashboard = (): JSX.Element => {
  const history = useHistory();
  const location = useLocation();

  return (
    <Layout
      sidebar={[
        {
          text: "New Budget",
          icon: <FontAwesomeIcon icon={faFolderPlus} />,
          onClick: () => history.push("/templates"),
          active: location.pathname.startsWith("/templates")
        },
        {
          text: "Budgets",
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
        <PrivateRoute exact path={"/templates"} component={Templates} />
        <PrivateRoute exact path={"/trash"} component={Trash} />
      </Switch>
    </Layout>
  );
};

export default Dashboard;
