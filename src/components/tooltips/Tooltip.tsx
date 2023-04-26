import React from "react";

import * as tooltip from "lib/ui/tooltip/types";

import { BrandTooltip, BrandTooltipProps } from "./BrandTooltip";
import { EntityTooltip, EntityTooltipProps } from "./EntityTooltip";
import { InfoTooltip, InfoTooltipProps } from "./InfoTooltip";

export type TooltipProps<T extends tooltip.TooltipType> = {
  brand: BrandTooltipProps & { readonly type?: T };
  entity: EntityTooltipProps & { readonly type: T };
  info: InfoTooltipProps & { readonly type: T };
}[T];

const Components: {
  [key in tooltip.TooltipType]: React.FunctionComponent<TooltipProps<key>>;
} = {
  info: InfoTooltip,
  brand: BrandTooltip,
  entity: EntityTooltip,
};

export const Tooltip = <T extends tooltip.TooltipType>({
  type = tooltip.TooltipTypes.BRAND as T,
  ...props
}: TooltipProps<T>): JSX.Element => {
  const TooltipComponent: React.FunctionComponent<TooltipProps<T>> = Components[type];
  type P = React.ComponentProps<typeof TooltipComponent>;
  return <TooltipComponent {...(props as P)} />;
};
