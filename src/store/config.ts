import BudgetReduxConfig from "app/Budgeting/config";
import DashboardReduxConfig from "app/Dashboard/config";

const ApplicationReduxConfig: Redux.ApplicationConfig = [
  DashboardReduxConfig,
  BudgetReduxConfig.budget,
  BudgetReduxConfig.template
];

export default ApplicationReduxConfig;
