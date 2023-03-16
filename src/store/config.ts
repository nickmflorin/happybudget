import {
  BudgetReduxConfig,
  TemplateReduxConfig,
  PublicBudgetReduxConfig,
} from "app/Budgeting/config";
import DashboardReduxConfig from "app/Dashboard/config";

const ModuleConfig: Application.ModuleConfig[] = [
  DashboardReduxConfig,
  BudgetReduxConfig,
  TemplateReduxConfig,
  PublicBudgetReduxConfig,
];

export default ModuleConfig;
