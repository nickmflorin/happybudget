import React from "react";
import { Route, RouteProps } from "react-router-dom";

const LandingRoute = (props: RouteProps): JSX.Element => (
  <div className={"landing-content"}>
    <Route {...props} />
  </div>
);

export default React.memo(LandingRoute);
