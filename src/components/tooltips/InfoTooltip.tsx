import { ReactNode } from "react";

import classNames from "classnames";

import { ui } from "lib";

import { RootTooltip } from "./RootTooltip";

export type InfoTooltipProps = ui.TooltipProps & {
  readonly children: ReactNode;
};

export const InfoTooltip = ({ children, ...props }: InfoTooltipProps): JSX.Element => (
  <RootTooltip {...props} overlayClassName={classNames("tooltip--info", props.overlayClassName)}>
    {children}
  </RootTooltip>
);
