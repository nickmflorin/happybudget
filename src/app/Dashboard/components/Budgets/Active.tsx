import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import * as api from "api";
import * as store from "store";
import { redux, notifications, model } from "lib";

import { BudgetCard } from "components/containers";
import UserGeneric, { RenderUserCardParams } from "./UserGeneric";
import { actions } from "../../store";

const selectBudgets = (state: Application.Store) => state.dashboard.budgets.data;
const selectBudgetsResponseReceived = (state: Application.Store) => state.dashboard.budgets.responseWasReceived;
const selectLoadingBudgets = (state: Application.Store) => state.dashboard.budgets.loading;
const selectBudgetPage = (state: Application.Store) => state.dashboard.budgets.page;
const selectBudgetPageSize = (state: Application.Store) => state.dashboard.budgets.pageSize;
const selectBudgetsCount = (state: Application.Store) => state.dashboard.budgets.count;
const selectBudgetsSearch = (state: Application.Store) => state.dashboard.budgets.search;
const selectBudgetsOrdering = (state: Application.Store) => state.dashboard.budgets.ordering;

type ActiveProps = {
  readonly onEdit: (b: Model.SimpleBudget) => void;
  readonly onCreate: () => void;
};

const Active = (props: ActiveProps): JSX.Element => {
  const user = store.hooks.useLoggedInUser();
  const {
    isActive: isDuplicating,
    removeFromState: setDuplicated,
    addToState: setDuplicating
  } = redux.useTrackModelActions([]);

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
    dispatch(actions.requestBudgetsAction(null));
  }, []);

  return (
    <UserGeneric
      title={"My Budgets"}
      noDataTitle={"You don't have any budgets yet! Create a new budget."}
      noDataSubTitle={
        // eslint-disable-next-line quotes
        'Tip: Click the "Create Budget" button above and create an empty budget or start one from a template.'
      }
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
      onDeleted={(b: Model.SimpleBudget) => {
        dispatch(actions.removeBudgetFromStateAction(b.id));
        dispatch(actions.requestPermissioningBudgetsAction(null));
      }}
      renderCard={(params: RenderUserCardParams) => (
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
