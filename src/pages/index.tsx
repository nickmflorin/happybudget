import type { NextPage } from "next";

import * as config from "application/config";
import { Page } from "components/layoutOld";

const Dashboard: NextPage = () => (
  <Page id={config.PageIds.DASHBOARD}>
    <h4>Welcome to HappyBudget</h4>
  </Page>
);

export default Dashboard;
