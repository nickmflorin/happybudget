import React from "react";
import GenericOwnedBudgetCard, { GenericOwnedBudgetCardProps } from "./GenericOwnedBudgetCard";

type ArchivedBudgetCardProps = Omit<GenericOwnedBudgetCardProps, "dropdown">;

const ArchivedBudgetCard = (props: ArchivedBudgetCardProps): JSX.Element => <GenericOwnedBudgetCard {...props} />;

export default React.memo(ArchivedBudgetCard);
