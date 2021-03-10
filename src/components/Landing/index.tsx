import React from "react";
import { Route, Switch } from "react-router-dom";

import { LogoWhite } from "components/svgs";
import "./index.scss";

const Login = React.lazy(() => import("./Login"));
const Signup = React.lazy(() => import("./Signup"));

const Landing = (): JSX.Element => {
  return (
    <div className={"landing-page"}>
      <div className={"landing-page-left"}>
        <Switch>
          <Route exact path={"/login"} component={Login} />
          <Route exact path={"/signup"} component={Signup} />
        </Switch>
      </div>
      <div className={"landing-page-right"}>
        <div className={"logo-container"}>
          <LogoWhite />
        </div>
      </div>
    </div>
  );
};

export default Landing;
