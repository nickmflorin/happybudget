import ActionTooltip from "./ActionTooltip";
import InfoTooltip from "./InfoTooltip";

const TooltipComponents: { [key in TooltipType]: React.ComponentType<TooltipProps> } = {
  info: InfoTooltip,
  action: ActionTooltip,
};

const Tooltip = ({ type = "action", ...props }: TooltipProps): JSX.Element => {
  const TooltipComponent = TooltipComponents[type];
  return <TooltipComponent {...props} />;
};

export default Tooltip;
