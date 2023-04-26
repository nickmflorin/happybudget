import { ReactNode } from "react";

import * as tooltip from "lib/ui/tooltip/types";

import { TooltipOrContent } from "./TooltipOrContent";

interface ConditionalTooltipProps<
  T extends typeof tooltip.TooltipTypes.BRAND | typeof tooltip.TooltipTypes.INFO,
> {
  readonly children: ReactNode;
  readonly tooltip?: tooltip.Tooltip | null;
  readonly type?: T;
}

export const ConditionalTooltip = <
  T extends typeof tooltip.TooltipTypes.BRAND | typeof tooltip.TooltipTypes.INFO,
>({
  children,
  tooltip,
}: ConditionalTooltipProps<T>): JSX.Element => {
  if (tooltip !== undefined && tooltip !== null) {
    return <TooltipOrContent tooltip={tooltip}>{children}</TooltipOrContent>;
  } else {
    return <>{children}</>;
  }
};
