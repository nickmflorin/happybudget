import { Route, Switch, useHistory, useLocation } from "react-router-dom";

import { Icon } from "components";
import { ExpandedLayout } from "components/layout";
import { Contacts, Templates, Budgets } from "./components";

const Dashboard = (): JSX.Element => {
  const history = useHistory();
  const location = useLocation();

  return (
    <ExpandedLayout
      sidebar={[
        {
          label: "Templates",
          icon: <Icon icon={"file-plus"} weight={"light"} />,
          activeIcon: <Icon icon={"file-plus"} weight={"solid"} />,
          submenu: [
            {
              label: "Discover",
              icon: <Icon icon={"users"} weight={"light"} />,
              activeIcon: <Icon icon={"users"} weight={"solid"} />,
              onClick: () => history.push("/discover"),
              active: location.pathname.startsWith("/discover")
            },
            {
              label: "My Templates",
              icon: <Icon icon={"folder-open"} weight={"light"} />,
              activeIcon: <Icon icon={"folder-open"} weight={"solid"} />,
              onClick: () => history.push("/templates"),
              active: location.pathname.startsWith("/templates")
            }
          ]
        },
        {
          label: "My Budgets",
          icon: <Icon icon={"copy"} weight={"light"} />,
          activeIcon: <Icon icon={"copy"} weight={"solid"} />,
          onClick: () => history.push("/budgets"),
          active: location.pathname.startsWith("/budgets")
        },
        {
          label: "Contacts",
          icon: <Icon icon={"address-book"} weight={"light"} flip={"horizontal"} />,
          activeIcon: <Icon icon={"address-book"} weight={"solid"} flip={"horizontal"} />,
          onClick: () => history.push("/contacts"),
          active: location.pathname.startsWith("/contacts")
        }
      ]}
      showHeaderLogo={true}
    >
      <Switch>
        <Route exact path={"/contacts"} component={Contacts} />
        <Route exact path={"/budgets"} component={Budgets} />
        <Route path={["/templates", "/discover"]} component={Templates} />
      </Switch>
    </ExpandedLayout>
  );
};

export default Dashboard;
