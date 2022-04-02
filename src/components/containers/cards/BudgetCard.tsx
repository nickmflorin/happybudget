import React, { useMemo, useState } from "react";

import * as api from "api";
import { http, notifications } from "lib";

import { Icon } from "components";
import GenericOwnedBudgetCard, { GenericOwnedBudgetCardProps } from "./GenericOwnedBudgetCard";

type BudgetCardProps = Omit<GenericOwnedBudgetCardProps, "dropdown"> & {
  readonly duplicating: boolean;
  readonly onArchived: (response: Model.UserBudget) => void;
  readonly onDuplicate: (e: MenuItemModelClickEvent) => void;
};

const BudgetCard = ({ duplicating, onArchived, onDuplicate, ...props }: BudgetCardProps): JSX.Element => {
  const [archiving, setArchiving] = useState(false);
  const [cancelToken] = http.useCancelToken();

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

  return (
    <GenericOwnedBudgetCard
      {...props}
      disabled={props.disabled || archiving}
      dropdown={[
        {
          id: "duplicate",
          label: "Duplicate",
          icon: <Icon icon={"clone"} weight={"light"} />,
          onClick: (e: MenuItemModelClickEvent) => onDuplicate(e),
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
