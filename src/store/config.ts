import BudgetReduxConfig from "app/Budget/config";
import CalculatorReduxConfig from "app/Budget/Calculator/config";
import ActualsReduxConfig from "app/Budget/Actuals/config";
import DashboardReduxConfig from "app/Dashboard/config";

const ApplicationReduxConfig: Redux.IApplicationConfig = [
  DashboardReduxConfig,
  BudgetReduxConfig,
  CalculatorReduxConfig,
  ActualsReduxConfig
];

export default ApplicationReduxConfig;
