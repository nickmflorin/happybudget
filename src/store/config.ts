import BudgetingReduxConfig from "app/Budgeting/config";
import DashboardReduxConfig from "app/Dashboard/config";

const ApplicationReduxConfig: Redux.ApplicationConfig = [DashboardReduxConfig, BudgetingReduxConfig];

export default ApplicationReduxConfig;
