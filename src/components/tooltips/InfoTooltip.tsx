import classNames from "classnames";

import RootTooltip from "./Tooltip";

const InfoTooltip = ({ children, ...props }: TooltipProps): JSX.Element => (
  <RootTooltip {...props} overlayClassName={classNames("tooltip--info", props.overlayClassName)}>
    {children}
  </RootTooltip>
);

export default InfoTooltip;
