import React from "react";

import BaseBudgetCard, { BaseBudgetCardProps } from "./BaseBudgetCard";

export type CollaboratingBudgetCardProps = Omit<
  BaseBudgetCardProps<Model.SimpleCollaboratingBudget>,
  "cornerActions" | "dropdown"
>;

const CollaboratingBudgetCard = (props: CollaboratingBudgetCardProps): JSX.Element => <BaseBudgetCard {...props} />;

export default React.memo(CollaboratingBudgetCard);
