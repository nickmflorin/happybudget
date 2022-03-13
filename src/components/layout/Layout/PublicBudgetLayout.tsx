import React from "react";

import BudgetLayout, { BudgetLayoutProps } from "./BudgetLayout";

export type PublicBudgetLayoutProps = Omit<BudgetLayoutProps, "sidebar" | "showHeaderLeafLogo">;

const PublicBudgetLayout = (props: PublicBudgetLayoutProps): JSX.Element => (
  <BudgetLayout {...props} showHeaderLeafLogo={true}>
    {props.children}
  </BudgetLayout>
);

export default React.memo(PublicBudgetLayout);
