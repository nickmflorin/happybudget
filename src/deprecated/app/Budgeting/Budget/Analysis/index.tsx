import { useEffect } from "react";

import { useDispatch } from "react-redux";

import { AnalysisPage } from "deprecated/app/Budgeting/Pages";

import { actions } from "../../store";

import ActualsByDate from "./ActualsByDate";
import BudgetTotal from "./BudgetTotal";

type AnalysisProps = {
  readonly budget: Model.Budget | null;
  readonly budgetId: number;
};

const Analysis = ({ budget, budgetId }: AnalysisProps): JSX.Element => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(actions.budget.analysis.requestAction(null, { budgetId }));
  }, [budgetId]);

  return (
    <AnalysisPage budget={budget}>
      <div style={{ overflowY: "scroll" }}>
        <div className="analysis-charts">
          <BudgetTotal className="analysis-chart" budget={budget} budgetId={budgetId} />
          <ActualsByDate className="analysis-chart" budgetId={budgetId} />
        </div>
      </div>
    </AnalysisPage>
  );
};

export default Analysis;
