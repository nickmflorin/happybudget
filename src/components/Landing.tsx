import React from "react";
import { Route, Switch } from "react-router-dom";

const Login = React.lazy(() => import("components/auth/Login"));

const Landing = (): JSX.Element => {
  return (
    <div className={"landing"}>
      <Switch>
        <Route exact path={"/login"} component={Login} />
      </Switch>
    </div>
  );
};

export default Landing;
