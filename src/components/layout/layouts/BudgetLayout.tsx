import React from "react";
import classNames from "classnames";

import { WrapInApplicationSpinner } from "components";
import CollapsedLayout, { CollapsedLayoutProps } from "./CollapsedLayout";

export type BudgetLayoutProps = CollapsedLayoutProps & {
  readonly budgetLoading?: boolean;
};

const BudgetLayout = ({ budgetLoading, ...props }: BudgetLayoutProps): JSX.Element => (
  <WrapInApplicationSpinner loading={budgetLoading}>
    <CollapsedLayout {...props} className={classNames("layout--budget", props.className)}>
      {props.children}
    </CollapsedLayout>
  </WrapInApplicationSpinner>
);

export default React.memo(BudgetLayout);
