import * as tooltip from "lib/ui/tooltip/types";

export const ItemizedTooltipItem = (props: tooltip.ItemizedTooltipItem): JSX.Element => (
  <div className="itemized-tooltip-item">
    <div className="itemized-tooltip-item__label">{props.label}</div>
    <div className="itemized-tooltip-item__value">
      {props.formatter !== undefined ? props.formatter({ value: props.value }) : props.value}
    </div>
  </div>
);
