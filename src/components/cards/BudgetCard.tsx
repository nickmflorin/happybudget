import React, { useEffect, useMemo } from "react";
import classNames from "classnames";
import { isNil } from "lodash";

import { Icon } from "components";
import { IncludeButtonLink } from "components/buttons";
import { util, users } from "lib";

import Card, { CardProps } from "./Card";

type BudgetCardProps = Pick<CardProps, "disabled" | "loading" | "onClick" | "className" | "style"> & {
  readonly budget: Model.SimpleBudget;
  readonly duplicating: boolean;
  readonly onEdit: () => void;
  readonly onDelete: (e: MenuItemModelClickEvent) => void;
  readonly onDuplicate: (e: MenuItemModelClickEvent) => void;
};

const BudgetCard = ({
  budget,
  loading,
  disabled,
  duplicating,
  onEdit,
  onDelete,
  onDuplicate,
  ...props
}: BudgetCardProps): JSX.Element => {
  const user = users.hooks.useLoggedInUser();
  const tz = users.hooks.useTimezone();

  const subTitle = useMemo(() => {
    if (util.dates.isToday(budget.updated_at)) {
      return `Last edited ${util.dates.toDisplayTimeSince(budget.updated_at)} by ${user.full_name}`;
    }
    return `Last edited by ${user.full_name} on ${util.dates.toAbbvDisplayDateTime(budget.updated_at, { tz })}`;
  }, [budget.updated_at, user.full_name]);

  useEffect(() => {
    if (!isNil(budget.image) && isNil(budget.image.url)) {
      console.warn(
        `Budget ${budget.id} has an image with an undefined URL.
        This most likely means something wonky is going on with S3.`
      );
    }
  }, [budget.image]);

  return (
    <Card
      {...props}
      info={
        budget.is_permissioned === true
          ? {
              title: (
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
              )
            }
          : undefined
      }
      className={classNames("budget-card", props.className)}
      title={budget.name}
      subTitle={subTitle}
      loading={loading}
      disabled={disabled || budget.is_permissioned}
      image={budget.image}
      dropdown={[
        {
          id: "edit",
          label: "Edit Name/Image",
          icon: <Icon icon={"image"} weight={"light"} />,
          onClick: () => onEdit()
        },
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
          id: "delete",
          label: "Delete",
          icon: <Icon icon={"trash"} weight={"light"} />,
          onClick: (e: MenuItemModelClickEvent) => onDelete(e),
          keepDropdownOpenOnClick: false
        }
      ]}
    />
  );
};

export default React.memo(BudgetCard);
