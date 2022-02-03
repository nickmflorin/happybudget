import React from "react";
import { Route as ReactRoute } from "react-router-dom";
import PrivateRoute, { PrivateRouteProps } from "./PrivateRoute";

export type RouteProps = PrivateRouteProps & {
  readonly pub?: boolean;
  readonly redux?: boolean;
};

const Route = ({ pub, forceReloadFromStripe, revalidate, redux, ...props }: RouteProps) =>
  pub === true || redux === false ? (
    <ReactRoute {...props} />
  ) : (
    <PrivateRoute {...props} forceReloadFromStripe={forceReloadFromStripe} revalidate={revalidate} />
  );

export default React.memo(Route);
