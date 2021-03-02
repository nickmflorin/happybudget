import React from "react";
import { Route, Switch } from "react-router-dom";

import { Page } from "components/layout";

const Contacts = React.lazy(() => import("./Contacts"));
const Budgets = React.lazy(() => import("./Budgets"));

const Dashboard = (): JSX.Element => {
  return (
    <Page className={"dashboard"} header={"Dashboard"}>
      <Switch>
        <Route exact path={"/contacts"} component={Contacts} />
        <Route exact path={"/budgets"} component={Budgets} />
      </Switch>
    </Page>
  );
};

export default Dashboard;
