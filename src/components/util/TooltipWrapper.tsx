import { ReactNode } from "react";
import { isNil } from "lodash";
import { Tooltip as AntDTooltip } from "antd";

interface TooltipWrapperProps {
  readonly children?: ReactNode;
  readonly tooltip: Tooltip | undefined | null;
}

const TooltipWrapper = ({ children, tooltip }: TooltipWrapperProps): JSX.Element => {
  if (!isNil(tooltip)) {
    return typeof tooltip === "string" ? (
      <AntDTooltip title={tooltip}>{children}</AntDTooltip>
    ) : (
      <AntDTooltip {...tooltip}>{children}</AntDTooltip>
    );
  } else {
    return <>{children}</>;
  }
};

export default TooltipWrapper;
