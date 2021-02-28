import React from "react";
import { Switch } from "react-router-dom";

import { LandingRoute } from "./routes";

const Login = React.lazy(() => import("components/auth/Login"));

const Landing = (): JSX.Element => {
  return (
    <Switch>
      <LandingRoute exact path={"/login"} component={Login} />
    </Switch>
  );
};

export default Landing;
