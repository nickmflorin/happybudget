import React from "react";

import { Switch } from "react-router-dom";

import { PathParamsRoute } from "deprecated/components/routes";

import { PublicBudget } from "./Budgeting";

const PublicApplication = (): JSX.Element => (
  <Switch>
    <PathParamsRoute<{ budgetId: number; tokenId: string }>
      pub={true}
      params={["budgetId", "tokenId"]}
      path="/pub/:tokenId/budgets/:budgetId"
      numericIdParams={["budgetId"]}
      component={PublicBudget}
    />
  </Switch>
);

export default React.memo(PublicApplication);
