import classNames from "classnames";

import RootTooltip from "./RootTooltip";

const ActionTooltip = ({ children, ...props }: TooltipProps): JSX.Element => (
  <RootTooltip {...props} overlayClassName={classNames("tooltip--action", props.overlayClassName)}>
    {children}
  </RootTooltip>
);

export default ActionTooltip;
