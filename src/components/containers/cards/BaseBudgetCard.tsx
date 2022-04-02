import React, { useEffect, useMemo } from "react";
import { isNil } from "lodash";

import { util } from "lib";
import * as store from "store";

import Card, { CardProps } from "./Card";

export type BaseBudgetCardProps<B extends Model.SimpleBudget | Model.SimpleCollaboratingBudget | Model.SimpleTemplate> =
  Omit<CardProps, "subTitle" | "title" | "tourId" | "image"> & {
    readonly budget: B;
    readonly includeSubTitle?: boolean;
  };

const BaseBudgetCard = <B extends Model.SimpleBudget | Model.SimpleCollaboratingBudget | Model.SimpleTemplate>({
  budget,
  includeSubTitle,
  ...props
}: BaseBudgetCardProps<B>): JSX.Element => {
  const user = store.hooks.useLoggedInUser();
  const tz = store.hooks.useTimezone();

  const subTitle = useMemo(() => {
    if (util.dates.isToday(budget.updated_at)) {
      return `Last edited ${util.dates.toDisplayTimeSince(budget.updated_at)} by ${user.full_name}`;
    }
    return `Last edited by ${user.full_name} on ${util.dates.toAbbvDisplayDateTime(budget.updated_at, { tz })}`;
  }, [budget.updated_at, user.full_name]);

  useEffect(() => {
    if (!isNil(budget.image) && isNil(budget.image.url)) {
      console.warn(
        `Budget ${budget.id}, domain ${budget.domain} has an image with an undefined URL.
        This most likely means something wonky is going on with S3.`
      );
    }
  }, [budget.image]);

  return (
    <Card
      {...props}
      tourId={budget.name}
      title={budget.name}
      subTitle={includeSubTitle !== false ? subTitle : undefined}
      image={budget.image}
    />
  );
};

export default React.memo(BaseBudgetCard);
