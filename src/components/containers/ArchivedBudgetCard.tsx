import React from "react";
import UserBudgetCard, { UserBudgetCardProps } from "./UserBudgetCard";

type ArchivedBudgetCardProps = Omit<UserBudgetCardProps, "dropdown">;

const ArchivedBudgetCard = (props: ArchivedBudgetCardProps): JSX.Element => <UserBudgetCard {...props} />;

export default React.memo(ArchivedBudgetCard);
