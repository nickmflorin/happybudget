import React from "react";

import BudgetLayout, { BudgetLayoutProps } from "./BudgetLayout";

export type PublicBudgetLayoutProps = Omit<
  BudgetLayoutProps,
  "sidebar" | "showHeaderLeafLogo" | "showHeaderTextLogo" | "showHeaderSidebarToggle"
>;

const PublicBudgetLayout = (props: PublicBudgetLayoutProps): JSX.Element => (
  <BudgetLayout {...props} showHeaderLeafLogo={true} showHeaderTextLogo={false} showHeaderSidebarToggle={false}>
    {props.children}
  </BudgetLayout>
);

export default React.memo(PublicBudgetLayout);
