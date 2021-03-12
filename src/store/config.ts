import BudgetsReduxConfig from "scenes/Dashboard/config";
import CalculatorReduxConfig from "scenes/Budget/components/Calculator/config";
import BudgetReduxConfig from "scenes/Budget/config";
import ActualsReduxConfig from "scenes/Budget/components/Actuals/config";

const ApplicationReduxConfig: Redux.IApplicationConfig = [
  BudgetsReduxConfig,
  BudgetReduxConfig,
  CalculatorReduxConfig,
  ActualsReduxConfig
];

export default ApplicationReduxConfig;
