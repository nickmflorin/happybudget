import React from "react";
import classNames from "classnames";

import { Icon } from "components";
import { IncludeButtonLink } from "components/buttons";
import { InfoTooltip } from "components/tooltips";

import GenericBudgetCard, { GenericBudgetCardProps } from "./GenericBudgetCard";

export type GenericOwnedBudgetCardProps = Omit<GenericBudgetCardProps<Model.SimpleBudget>, "cornerActions"> & {
  readonly deleting: boolean;
  readonly onEdit: () => void;
  readonly onDelete: (e: MenuItemModelClickEvent) => void;
};

const GenericOwnedBudgetCard = ({ deleting, onEdit, onDelete, ...props }: GenericOwnedBudgetCardProps): JSX.Element => (
  <GenericBudgetCard
    {...props}
    cornerActions={(iconClassName: string) => [
      {
        render: () => (
          <InfoTooltip
            content={
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
    disabled={props.disabled || props.budget.is_permissioned}
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
        keepDropdownOpenOnClick: false,
        loading: deleting
      },
      ...(props.dropdown || [])
    ]}
  />
);

export default React.memo(GenericOwnedBudgetCard);
