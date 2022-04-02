import React, { useState, useMemo } from "react";

import * as api from "api";
import { http, notifications } from "lib";

import { Icon } from "components";
import GenericOwnedBudgetCard, { GenericOwnedBudgetCardProps } from "./GenericOwnedBudgetCard";

type ArchivedBudgetCardProps = Omit<GenericOwnedBudgetCardProps, "dropdown"> & {
  readonly onActivated: (b: Model.UserBudget) => void;
};

const ArchivedBudgetCard = ({ onActivated, ...props }: ArchivedBudgetCardProps): JSX.Element => {
  const [activating, setActivating] = useState(false);
  const [cancelToken] = http.useCancelToken();

  const activate = useMemo(
    () => (e: MenuItemModelClickEvent) => {
      setActivating(true);
      api
        .updateBudget<Model.UserBudget>(props.budget.id, { archived: false }, { cancelToken: cancelToken() })
        .then((response: Model.UserBudget) => {
          e.item.closeParentDropdown?.();
          setActivating(false);
          onActivated(response);
        })
        .catch((err: Error) => {
          e.item.closeParentDropdown?.();
          setActivating(false);
          notifications.ui.banner.handleRequestError(err);
        });
    },
    [onActivated, props.budget.id]
  );

  return (
    <GenericOwnedBudgetCard
      {...props}
      disabled={props.disabled || activating}
      dropdown={[
        {
          id: "activate",
          label: "Activate",
          icon: <Icon icon={"books"} weight={"light"} />,
          onClick: (e: MenuItemModelClickEvent) => activate(e),
          keepDropdownOpenOnClick: true,
          loading: activating,
          disabled: activating
        }
      ]}
    />
  );
};

export default React.memo(ArchivedBudgetCard);
