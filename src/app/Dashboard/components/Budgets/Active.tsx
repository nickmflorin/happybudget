import { useEffect } from "react";
import { useDispatch } from "react-redux";

import * as api from "api";
import * as store from "store";
import { model, notifications, redux } from "lib";

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
  const user = store.hooks.useLoggedInUser();
  const {
    isActive: isDuplicating,
    removeFromState: setDuplicated,
    addToState: setDuplicating
  } = redux.useTrackModelActions([]);

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
          disabled={params.deleting || isDuplicating(params.budget.id)}
          loading={params.deleting}
          duplicating={isDuplicating(params.budget.id)}
          onEdit={() => props.onEdit(params.budget)}
          onDuplicate={(e: MenuItemModelClickEvent) => {
            /* Note: Normally we would want to rely on a request to the backend
						   as the source of truth for a user permission related action, but
							 since the request ot duplicate a Budget is itself protected
							 against incompatible permissions, this is ok.
							 */
            if (
              user.num_budgets !== 0 &&
              !model.user.userHasPermission(user, model.user.Permissions.MULTIPLE_BUDGETS)
            ) {
              dispatch(store.actions.setProductPermissionModalOpenAction(true));
            } else {
              setDuplicating(params.budget.id);
              api
                /* We have to use a large timeout because this is a request
								   that sometimes takes a very long time. */
                .duplicateBudget<Model.UserBudget>(params.budget.id, { timeout: 120 * 1000 })
                .then((response: Model.UserBudget) => {
                  e.item.closeParentDropdown?.();
                  dispatch(actions.addBudgetToStateAction(response));
                })
                .catch((err: Error) => {
                  if (
                    err instanceof api.PermissionError &&
                    err.code === api.ErrorCodes.permission.PRODUCT_PERMISSION_ERROR
                  ) {
                    /* Edge case, since we would prevent this action if this
										   were the case before submitting the request. */
                    notifications.ui.banner.lookupAndNotify("budgetSubscriptionPermissionError");
                  } else {
                    notifications.ui.banner.handleRequestError(err);
                  }
                })
                .finally(() => setDuplicated(params.budget.id));
            }
          }}
        />
      )}
    />
  );
};

export default Active;
