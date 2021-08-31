import BudgetReduxConfig from "app/Budget/config";
import TemplateReduxConfig from "app/Template/config";
import DashboardReduxConfig from "app/Dashboard/config";
import ShareReduxConfig from "app/Share/config";

const GlobalReduxConfig: Application.AnyModuleConfig[] = [
  DashboardReduxConfig,
  BudgetReduxConfig,
  TemplateReduxConfig,
  ShareReduxConfig
];

export default GlobalReduxConfig;
