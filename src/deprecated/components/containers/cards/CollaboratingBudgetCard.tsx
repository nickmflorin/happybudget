import React from "react";

import GenericBudgetCard, { GenericBudgetCardProps } from "./GenericBudgetCard";

export type CollaboratingBudgetCardProps = Omit<
  GenericBudgetCardProps<Model.SimpleCollaboratingBudget>,
  "cornerActions" | "dropdown"
>;

const CollaboratingBudgetCard = (props: CollaboratingBudgetCardProps): JSX.Element => (
  <GenericBudgetCard {...props} />
);

export default React.memo(CollaboratingBudgetCard);
