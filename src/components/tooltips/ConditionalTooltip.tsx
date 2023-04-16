import { ReactNode } from "react";

import { ui } from "lib";

import { TooltipOrContent } from "./TooltipOrContent";

interface ConditionalTooltipProps<
  T extends typeof ui.TooltipTypes.BRAND | typeof ui.TooltipTypes.INFO,
> {
  readonly children: ReactNode;
  readonly tooltip?: ui.Tooltip | null;
  readonly type?: T;
}

export const ConditionalTooltip = <
  T extends typeof ui.TooltipTypes.BRAND | typeof ui.TooltipTypes.INFO,
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
