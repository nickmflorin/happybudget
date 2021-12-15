import { useEffect, useState } from "react";
import { Redirect, useLocation } from "react-router-dom";
import { isNil } from "lodash";

import * as api from "api";
import { util } from "lib";
import { ApplicationSpinner } from "components";

type IRedirect = {
  readonly pathname: "/login";
  readonly state?: {
    readonly error?: Error;
    readonly tokenType?: Http.TokenType;
    readonly notification?: AppNotification;
  };
};

const EmailVerification = (): JSX.Element => {
  const [redirect, setRedirect] = useState<IRedirect | undefined>(undefined);
  const location = useLocation();

  useEffect(() => {
    const searchParams = util.urls.getQueryParams(location.search);
    if (!isNil(searchParams.token)) {
      api
        .validateEmailConfirmationToken(searchParams.token)
        .then(() => {
          setRedirect({
            pathname: "/login",
            state: {
              notification: {
                closable: true,
                level: "success",
                message: "Your email address was successfully verified."
              }
            }
          });
        })
        .catch((e: Error) => {
          setRedirect({
            pathname: "/login",
            state: {
              error: e,
              tokenType: "email-confirmation"
            }
          });
        });
    } else {
      setRedirect({ pathname: "/login" });
    }
  }, [location.search]);

  if (!isNil(redirect)) {
    return <Redirect to={redirect} />;
  }
  return <ApplicationSpinner visible={true} />;
};

export default EmailVerification;
