import BudgetReduxConfig from "app/Budget/config";
import DashboardReduxConfig from "app/Dashboard/config";

const ApplicationReduxConfig: Redux.IApplicationConfig = [DashboardReduxConfig, BudgetReduxConfig];

export default ApplicationReduxConfig;
