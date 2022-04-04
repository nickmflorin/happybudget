import React from "react";
import { useDispatch } from "react-redux";

import * as store from "store";
import { model } from "lib";

import { Icon } from "components";
import { PrimaryButtonIconToggle } from "components/buttons";
import { BudgetDropdownMenu } from "components/dropdowns";
import { BudgetEmptyIcon } from "components/svgs";

import GenericOwned, { GenericOwnedProps, RenderGenericOwnedCardParams } from "../GenericOwned";

export type RenderGenericOwnedBudgetCardParams = RenderGenericOwnedCardParams<Model.SimpleBudget>;

export type GenericOwnedBudgetProps = Omit<
  GenericOwnedProps<Model.SimpleBudget>,
  "confirmDeleteProps" | "noDataProps"
> & {
  readonly onCreate: () => void;
  readonly noDataProps: Omit<GenericOwnedProps<Model.SimpleBudget>["noDataProps"], "emptyChild">;
};

const GenericOwnedBudget = (props: GenericOwnedBudgetProps): JSX.Element => {
  const user = store.hooks.useLoggedInUser();
  const dispatch: Redux.Dispatch = useDispatch();

  return (
    <GenericOwned
      {...props}
      noDataProps={{ ...props.noDataProps, child: <BudgetEmptyIcon /> }}
      onDeleted={(b: Model.SimpleBudget) => {
        dispatch(store.actions.updateLoggedInUserMetricsAction({ metric: "num_budgets", change: "decrement" }));
        props.onDeleted(b);
      }}
      confirmDeleteProps={{ suppressionKey: "delete-budget-confirmation-suppressed", title: "Delete Budget" }}
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
    />
  );
};

export default React.memo(GenericOwnedBudget);
