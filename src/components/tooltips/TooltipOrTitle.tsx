import { ReactNode } from "react";
import Tooltip from "./Tooltip";

interface TooltipOrTitleProps extends Omit<TooltipProps, "title"> {
  readonly children?: ReactNode;
  readonly tooltip: Tooltip;
}

const TooltipOrTitle = ({ tooltip, children, ...props }: TooltipOrTitleProps): JSX.Element => {
  if (typeof tooltip === "function") {
    return tooltip({ children });
  } else if (typeof tooltip === "string") {
    return (
      <Tooltip {...props} title={tooltip}>
        {children}
      </Tooltip>
    );
  }
  return (
    <Tooltip {...tooltip} {...props}>
      {children}
    </Tooltip>
  );
};

export default TooltipOrTitle;
