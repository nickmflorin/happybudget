import React from "react";
import { Route, Switch } from "react-router-dom";

import { ApplicationRoute } from "./routes";

const Admin = React.lazy(() => import("components/admin"));
const Logout = React.lazy(() => import("components/auth/Logout"));
const Swagger = React.lazy(() => import("components/swagger"));
const WorkSpace = React.lazy(() => import("components/workspace"));

const Application = (): JSX.Element => {
  return (
    <React.Fragment>
      <Switch>
        <ApplicationRoute component={Admin} path={"/admin"} />
        <ApplicationRoute component={Swagger} exact path={"/documentation"} />
        <Route exact path={"/logout"} component={Logout} />
        <ApplicationRoute path={"/"} component={WorkSpace} />
      </Switch>
    </React.Fragment>
  );
};

export default Application;
