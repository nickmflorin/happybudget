import React from "react";

import { ui } from "lib";

import { BrandTooltip, BrandTooltipProps } from "./BrandTooltip";
import { EntityTooltip, EntityTooltipProps } from "./EntityTooltip";
import { InfoTooltip, InfoTooltipProps } from "./InfoTooltip";

export type TooltipProps<T extends ui.TooltipType> = {
  brand: BrandTooltipProps & { readonly type?: T };
  entity: EntityTooltipProps & { readonly type: T };
  info: InfoTooltipProps & { readonly type: T };
}[T];

const Components: {
  [key in ui.TooltipType]: React.FunctionComponent<TooltipProps<key>>;
} = {
  info: InfoTooltip,
  brand: BrandTooltip,
  entity: EntityTooltip,
};

export const Tooltip = <T extends ui.TooltipType>({
  type = ui.TooltipTypes.BRAND as T,
  ...props
}: TooltipProps<T>): JSX.Element => {
  const TooltipComponent: React.FunctionComponent<TooltipProps<T>> = Components[type];
  type P = React.ComponentProps<typeof TooltipComponent>;
  return <TooltipComponent {...(props as P)} />;
};
