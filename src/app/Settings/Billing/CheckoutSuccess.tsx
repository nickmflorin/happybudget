import { useEffect, useState } from "react";
import { Redirect, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { isNil } from "lodash";

import * as api from "api";
import { actions } from "store";

import { ApplicationSpinner } from "components";

type IRedirect = {
  readonly pathname: "/billing";
  readonly state?: {
    readonly notification?: UINotificationData;
    readonly error?: Error;
    readonly sessionId: string;
  };
};

const CheckoutSuccess = (): JSX.Element => {
  const [redirect, setRedirect] = useState<IRedirect | null>(null);
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    /* If the sessionId is not included as a query parameter, this means the
       success page is not being redirected to from Stripe but is likely being
       manually visited by the User.  In this case, we do not want to issue an
			 error that there was a problem with the sync, because we would get false
       positives everytime a user visited `/checkout-success` incidentally.
       Note: This does not protect us against users manually visiting this route
       with invalid or expired session IDs - but we let the backend worry about
       that. */
    const query = new URLSearchParams(location.search);
    const sessionId = query.get("sessionId");

    if (isNil(sessionId) || sessionId === "") {
      setRedirect({ pathname: "/billing" });
    } else {
      api
        .syncCheckoutSession({ session_id: sessionId })
        .then((u: Model.User) => {
          dispatch(actions.updateLoggedInUserAction(u));
          setRedirect({
            pathname: "/billing",
            state: {
              sessionId,
              notification: {
                closable: true,
                level: "success",
                message: "Your checkout was successful.  Thank you."
              }
            }
          });
        })
        .catch((e: Error) => setRedirect({ pathname: "/billing", state: { sessionId, error: e } }));
    }
  }, [location.search]);

  if (!isNil(redirect)) {
    return <Redirect to={redirect} />;
  }
  return <ApplicationSpinner visible={true} />;
};

export default CheckoutSuccess;
