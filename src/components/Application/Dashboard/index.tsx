import React from "react";
import { Route, Switch } from "react-router-dom";

const Contacts = React.lazy(() => import("./Contacts"));
const Budgets = React.lazy(() => import("./Budgets"));
const Templates = React.lazy(() => import("./Templates"));
const Trash = React.lazy(() => import("./Trash"));

const Dashboard = (): JSX.Element => {
  return (
    <Switch>
      <Route exact path={"/contacts"} component={Contacts} />
      <Route exact path={"/budgets"} component={Budgets} />
      <Route exact path={"/templates"} component={Templates} />
      <Route exact path={"/trash"} component={Trash} />
    </Switch>
  );
};

export default Dashboard;
