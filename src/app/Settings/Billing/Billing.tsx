import React, { useState } from "react";

import * as api from "api";
import { notifications } from "lib";

import { ProductsManager } from "components/billing";

const Billing = (): JSX.Element => {
  const [subscribing, setSubscribing] = useState(false);
  const [managing, setManaging] = useState(false);

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
              notifications.ui.handleBannerRequestError(e, {
                message: "There was an error connecting you to the customer portal."
              })
            )
            .finally(() => setManaging(false));
        }}
        onSubscribe={(p: Model.Product) => {
          setSubscribing(true);
          api
            .createCheckoutSession({ price_id: p.price_id })
            .then((response: { redirect_url: string }) => {
              window.location.href = response.redirect_url;
            })
            .catch((e: Error) =>
              notifications.ui.handleBannerRequestError(e, { message: "There was an error during checkout." })
            )
            .finally(() => setSubscribing(false));
        }}
      />
    </div>
  );
};

export default React.memo(Billing);
