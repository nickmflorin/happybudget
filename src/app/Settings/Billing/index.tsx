import { Switch } from "react-router-dom";

import { Page } from "components/layout";
import { PrivateRoute } from "components/routes";

import Billing from "./Billing";
import CheckoutSuccess from "./CheckoutSuccess";
import CheckoutCancelled from "./CheckoutCancelled";

const BillingRoot = (): JSX.Element => {
  return (
    <Page className={"billing"} title={"Billing"}>
      <Switch>
        <PrivateRoute path={"/billing/checkout-success"} component={CheckoutSuccess} />
        <PrivateRoute path={"/billing/checkout-cancel"} component={CheckoutCancelled} />
        <PrivateRoute path={"/billing"} component={Billing} />
      </Switch>
    </Page>
  );
};

export default BillingRoot;
