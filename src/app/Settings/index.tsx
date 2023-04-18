import React from "react";

import { Switch, useHistory, useLocation } from "react-router-dom";

import * as config from "application/config";
import { Icon } from "components";
import { ExpandedLayout } from "components/layoutOld";
import { ConfigRoute, Route } from "components/routes";

const Profile = config.lazyWithRetry(() => import("./Profile"));
const Security = config.lazyWithRetry(() => import("./Security"));
const Billing = config.lazyWithRetry(() => import("./Billing"));

const Settings = (): JSX.Element => {
  const history = useHistory();
  const location = useLocation();

  return (
    <ExpandedLayout
      sidebar={[
        {
          label: "Profile",
          icon: <Icon icon="address-card" weight="light" />,
          activeIcon: <Icon icon="address-card" weight="solid" />,
          onClick: () => history.push("/profile"),
          active: location.pathname.startsWith("/profile"),
        },
        {
          label: "Security",
          icon: <Icon icon="shield-check" weight="light" />,
          activeIcon: <Icon icon="shield-check" weight="solid" />,
          onClick: () => history.push("/security"),
          active: location.pathname.startsWith("/security"),
        },
        {
          label: "Billing",
          icon: <Icon icon="wallet" weight="light" />,
          activeIcon: <Icon icon="wallet" weight="solid" />,
          onClick: () => history.push("/billing"),
          active: location.pathname.startsWith("/billing"),
          hidden: !config.env.BILLING_ENABLED,
        },
      ]}
    >
      <Switch>
        <Route exact path="/profile" component={Profile} />
        <Route exact path="/security" component={Security} />
        <ConfigRoute
          path="/billing"
          component={Billing}
          forceReloadFromStripe={true}
          enabled={config.env.BILLING_ENABLED}
        />
      </Switch>
    </ExpandedLayout>
  );
};

export default React.memo(Settings);
