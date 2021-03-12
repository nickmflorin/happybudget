import BudgetsReduxConfig from "components/Application/Dashboard/config";
import CalculatorReduxConfig from "components/Application/Budget/components/Calculator/config";
import BudgetReduxConfig from "components/Application/Budget/config";
import ActualsReduxConfig from "components/Application/Budget/components/Actuals/config";

const ApplicationReduxConfig: Redux.IApplicationConfig = [
  BudgetsReduxConfig,
  BudgetReduxConfig,
  CalculatorReduxConfig,
  ActualsReduxConfig
];

export default ApplicationReduxConfig;
