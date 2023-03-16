import { Switch } from "react-router-dom";

import { Page } from "components/layout";
import { Route } from "components/routes";

import Billing from "./Billing";
import CheckoutCancelled from "./CheckoutCancelled";
import CheckoutSuccess from "./CheckoutSuccess";

const BillingRoot = (): JSX.Element => (
  <Page className="billing" title="Billing">
    <Switch>
      <Route path="/billing/checkout-success" component={CheckoutSuccess} />
      <Route path="/billing/checkout-cancel" component={CheckoutCancelled} />
      <Route path="/billing" component={Billing} />
    </Switch>
  </Page>
);

export default BillingRoot;
