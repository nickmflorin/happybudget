import { useEffect } from "react";
import { useDispatch } from "react-redux";

import * as config from "config";
import * as store from "store";
import { model } from "lib";

import { Icon } from "components";
import { PrimaryButtonIconToggle } from "components/buttons";
import { CollaboratingBudgetCard } from "components/containers/cards";
import { BudgetDropdownMenu } from "components/dropdowns";
import { BudgetEmptyIcon } from "components/svgs";

import DashboardPage, { RenderDashboardPageCardParams } from "../DashboardPage";
import { actions } from "../../store";

type CollaboratingProps = {
  readonly onCreate: () => void;
};

const Collaborating = (props: CollaboratingProps): JSX.Element => {
  const user = store.hooks.useLoggedInUser();
  const dispatch: Redux.Dispatch = useDispatch();

  useEffect(() => {
    dispatch(actions.requestCollaboratingAction(null));
  }, []);

  return (
    <DashboardPage
      title={"Collaborating Budgets"}
      selector={(s: Application.Store) => s.dashboard.collaborating}
      noDataProps={{ title: "You are not collaborating on any budgets yet!", child: <BudgetEmptyIcon /> }}
      onSearch={(v: string) => dispatch(actions.setCollaboratingSearchAction(v, {}))}
      onUpdatePagination={(p: Pagination) => dispatch(actions.setCollaboratingPaginationAction(p))}
      onUpdateOrdering={(o: Redux.UpdateOrderingPayload) => dispatch(actions.updateCollaboratingOrderingAction(o))}
      createMenuElement={
        <BudgetDropdownMenu
          key={1}
          onNewBudget={() => {
            /* Note: Normally we would want to rely on a request to the backend
							 as the source of truth for a user permission related action, but
							 since the CreateBudgetModal protects against users without the
							 proper permissions creating multiple budgets during the API
							 request anyways, this is okay. */
            if (
              user.metrics.num_budgets !== 0 &&
              config.env.BILLING_ENABLED &&
              !model.user.userHasPermission(user, model.user.Permissions.MULTIPLE_BUDGETS)
            ) {
              dispatch(store.actions.setProductPermissionModalOpenAction(true));
            } else {
              props.onCreate();
            }
          }}
        >
          <PrimaryButtonIconToggle
            breakpoint={"medium"}
            icon={<Icon icon={"plus"} weight={"regular"} />}
            text={"Create Budget"}
          />
        </BudgetDropdownMenu>
      }
      renderCard={(params: RenderDashboardPageCardParams<Model.SimpleCollaboratingBudget>) => (
        <CollaboratingBudgetCard {...params} />
      )}
    />
  );
};

export default Collaborating;
