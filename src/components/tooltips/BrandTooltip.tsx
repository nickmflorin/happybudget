import { ReactNode } from "react";

import classNames from "classnames";

import * as tooltip from "lib/ui/tooltip/types";

import { RootTooltip } from "./RootTooltip";

export type BrandTooltipProps = tooltip.TooltipProps & { readonly children: ReactNode };

export const BrandTooltip = ({ children, ...props }: BrandTooltipProps): JSX.Element => (
  <RootTooltip {...props} overlayClassName={classNames("tooltip--brand", props.overlayClassName)}>
    {children}
  </RootTooltip>
);
