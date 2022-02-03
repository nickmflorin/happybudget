import { BudgetReduxConfig, TemplateReduxConfig, PublicBudgetReduxConfig } from "app/Budgeting/config";
import DashboardReduxConfig from "app/Dashboard/config";

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const ModuleConfig: Application.ModuleConfig<any>[] = [
  DashboardReduxConfig,
  BudgetReduxConfig,
  TemplateReduxConfig,
  PublicBudgetReduxConfig
];

export default ModuleConfig;
