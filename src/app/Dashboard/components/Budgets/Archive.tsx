import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import { ArchivedBudgetCard } from "components/containers";
import UserGeneric, { RenderUserCardParams } from "./UserGeneric";
import { actions } from "../../store";

const selectBudgets = (state: Application.Store) => state.dashboard.archive.data;
const selectBudgetsResponseReceived = (state: Application.Store) => state.dashboard.archive.responseWasReceived;
const selectLoadingBudgets = (state: Application.Store) => state.dashboard.archive.loading;
const selectBudgetPage = (state: Application.Store) => state.dashboard.archive.page;
const selectBudgetPageSize = (state: Application.Store) => state.dashboard.archive.pageSize;
const selectBudgetsCount = (state: Application.Store) => state.dashboard.archive.count;
const selectBudgetsSearch = (state: Application.Store) => state.dashboard.archive.search;
const selectBudgetsOrdering = (state: Application.Store) => state.dashboard.archive.ordering;

type ArchiveProps = {
  readonly onEdit: (b: Model.SimpleBudget) => void;
  readonly onCreate: () => void;
};

const Archive = (props: ArchiveProps): JSX.Element => {
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
    dispatch(actions.requestArchiveAction(null));
  }, []);

  return (
    <UserGeneric
      title={"Archived Budgets"}
      noDataTitle={"You don't have any archived budgets yet!"}
      search={search}
      page={page}
      pageSize={pageSize}
      loading={loading}
      budgets={budgets}
      count={count}
      ordering={ordering}
      responseWasReceived={responseWasReceived}
      onCreate={props.onCreate}
      onUpdatePagination={(p: Pagination) => dispatch(actions.setArchivePaginationAction(p))}
      onUpdateOrdering={(o: Redux.UpdateOrderingPayload) => dispatch(actions.updateArchiveOrderingAction(o))}
      onSearch={(v: string) => dispatch(actions.setArchiveSearchAction(v, {}))}
      onDeleted={(b: Model.SimpleBudget) => {
        dispatch(actions.removeArchiveFromStateAction(b.id));
        dispatch(actions.requestPermissioningArchiveAction(null));
      }}
      renderCard={(params: RenderUserCardParams) => (
        <ArchivedBudgetCard
          {...params}
          disabled={params.deleting}
          loading={params.deleting}
          onEdit={() => props.onEdit(params.budget)}
        />
      )}
    />
  );
};

export default Archive;
