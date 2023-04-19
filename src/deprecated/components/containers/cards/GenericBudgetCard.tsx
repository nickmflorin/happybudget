import React from "react";

import classNames from "classnames";

import BaseBudgetCard, { BaseBudgetCardProps } from "./BaseBudgetCard";

export type GenericBudgetCardProps<B extends Model.SimpleBudget | Model.SimpleCollaboratingBudget> =
  BaseBudgetCardProps<B>;

const GenericBudgetCard = <B extends Model.SimpleBudget | Model.SimpleCollaboratingBudget>(
  props: GenericBudgetCardProps<B>,
): JSX.Element => (
  <BaseBudgetCard {...props} className={classNames("budget-card", props.className)} />
);

export default React.memo(GenericBudgetCard) as typeof GenericBudgetCard;
