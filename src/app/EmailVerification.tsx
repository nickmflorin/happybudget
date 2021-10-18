import { useEffect, useState } from "react";
import { Redirect, useLocation } from "react-router-dom";
import { isNil } from "lodash";

import * as api from "api";
import { util } from "lib";
import { ApplicationSpinner } from "components";

const EmailVerification = (): JSX.Element => {
  const [redirect, setRedirect] = useState(false);
  const [redirectError, setRedirectError] = useState<Error | undefined>(undefined);
  const location = useLocation();

  useEffect(() => {
    const searchParams = util.urls.getQueryParams(location.search);
    if (!isNil(searchParams.token)) {
      api
        .validateEmailConfirmationToken(searchParams.token)
        .then(() => setRedirect(true))
        .catch((e: Error) => {
          setRedirectError(e);
          setRedirect(true);
        });
    } else {
      setRedirect(true);
    }
  }, [location.search]);

  if (redirect === true) {
    return <Redirect to={{ pathname: "/login", state: { error: redirectError } }} />;
  }
  return <ApplicationSpinner visible={true} />;
};

export default EmailVerification;
