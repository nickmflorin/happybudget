import BudgetsReduxConfig from "components/scenes/Application/Dashboard/config";
import CalculatorReduxConfig from "components/scenes/Application/Budget/components/Calculator/config";
import BudgetReduxConfig from "components/scenes/Application/Budget/config";
import ActualsReduxConfig from "components/scenes/Application/Budget/components/Actuals/config";

const ApplicationReduxConfig: Redux.IApplicationConfig = [
  BudgetsReduxConfig,
  BudgetReduxConfig,
  CalculatorReduxConfig,
  ActualsReduxConfig
];

export default ApplicationReduxConfig;
