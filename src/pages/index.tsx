import type { NextPage } from "next";

import { Page } from "components/layout";
import * as config from "application/config";

const Dashboard: NextPage = () => (
  <Page id={config.PageIds.DASHBOARD}>
    <h4>Welcome to HappyBudget</h4>
  </Page>
);

export default Dashboard;
