import BudgetsReduxConfig from "components/Application/Dashboard/config";
import BudgetReduxConfig from "components/Application/Budget/config";

const ApplicationReduxConfig: Redux.IApplicationConfig = [BudgetsReduxConfig, BudgetReduxConfig];

export default ApplicationReduxConfig;
