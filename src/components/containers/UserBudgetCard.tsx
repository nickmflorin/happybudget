import React from "react";
import classNames from "classnames";

import { Icon } from "components";
import { IncludeButtonLink } from "components/buttons";
import { InfoTooltip } from "components/tooltips";

import BaseBudgetCard, { BaseBudgetCardProps } from "./BaseBudgetCard";

export type UserBudgetCardProps = Omit<BaseBudgetCardProps<Model.SimpleBudget>, "cornerActions"> & {
  readonly onEdit: () => void;
  readonly onDelete: (e: MenuItemModelClickEvent) => void;
};

const UserBudgetCard = ({ disabled, dropdown, onEdit, onDelete, ...props }: UserBudgetCardProps): JSX.Element => (
  <BaseBudgetCard
    {...props}
    cornerActions={(iconClassName: string) => [
      {
        render: () => (
          <InfoTooltip
            title={
              <div style={{ display: "flex", flexDirection: "column" }}>
                {"You are not subscribed to the correct products to access this budget."}
                <IncludeButtonLink
                  style={{ marginTop: 4 }}
                  includeLink={{
                    text: "Click here to subscribe.",
                    to: "/billing"
                  }}
                />
              </div>
            }
          >
            <Icon
              className={classNames("icon--card-corner-action", iconClassName)}
              icon={"question-circle"}
              weight={"solid"}
            />
          </InfoTooltip>
        ),
        visible: props.budget.is_permissioned
      }
    ]}
    disabled={disabled || props.budget.is_permissioned}
    dropdown={[
      {
        id: "edit",
        label: "Edit Name/Image",
        icon: <Icon icon={"image"} weight={"light"} />,
        onClick: () => onEdit()
      },
      {
        id: "delete",
        label: "Delete",
        icon: <Icon icon={"trash"} weight={"light"} />,
        onClick: (e: MenuItemModelClickEvent) => onDelete(e),
        keepDropdownOpenOnClick: false
      },
      ...(dropdown || [])
    ]}
  />
);

export default React.memo(UserBudgetCard);
