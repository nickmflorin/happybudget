import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { BudgetCard } from "components/containers/cards";
import { BudgetEmptyIcon } from "components/svgs";

import GenericOwnedBudget, { RenderGenericOwnedBudgetCardParams } from "./GenericOwnedBudget";
import { actions } from "../../store";

type ActiveProps = {
  readonly onEdit: (b: Model.SimpleBudget) => void;
  readonly onCreate: () => void;
};

const Active = (props: ActiveProps): JSX.Element => {
  const dispatch: Redux.Dispatch = useDispatch();

  useEffect(() => {
    dispatch(actions.requestBudgetsAction(null));
  }, []);

  return (
    <GenericOwnedBudget
      title={"My Budgets"}
      noDataProps={{
        title: "You don't have any budgets yet! Create a new budget.",
        child: <BudgetEmptyIcon />,
        // eslint-disable-next-line quotes
        subTitle: 'Tip: Click the "Create Budget" button above and create an empty budget or start one from a template.'
      }}
      selector={(s: Application.Store) => s.dashboard.budgets}
      onSearch={(v: string) => dispatch(actions.setBudgetsSearchAction(v, {}))}
      onUpdatePagination={(p: Pagination) => dispatch(actions.setBudgetsPaginationAction(p))}
      onUpdateOrdering={(o: Redux.UpdateOrderingPayload) => dispatch(actions.updateBudgetsOrderingAction(o))}
      onCreate={props.onCreate}
      onDeleted={(b: Model.SimpleBudget) => {
        dispatch(actions.removeBudgetFromStateAction(b.id));
        dispatch(actions.requestPermissioningBudgetsAction(null));
      }}
      renderCard={(params: RenderGenericOwnedBudgetCardParams) => (
        <BudgetCard
          {...params}
          disabled={params.deleting}
          loading={params.deleting}
          onEdit={() => props.onEdit(params.budget)}
          onArchived={(b: Model.UserBudget) => {
            dispatch(actions.removeBudgetFromStateAction(b.id));
            dispatch(actions.addArchiveToStateAction(b));
          }}
          onDuplicated={(b: Model.UserBudget) => dispatch(actions.addBudgetToStateAction(b))}
        />
      )}
    />
  );
};

export default Active;
