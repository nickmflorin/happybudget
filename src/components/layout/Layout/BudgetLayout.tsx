import React from "react";
import classNames from "classnames";

import CollapsedLayout, { CollapsedLayoutProps } from "./CollapsedLayout";

export type BudgetLayoutProps = CollapsedLayoutProps;

const BudgetLayout = (props: BudgetLayoutProps): JSX.Element => (
  <CollapsedLayout {...props} className={classNames("layout--budget", props.className)}>
    {props.children}
  </CollapsedLayout>
);

export default React.memo(BudgetLayout);
