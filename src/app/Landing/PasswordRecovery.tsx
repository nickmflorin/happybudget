import { useEffect, useState } from "react";
import { Redirect, useLocation } from "react-router-dom";
import { isNil } from "lodash";

import * as api from "api";
import { util } from "lib";
import { ApplicationSpinner } from "components";

type Destination = "/login" | "/reset-password";

type IRedirect = {
  readonly pathname: Destination;
  readonly state: {
    readonly error: Error | undefined;
    readonly tokenType?: Http.TokenType;
    readonly token: string | undefined;
  };
};

const PasswordRecovery = (): JSX.Element => {
  const [redirect, setRedirect] = useState<IRedirect | undefined>(undefined);
  const location = useLocation();

  useEffect(() => {
    const searchParams = util.urls.getQueryParams(location.search);
    if (!isNil(searchParams.token)) {
      api
        .validatePasswordRecoveryToken(searchParams.token)
        .then(() => {
          setRedirect({
            pathname: "/reset-password",
            state: {
              error: undefined,
              token: searchParams.token
            }
          });
        })
        .catch((e: Error) => {
          setRedirect({
            pathname: "/login",
            state: {
              error: e,
              token: undefined,
              tokenType: "password-recovery"
            }
          });
        });
    } else {
      setRedirect({
        pathname: "/login",
        state: {
          error: undefined,
          token: undefined,
          tokenType: "password-recovery"
        }
      });
    }
  }, [location.search]);

  if (!isNil(redirect)) {
    return <Redirect to={redirect} />;
  }
  return <ApplicationSpinner visible={true} />;
};

export default PasswordRecovery;
