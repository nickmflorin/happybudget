import { Switch, useHistory, useLocation } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faFilePlus, faAddressBook } from "@fortawesome/pro-light-svg-icons";
import {
  faCopy as faCopySolid,
  faFilePlus as faFilePlusSolid,
  faAddressBook as faAddressBookSolid
} from "@fortawesome/pro-solid-svg-icons";

import { Layout } from "components/layout";
import { PrivateRoute } from "components/routes";
import { Contacts, Templates, Budgets } from "./components";

import "./components/index.scss";

const Dashboard = (): JSX.Element => {
  const history = useHistory();
  const location = useLocation();

  return (
    <Layout
      sidebar={[
        {
          text: "Templates",
          icon: <FontAwesomeIcon icon={faFilePlus} />,
          activeIcon: <FontAwesomeIcon icon={faFilePlusSolid} />,
          onClick: () => history.push("/templates"),
          active: location.pathname.startsWith("/templates") || location.pathname.startsWith("/discover")
        },
        {
          text: "My Budgets",
          icon: <FontAwesomeIcon icon={faCopy} />,
          activeIcon: <FontAwesomeIcon icon={faCopySolid} />,
          onClick: () => history.push("/budgets"),
          active: location.pathname.startsWith("/budgets")
        },
        {
          text: "Contacts",
          icon: <FontAwesomeIcon icon={faAddressBook} flip={"horizontal"} />,
          activeIcon: <FontAwesomeIcon icon={faAddressBookSolid} flip={"horizontal"} />,
          onClick: () => history.push("/contacts"),
          active: location.pathname.startsWith("/contacts")
        }
      ]}
      showHeaderLogo={true}
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
