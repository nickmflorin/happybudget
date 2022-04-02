import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import { CollaboratingBudgetCard } from "components/containers";
import Generic, { RenderGenericCardParams } from "./Generic";
import { actions } from "../../store";

const selectBudgets = (state: Application.Store) => state.dashboard.collaborating.data;
const selectBudgetsResponseReceived = (state: Application.Store) => state.dashboard.collaborating.responseWasReceived;
const selectLoadingBudgets = (state: Application.Store) => state.dashboard.collaborating.loading;
const selectBudgetPage = (state: Application.Store) => state.dashboard.collaborating.page;
const selectBudgetPageSize = (state: Application.Store) => state.dashboard.collaborating.pageSize;
const selectBudgetsCount = (state: Application.Store) => state.dashboard.collaborating.count;
const selectBudgetsSearch = (state: Application.Store) => state.dashboard.collaborating.search;
const selectBudgetsOrdering = (state: Application.Store) => state.dashboard.collaborating.ordering;

type CollaboratingProps = {
  readonly onCreate: () => void;
};

const Collaborating = (props: CollaboratingProps): JSX.Element => {
  const dispatch: Redux.Dispatch = useDispatch();

  const budgets = useSelector(selectBudgets);
  const loading = useSelector(selectLoadingBudgets);
  const responseWasReceived = useSelector(selectBudgetsResponseReceived);
  const page = useSelector(selectBudgetPage);
  const pageSize = useSelector(selectBudgetPageSize);
  const count = useSelector(selectBudgetsCount);
  const search = useSelector(selectBudgetsSearch);
  const ordering = useSelector(selectBudgetsOrdering);

  useEffect(() => {
    dispatch(actions.requestCollaboratingAction(null));
  }, []);

  return (
    <Generic
      title={"Collaborating Budgets"}
      noDataTitle={"You are not collaborating on any budgets yet!"}
      search={search}
      page={page}
      pageSize={pageSize}
      loading={loading}
      budgets={budgets}
      count={count}
      ordering={ordering}
      responseWasReceived={responseWasReceived}
      onCreate={props.onCreate}
      onUpdatePagination={(p: Pagination) => dispatch(actions.setBudgetsPaginationAction(p))}
      onUpdateOrdering={(o: Redux.UpdateOrderingPayload) => dispatch(actions.updateBudgetsOrderingAction(o))}
      onSearch={(v: string) => dispatch(actions.setBudgetsSearchAction(v, {}))}
      renderCard={(params: RenderGenericCardParams<Model.SimpleCollaboratingBudget>) => (
        <CollaboratingBudgetCard {...params} />
      )}
    />
  );
};

export default Collaborating;
