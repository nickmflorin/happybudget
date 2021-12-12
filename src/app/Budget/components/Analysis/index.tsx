import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { AnalysisPage } from "app/Pages";

import { actions } from "../../store";
import BudgetTotal from "./BudgetTotal";

interface AnalysisProps {
  readonly budget: Model.Budget | null;
  readonly budgetId: number;
}

const Analysis = ({ budget, budgetId }: AnalysisProps): JSX.Element => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(actions.analysis.requestAction(null));
  }, []);

  return (
    <AnalysisPage budget={budget}>
      <BudgetTotal budget={budget} />
    </AnalysisPage>
  );
};

export default Analysis;
