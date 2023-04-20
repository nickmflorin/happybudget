import type { NextPage } from "next";

import { config } from "application";
import { Page } from "components/layout";

const Dashboard: NextPage = () => (
  <Page id={config.PageIds.BUDGETS}>
    <h4>Welcome to HappyBudget</h4>
  </Page>
);

export default Dashboard;
