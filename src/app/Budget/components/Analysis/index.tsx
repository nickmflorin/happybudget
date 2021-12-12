import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { AnalysisPage } from "app/Pages";

import { actions } from "../../store";
import BudgetTotal from "./BudgetTotal";
import ActualsByDate from "./ActualsByDate";

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
      <div style={{ display: "flex" }}>
        <BudgetTotal budget={budget} style={{ width: "50%" }} />
        <ActualsByDate style={{ marginLeft: 15, width: "50%" }} />
      </div>
    </AnalysisPage>
  );
};

export default Analysis;
