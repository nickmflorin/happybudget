import { ReactNode } from "react";
import { isNil } from "lodash";
import TooltipOrTitle from "./TooltipOrTitle";

interface TooltipWrapperProps {
  readonly children: ReactNode;
  readonly tooltip: Tooltip | undefined | null;
}

const TooltipWrapper = ({ children, tooltip }: TooltipWrapperProps): JSX.Element => {
  if (!isNil(tooltip)) {
    return <TooltipOrTitle tooltip={tooltip}>{children}</TooltipOrTitle>;
  } else {
    return <>{children}</>;
  }
};

export default TooltipWrapper;
