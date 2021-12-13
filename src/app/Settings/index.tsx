import { Switch, useHistory, useLocation } from "react-router-dom";

import { Icon } from "components";
import { ExpandedLayout } from "components/layout";
import { PrivateRoute } from "components/routes";
import * as config from "config";

const Profile = config.lazyWithRetry(() => import("./Profile"));
const Security = config.lazyWithRetry(() => import("./Security"));

const Settings = (): JSX.Element => {
  const history = useHistory();
  const location = useLocation();

  return (
    <ExpandedLayout
      sidebar={[
        {
          label: "Profile",
          icon: <Icon icon={"address-card"} weight={"light"} />,
          activeIcon: <Icon icon={"address-card"} weight={"solid"} />,
          onClick: () => history.push("/profile"),
          active: location.pathname.startsWith("/profile")
        },
        {
          label: "Security",
          icon: <Icon icon={"shield-check"} weight={"light"} />,
          activeIcon: <Icon icon={"shield-check"} weight={"solid"} />,
          onClick: () => history.push("/security"),
          active: location.pathname.startsWith("/security")
        }
      ]}
    >
      <Switch>
        <PrivateRoute exact path={"/profile"} component={Profile} />
        <PrivateRoute exact path={"/security"} component={Security} />
      </Switch>
    </ExpandedLayout>
  );
};

export default Settings;
