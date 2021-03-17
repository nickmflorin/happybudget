import React from "react";
import { Switch, useHistory, useLocation } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAddressCard } from "@fortawesome/free-solid-svg-icons";

import { Layout } from "components/layout";
import { PrivateRoute } from "components/routes";

const Profile = React.lazy(() => import("./Profile"));

const Settings = (): JSX.Element => {
  const history = useHistory();
  const location = useLocation();

  return (
    <Layout
      sidebar={[
        {
          text: "Profile",
          icon: <FontAwesomeIcon icon={faAddressCard} />,
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
