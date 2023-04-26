import { ReactNode } from "react";

import classNames from "classnames";

import * as tooltip from "lib/ui/tooltip/types";

import { RootTooltip } from "./RootTooltip";

export type InfoTooltipProps = tooltip.TooltipProps & {
  readonly children: ReactNode;
};

export const InfoTooltip = ({ children, ...props }: InfoTooltipProps): JSX.Element => (
  <RootTooltip {...props} overlayClassName={classNames("tooltip--info", props.overlayClassName)}>
    {children}
  </RootTooltip>
);
