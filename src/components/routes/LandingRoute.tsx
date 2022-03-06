import React, { useState, useEffect } from "react";
import { Route, RouteProps, Redirect } from "react-router-dom";
import { isNil } from "lodash";

import * as api from "api";
import { ApplicationSpinner } from "components";

type RedirectPath = "/";

const LandingRoute = (props: RouteProps): JSX.Element => {
  const [checkingAuthentication, setCheckingAuthentication] = useState(true);
  const [redirect, setRedirect] = useState<RedirectPath | null>(null);
  const [newCancelToken] = api.useCancelToken();

  useEffect(() => {
    api
      .validateAuthToken({ force_reload_from_stripe: false }, { cancelToken: newCancelToken() })
      .then(() => setRedirect("/"))
      .catch((e: Error) => {
        if (e instanceof api.ClientError && !isNil(e.authenticationError)) {
          setCheckingAuthentication(false);
        } else {
          throw e;
        }
      });
  }, []);

  if (redirect !== null) {
    return <Redirect to={redirect} />;
  } else if (checkingAuthentication) {
    return <ApplicationSpinner visible={true} />;
  } else {
    return (
      <div className={"landing-content"}>
        <Route {...props} />
      </div>
    );
  }
};

export default React.memo(LandingRoute);
