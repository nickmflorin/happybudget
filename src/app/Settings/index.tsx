import { Switch, useHistory, useLocation } from "react-router-dom";

import { Icon } from "components";
import { Layout } from "components/layout";
import { PrivateRoute } from "components/routes";
import * as config from "config";

const Profile = config.lazyWithRetry(() => import("./Profile"));

const Settings = (): JSX.Element => {
  const history = useHistory();
  const location = useLocation();

  return (
    <Layout
      sidebar={[
        {
          label: "Profile",
          icon: <Icon icon={"address-card"} weight={"light"} />,
          activeIcon: <Icon icon={"address-card"} weight={"solid"} />,
          onClick: () => history.push("/profile"),
          active: location.pathname.startsWith("/profile")
        }
      ]}
    >
      <Switch>
        <PrivateRoute exact path={"/profile"} component={Profile} />
      </Switch>
    </Layout>
  );
};

export default Settings;
