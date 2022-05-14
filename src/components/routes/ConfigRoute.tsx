import React, { useState, useEffect } from "react";
import { Redirect } from "react-router-dom";

import Route, { RouteProps } from "./Route";

type RedirectPath = "/404";

type ConfigRouteProps = RouteProps & {
  readonly enabled: boolean;
};

const ConfigRoute = ({ enabled, ...props }: ConfigRouteProps): JSX.Element => {
  const [redirect, setRedirect] = useState<RedirectPath | null>(null);

  useEffect(() => {
    if (enabled === false) {
      setRedirect("/404");
    } else {
      setRedirect(null);
    }
  }, [enabled]);

  if (redirect !== null) {
    return <Redirect to={redirect} />;
  } else {
    return <Route {...props} />;
  }
};

export default React.memo(ConfigRoute);
