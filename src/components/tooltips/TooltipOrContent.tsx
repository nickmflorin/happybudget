import React, { ReactNode } from "react";

import Tooltip from "./Tooltip";

type TooltipOrContentProps = Omit<TooltipProps, "content"> & {
  readonly children?: ReactNode;
  readonly tooltip: Tooltip;
};

const TooltipOrContent = ({ tooltip, children, ...props }: TooltipOrContentProps): JSX.Element => {
  if (typeof tooltip === "function") {
    return tooltip({ children });
  } else if (typeof tooltip === "string") {
    return (
      <Tooltip {...props} content={tooltip}>
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

export default React.memo(TooltipOrContent);
