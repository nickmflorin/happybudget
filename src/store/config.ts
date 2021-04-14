import BudgetReduxConfig from "app/Budget/config";
import DashboardReduxConfig from "app/Dashboard/config";

const ApplicationReduxConfig: Redux.ApplicationConfig = [DashboardReduxConfig, BudgetReduxConfig];

export default ApplicationReduxConfig;
