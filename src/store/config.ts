import BudgetingReduxConfig from "app/Budgeting/config";
import DashboardReduxConfig from "app/Dashboard/config";
import ShareReduxConfig from "app/Share/config";

const GlobalReduxConfig: Modules.ModuleConfigs = [DashboardReduxConfig, BudgetingReduxConfig, ShareReduxConfig];

export default GlobalReduxConfig;
