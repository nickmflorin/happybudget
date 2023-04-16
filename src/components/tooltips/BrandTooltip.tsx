import { ReactNode } from "react";

import classNames from "classnames";

import { ui } from "lib";

import { RootTooltip } from "./RootTooltip";

export type BrandTooltipProps = ui.TooltipProps & { readonly children: ReactNode };

export const BrandTooltip = ({ children, ...props }: BrandTooltipProps): JSX.Element => (
  <RootTooltip {...props} overlayClassName={classNames("tooltip--brand", props.overlayClassName)}>
    {children}
  </RootTooltip>
);
