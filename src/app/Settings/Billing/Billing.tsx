import { useState, useEffect } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { isNil } from "lodash";

import * as api from "api";
import { notifications } from "lib";
import * as store from "store";

import { ProductsManager } from "components/model/billing";

const Billing = (): JSX.Element => {
  const [subscribing, setSubscribing] = useState<Model.ProductId | null>(null);
  const [managing, setManaging] = useState(false);
  const user = store.hooks.useLoggedInUser();
  const history = useHistory();
  const location = useLocation<{
    readonly notification?: UINotificationData;
    readonly error?: Error;
    readonly sessionId: string;
  }>();

  useEffect(() => {
    const handleError = (e: Error, sessionId: string) => {
      /* If the user incidentally visits the checkout success page without
			   having been redirected from Stripe, the backend will be aware of this
				 and will respond with `checkout_session_inactive`.  In this case, we do
				 not want to issue a warning indicating that the checkout session needs
				 to be manually associated with the user. */
      const isSuperficialError = e instanceof api.BillingError && e.code === "checkout_session_inactive";
      if (!isSuperficialError) {
        console.error(
          `FATAL Error: Could not sync the checkout session with ID ${sessionId} for user ${user.id}.` +
            "This means that the user is subscribed to products in Stripe but has not " +
            "been associated with that subscription in our database.  This needs to be done manually." +
            `\nOriginal Error: ${String(e)}`
        );
        notifications.ui.banner.notify({
          level: "error",
          message: "Checkout Error",
          detail: "Please contact support before you can access the features you are entitled to."
        });
      }
    };

    const locationState = location.state;
    if (!isNil(locationState)) {
      /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
      const { state, ...statelessLocation } = location;
      history.replace(statelessLocation);
      if (!isNil(locationState.error)) {
        const e = locationState.error;
        handleError(e, locationState.sessionId);
      } else if (!isNil(locationState.notification)) {
        notifications.ui.banner.notify(locationState.notification);
      }
    }
  }, [location.state]);

  return (
    <div style={{ maxWidth: 800 }}>
      <ProductsManager
        subscribing={subscribing}
        managing={managing}
        onManage={() => {
          setManaging(true);
          api
            .createPortalSession({})
            .then((response: { redirect_url: string }) => {
              window.location.href = response.redirect_url;
            })
            .catch((e: Error) =>
              notifications.ui.banner.handleRequestError(e, {
                message: "There was an error connecting you to the customer portal."
              })
            )
            .finally(() => setManaging(false));
        }}
        onSubscribe={(p: Model.Product) => {
          setSubscribing(p.id);
          api
            .createCheckoutSession({ price_id: p.price_id })
            .then((response: { redirect_url: string }) => {
              window.location.href = response.redirect_url;
            })
            .catch((e: Error) =>
              notifications.ui.banner.handleRequestError(e, { message: "There was an error during checkout." })
            )
            .finally(() => setSubscribing(null));
        }}
      />
    </div>
  );
};

export default Billing;
