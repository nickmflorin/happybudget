import { useEffect, useState } from "react";

import { isNil, includes } from "lodash";
import { Redirect, useLocation } from "react-router-dom";

import * as api from "api";
import { http, notifications } from "lib";
import { ApplicationSpinner } from "components";

import { UITokenNotificationRedirectData } from "./Notifications";

type Destination = "/login" | "/reset-password";

type IRedirect = {
  readonly pathname: Destination;
  readonly state?: {
    readonly notifications?: UINotificationData[];
    readonly tokenNotification?: UITokenNotificationRedirectData;
    readonly token?: string | undefined;
  };
};

const PasswordRecovery = (): JSX.Element => {
  const [redirect, setRedirect] = useState<IRedirect | undefined>(undefined);
  const location = useLocation();
  const handler = notifications.ui.useNotifications({ defaultClosable: true });

  useEffect(() => {
    const searchParams = http.getQueryParams(location.search);
    if (!isNil(searchParams.token)) {
      api
        .validatePasswordRecoveryToken(searchParams.token)
        .then(() => {
          setRedirect({
            pathname: "/reset-password",
            state: { token: searchParams.token },
          });
        })
        .catch((e: Error) => {
          if (e instanceof api.RequestError) {
            if (
              e instanceof api.AuthenticationError &&
              includes(
                [api.ErrorCodes.auth.TOKEN_EXPIRED, api.ErrorCodes.auth.TOKEN_INVALID],
                e.code,
              )
            ) {
              setRedirect({
                pathname: "/login",
                state: {
                  tokenNotification: {
                    tokenType: "password-recovery",
                    userId: e.userId,
                    code: e.code as Http.TokenErrorCode,
                  },
                },
              });
            } else {
              setRedirect({
                pathname: "/login",
                state: {
                  notifications: handler.getRequestErrorNotifications(e),
                },
              });
            }
          } else {
            throw e;
          }
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

export default PasswordRecovery;
