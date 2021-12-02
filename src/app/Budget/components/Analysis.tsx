import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { redux } from "lib";

import { Page } from "components/layout";
import { actions } from "../store";

interface AnalysisProps {
  readonly budget: Model.Budget | null;
  readonly budgetId: number;
}

const selectGroups = redux.selectors.simpleDeepEqualSelector(
  (state: Application.Authenticated.Store) => state.budget.analysis.groups.data
);
const selectAccounts = redux.selectors.simpleDeepEqualSelector(
  (state: Application.Authenticated.Store) => state.budget.analysis.accounts.data
);

const Analysis = ({ budget, budgetId }: AnalysisProps): JSX.Element => {
  const dispatch = useDispatch();

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  const groups = useSelector(selectGroups);
  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  const accounts = useSelector(selectAccounts);

  useEffect(() => {
    dispatch(actions.analysis.requestAction(null));
  }, []);

  return (
    <Page className={"analysis"} title={"Analysis"}>
      <div>{"Coming soon!"}</div>
    </Page>
  );
};

export default Analysis;
