import { ReactNode } from "react";

import { ui } from "lib";

import { Tooltip, TooltipProps } from "./Tooltip";

type TooltipOrContentProps<T extends typeof ui.TooltipTypes.BRAND | typeof ui.TooltipTypes.INFO> =
  Omit<TooltipProps<T>, "content"> & {
    readonly children?: ReactNode;
    readonly tooltip: ui.Tooltip;
  };

export const TooltipOrContent = <
  T extends typeof ui.TooltipTypes.BRAND | typeof ui.TooltipTypes.INFO,
>({
  tooltip,
  children,
  ...props
}: TooltipOrContentProps<T>): JSX.Element => {
  if (typeof tooltip === "function") {
    return tooltip({ children });
  } else if (typeof tooltip === "string") {
    const ps = { ...props, content: tooltip, children } as TooltipProps<T>;
    return <Tooltip<T> {...ps} />;
  }
  const ps = { ...props, ...tooltip, children } as TooltipProps<T>;
  return <Tooltip<T> {...ps} />;
};
