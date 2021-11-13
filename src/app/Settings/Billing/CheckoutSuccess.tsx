import { useEffect, useState } from "react";
import { Redirect, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { isNil } from "lodash";

import * as api from "api";
import { users } from "lib";
import { actions } from "store";

import { ApplicationSpinner } from "components";

type IRedirect = {
  readonly pathname: "/billing";
  readonly state?: {
    readonly notification?: UINotificationData;
  };
};

const CheckoutSuccess = (): JSX.Element => {
  const [redirect, setRedirect] = useState<IRedirect | null>(null);
  const user = users.hooks.useLoggedInUser();
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
          dispatch(actions.authenticated.updateLoggedInUserAction(u));
          setRedirect({ pathname: "/billing" });
        })
        .catch((e: Error) => {
          console.error(e);
          /* If the user incidentally visits this page without having been
             redirected from Stripe, the backend will be aware of this and will
             respond with `checkout_session_inactive`.  In this case, we do not
             want to issue a warning indicating that the checkout session needs
             to be manually associated with the user. */
          const isSuperficialError =
            e instanceof api.ClientError &&
            e.billingError !== null &&
            e.billingError.code === "checkout_session_inactive";
          if (!isSuperficialError) {
            console.error(
              `FATAL Error: Could not sync the checkout session with ID ${sessionId} for user ${user.id}.` +
                "This either means that the user is subscribed to products in Stripe but has not " +
                "been associated with that subscription in our database.  This needs to be done manually."
            );
            setRedirect({
              pathname: "/billing",
              state: {
                notification: {
                  level: "error",
                  message: "There was an error completing the checkout process.",
                  detail: "Please contact support before you can access the features you are entitled to."
                }
              }
            });
          } else {
            setRedirect({ pathname: "/billing" });
          }
        });
    }
  }, [location.search]);

  if (!isNil(redirect)) {
    return <Redirect to={redirect} />;
  }
  return <ApplicationSpinner visible={true} />;
};

export default CheckoutSuccess;
