import React from "react";
import { Route } from "react-router-dom";
import { ShowHide } from "components/display";
import { Footer } from "components/layout";

interface LandingRouteProps {
  footer?: boolean;
  [key: string]: any;
}

const LandingRoute = ({ footer = true, ...props }: LandingRouteProps): JSX.Element => {
  return (
    <div className={"landing-content"}>
      <Route {...props} />
      <ShowHide show={footer}>
        <Footer copyright brand={false} />
      </ShowHide>
    </div>
  );
};

export default LandingRoute;
