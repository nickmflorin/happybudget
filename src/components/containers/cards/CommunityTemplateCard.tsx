import React from "react";

import classNames from "classnames";

import BaseBudgetCard, { BaseBudgetCardProps } from "./BaseBudgetCard";

type CommunityTemplateCardProps = Omit<
  BaseBudgetCardProps<Model.SimpleTemplate>,
  "dropdown" | "cornerActions"
>;

const CommunityTemplateCard = (props: CommunityTemplateCardProps): JSX.Element => (
  <BaseBudgetCard
    {...props}
    className={classNames("community-template-card", props.className)}
    includeSubTitle={false}
  />
);

export default React.memo(CommunityTemplateCard);
