import type { NextPage } from "next";

import * as config from "config";
import { Page } from "components/layout";

const Dashboard: NextPage = () => (
  <Page id={config.PageIds.DASHBOARD}>
    <h4>Welcome to HappyBudget</h4>
  </Page>
);

export default Dashboard;
