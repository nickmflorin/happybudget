import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { ArchivedBudgetCard } from "components/containers";
import { BudgetEmptyIcon } from "components/svgs";

import GenericOwnedBudget, { RenderGenericOwnedBudgetCardParams } from "./GenericOwnedBudget";
import { actions } from "../../store";

type ArchiveProps = {
  readonly onEdit: (b: Model.SimpleBudget) => void;
  readonly onCreate: () => void;
};

const Archive = (props: ArchiveProps): JSX.Element => {
  const dispatch: Redux.Dispatch = useDispatch();

  useEffect(() => {
    dispatch(actions.requestArchiveAction(null));
  }, []);

  return (
    <GenericOwnedBudget
      title={"Archived Budgets"}
      selector={(s: Application.Store) => s.dashboard.archive}
      noDataProps={{ title: "You don't have any archived budgets yet!", child: <BudgetEmptyIcon /> }}
      onSearch={(v: string) => dispatch(actions.setArchiveSearchAction(v, {}))}
      onUpdatePagination={(p: Pagination) => dispatch(actions.setArchivePaginationAction(p))}
      onUpdateOrdering={(o: Redux.UpdateOrderingPayload) => dispatch(actions.updateArchiveOrderingAction(o))}
      onCreate={props.onCreate}
      onDeleted={(b: Model.SimpleBudget) => {
        dispatch(actions.removeArchiveFromStateAction(b.id));
        dispatch(actions.requestPermissioningArchiveAction(null));
      }}
      renderCard={(params: RenderGenericOwnedBudgetCardParams) => (
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
