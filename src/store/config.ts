import BudgetingReduxConfig from "app/Budgeting/config";
import DashboardReduxConfig from "app/Dashboard/config";

const ApplicationReduxConfig: Modules.ApplicationConfig = [DashboardReduxConfig, BudgetingReduxConfig];

export default ApplicationReduxConfig;
