import { Switch, useHistory, useLocation } from "react-router-dom";

import { Icon } from "components";
import { Layout } from "components/layout";
import { PrivateRoute } from "components/routes";
import { Contacts, Templates, Budgets } from "./components";

import "./index.scss";

const Dashboard = (): JSX.Element => {
  const history = useHistory();
  const location = useLocation();

  return (
    <Layout
      sidebar={[
        {
          text: "Templates",
          icon: <Icon icon={"file-plus"} weight={"light"} />,
          activeIcon: <Icon icon={"file-plus"} weight={"solid"} />,
          onClick: () => history.push("/templates"),
          active: location.pathname.startsWith("/templates") || location.pathname.startsWith("/discover")
        },
        {
          text: "My Budgets",
          icon: <Icon icon={"copy"} weight={"light"} />,
          activeIcon: <Icon icon={"copy"} weight={"solid"} />,
          onClick: () => history.push("/budgets"),
          active: location.pathname.startsWith("/budgets")
        },
        {
          text: "Contacts",
          icon: <Icon icon={"address-book"} weight={"light"} flip={"horizontal"} />,
          activeIcon: <Icon icon={"address-book"} weight={"solid"} flip={"horizontal"} />,
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
