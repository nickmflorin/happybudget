import React, { useMemo, useState } from "react";
import { Dispatch } from "redux";
import { useDispatch } from "react-redux";

import * as api from "api";
import * as config from "config";
import * as store from "store";
import { http, notifications, model } from "lib";

import { Icon } from "components";
import GenericOwnedBudgetCard, { GenericOwnedBudgetCardProps } from "./GenericOwnedBudgetCard";

type BudgetCardProps = Omit<GenericOwnedBudgetCardProps, "dropdown"> & {
  readonly onArchived: (response: Model.UserBudget) => void;
  readonly onDuplicated: (response: Model.UserBudget) => void;
};

const BudgetCard = ({ onArchived, onDuplicated, ...props }: BudgetCardProps): JSX.Element => {
  const user = store.hooks.useLoggedInUser();
  const [archiving, setArchiving] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [cancelToken] = http.useCancelToken();
  const dispatch: Dispatch = useDispatch();

  const archive = useMemo(
    () => (e: MenuItemModelClickEvent) => {
      setArchiving(true);
      api
        .updateBudget<Model.UserBudget>(props.budget.id, { archived: true }, { cancelToken: cancelToken() })
        .then((response: Model.UserBudget) => {
          e.item.closeParentDropdown?.();
          setArchiving(false);
          onArchived(response);
        })
        .catch((err: Error) => {
          e.item.closeParentDropdown?.();
          setArchiving(false);
          notifications.ui.banner.handleRequestError(err);
        });
    },
    [onArchived, props.budget.id]
  );

  const duplicate = useMemo(
    () => (e: MenuItemModelClickEvent) => {
      if (
        user.metrics.num_budgets !== 0 &&
        config.env.BILLING_ENABLED &&
        !model.user.userHasPermission(user, model.user.Permissions.MULTIPLE_BUDGETS)
      ) {
        dispatch(store.actions.setProductPermissionModalOpenAction(true));
      } else {
        setDuplicating(true);
        api
          /* We have to use a large timeout because this is a request that
					   sometimes takes a very long time. */
          .duplicateBudget<Model.UserBudget>(props.budget.id, {
            timeout: 120 * 1000,
            cancelToken: cancelToken()
          })
          .then((response: Model.UserBudget) => {
            e.item.closeParentDropdown?.();
            setDuplicating(false);
            onDuplicated(response);
          })
          .catch((err: Error) => {
            setDuplicating(false);
            if (err instanceof api.PermissionError && err.code === api.ErrorCodes.permission.PRODUCT_PERMISSION_ERROR) {
              /* Edge case, since we would prevent this action if this were the
							   case before submitting the request. */
              notifications.ui.banner.lookupAndNotify("budgetSubscriptionPermissionError");
            } else {
              notifications.ui.banner.handleRequestError(err);
            }
          });
      }
    },
    [onDuplicated, props.budget.id]
  );

  return (
    <GenericOwnedBudgetCard
      {...props}
      disabled={props.disabled || archiving || duplicating}
      dropdown={[
        {
          id: "duplicate",
          label: "Duplicate",
          icon: <Icon icon={"clone"} weight={"light"} />,
          onClick: (e: MenuItemModelClickEvent) => duplicate(e),
          keepDropdownOpenOnClick: true,
          loading: duplicating,
          disabled: duplicating
        },
        {
          id: "archive",
          label: "Archive",
          icon: <Icon icon={"books"} weight={"light"} />,
          onClick: (e: MenuItemModelClickEvent) => archive(e),
          keepDropdownOpenOnClick: true,
          loading: archiving,
          disabled: archiving
        }
      ]}
    />
  );
};

export default React.memo(BudgetCard);
