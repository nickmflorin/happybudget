import React from "react";
import { Switch } from "react-router-dom";

import { LandingRoute } from "./routes";

const Login = React.lazy(() => import("components/auth/Login"));
const Reset = React.lazy(() => import("components/auth/Reset"));
const SocialRegistration = React.lazy(() => import("components/auth/SocialRegistration"));

const Landing = (): JSX.Element => {
  return (
    <Switch>
      <LandingRoute component={Reset} path={"/reset"} />
      <LandingRoute component={SocialRegistration} exact path={"/register"} footer={false} />
      <LandingRoute exact path={"/changepassword"} render={(props: any) => <Reset change {...props} />} />
      <LandingRoute exact path={"/login"} component={Login} />
    </Switch>
  );
};

export default Landing;
