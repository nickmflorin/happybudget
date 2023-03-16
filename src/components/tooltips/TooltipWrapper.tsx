import { ReactNode } from "react";

import { isNil } from "lodash";

import TooltipOrContent from "./TooltipOrContent";

interface TooltipWrapperProps {
  readonly children: ReactNode;
  readonly tooltip: Tooltip | undefined | null;
}

const TooltipWrapper = ({ children, tooltip }: TooltipWrapperProps): JSX.Element => {
  if (!isNil(tooltip)) {
    return <TooltipOrContent tooltip={tooltip}>{children}</TooltipOrContent>;
  } else {
    return <>{children}</>;
  }
};

export default TooltipWrapper;
